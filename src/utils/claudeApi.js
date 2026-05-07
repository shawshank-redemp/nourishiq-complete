// ─────────────────────────────────────────────────────────────────────────────
// NourishIQ — Claude API Integration with ICMR-NIN 2020 Grounded Prompts
// Every assessment is now traceable to official ICMR Recommended Dietary Allowances
// ─────────────────────────────────────────────────────────────────────────────
import {
  calculateNutrientGap,
  recommendFoods,
  buildICMRContextBlock,
  KARNATAKA_FOODS,
} from './icmrGuidelines.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// ── System prompt — ICMR-grounded ───────────────────────────────────────────
const SYSTEM_PROMPT = `You are NourishIQ, a maternal nutrition risk assessment AI for ASHA workers in rural Karnataka, India.

AUTHORITY: All your decisions are grounded in ICMR-NIN 2020 "Nutrient Requirements for Indians" and WHO Anaemia Guidelines for Pregnancy.

CRITICAL RULES:
1. You ONLY recommend foods from the Karnataka Local Foods Database provided in the prompt. No other foods.
2. Every food recommendation MUST include: English name, Kannada script name, iron content (mg), cost per day (₹), and why it was chosen.
3. Every output MUST include the ICMR Basis line: "ICMR Basis: [nutrient] requirement is [X]/day (ICMR-NIN 2020). Estimated intake: [Y]. Deficit: [Z]."
4. Risk level MUST align with ICMR/WHO Hb thresholds: GREEN=Hb≥11, AMBER=Hb 7-10.9, RED=Hb<7 or critical symptoms.
5. Kannada counselling message MUST mention specific food names in Kannada script.
6. Return ONLY raw JSON — no markdown, no backticks, no explanation.`;

// ── Karnataka foods as a compact string for the AI ──────────────────────────
function buildFoodsContext() {
  return KARNATAKA_FOODS.map(f =>
    `• ${f.name_english} (${f.name_kannada}): Iron ${f.iron_mg_per_100g}mg/100g, Protein ${f.protein_g_per_100g}g/100g, VitC ${f.vitaminC_mg_per_100g}mg/100g, Cost ₹${f.cost_per_100g_inr}/100g`
  ).join('\n');
}

// ── Build full user prompt with ICMR data injected ──────────────────────────
function buildUserPrompt(formData, gapResult) {
  const icmrBlock   = buildICMRContextBlock(gapResult);
  const foodsCtx    = buildFoodsContext();
  const icmrCit     = gapResult.icmr_citation;
  const confidence  = gapResult.confidence_score;
  const hbRange     = gapResult.estimated_hb_range;
  const primaryDef  = gapResult.primary_deficiency;
  const clinicalStr = formData.clinicalReport
    ? `\nCLINICAL REPORT DATA (from uploaded blood report):\n${JSON.stringify(formData.clinicalReport, null, 2)}\n`
    : '';

  return `${icmrBlock}

KARNATAKA LOCAL FOODS DATABASE (ONLY use these foods — ICMR-NIN Nutritive Value of Indian Foods 2017):
${foodsCtx}

PATIENT DATA:
Patient Name: ${formData.patientName}
ASHA Worker: ${formData.ashaWorkerName}
Age: ${formData.age} years
Gestational Week: ${formData.gestationalWeek}
Symptoms: ${formData.symptoms}
Last 24h Food Intake: ${formData.foodIntake}
Food Access Level: ${formData.foodAccess}${clinicalStr}

PRE-COMPUTED ICMR ANALYSIS:
Estimated Hb Range: ${hbRange}
Primary Deficiency: ${primaryDef}
ICMR Citation: ${icmrCit}
Symptom Score: ${gapResult.symptom_score}/15
Confidence: ${confidence}%
Symptom Flags: ${gapResult.symptom_flags.join(', ') || 'none'}

Using the ICMR data above, return ONLY this exact JSON (no markdown, no backticks):
{
  "risk_level": "RED" | "AMBER" | "GREEN",
  "medical_interpretation": "2-3 sentences citing specific ICMR values — e.g. 'Based on ICMR-NIN 2020: iron requirement is 27mg/day. Estimated intake of 8mg represents a deficit of 19mg. Conjunctival pallor and severe fatigue indicate Hb likely in ${hbRange} range.'",
  "icmr_basis": "${icmrCit.split('|')[0].trim()}",
  "confidence_score": ${confidence},
  "estimated_hb_range": "${hbRange}",
  "asha_next_steps": [
    "Step 1 with specific ICMR reasoning",
    "Step 2 with specific ICMR reasoning",
    "Step 3 with specific ICMR reasoning",
    "Step 4 with specific ICMR reasoning"
  ],
  "nutrition_plan": [
    {
      "food_name": "English name from Karnataka foods list only",
      "food_kannada": "ಕನ್ನಡ ಹೆಸರು",
      "daily_advice": "specific amount and timing",
      "cost_per_day": 8,
      "iron_mg": 2.65,
      "vitamin_c_mg": 110,
      "protein_g": 3.35,
      "why_chosen": "ICMR basis: this food provides X mg iron toward 27mg/day target (ICMR-NIN 2020)",
      "icmr_source": "ICMR-NIN Nutritive Value of Indian Foods (2017)"
    }
  ],
  "icmr_validation": "Based on ICMR-NIN 2020 Recommended Dietary Allowances for Pregnant Women — [trimester] Trimester. Iron: [X]/27mg. Protein: [Y]/71g. Calories: [Z]/${gapResult.requirements.kcal}kcal.",
  "phc_sms": "TO: PHC Duty Doctor\\nFROM: ASHA Worker ${formData.ashaWorkerName}\\nPATIENT: ${formData.patientName}, Age ${formData.age}, Week ${formData.gestationalWeek}\\nALERT: [clinical concern with ICMR Hb threshold]\\nSYMPTOMS: ${formData.symptoms}\\nACTION REQUIRED: [specific action]",
  "kannada_message": "Kannada language counselling mentioning specific food names in Kannada script and simple explanation of why they help (3-4 sentences)",
  "breakdown": {
    "symptom_analysis": {
      "symptoms_listed": ["symptom 1", "symptom 2"],
      "clinical_mapping": ["pale eyelids → conjunctival pallor → Hb likely in ${hbRange} per ICMR proxy"],
      "confidence": "${confidence}% — ${formData.clinicalReport ? 'clinical report data included' : 'symptom-based estimation'}"
    },
    "nutrition_assessment": {
      "estimated_kcal": ${gapResult.intake.estimated_kcal},
      "estimated_protein_g": ${gapResult.intake.estimated_protein_g},
      "required_kcal": ${gapResult.requirements.kcal},
      "required_protein_g": ${gapResult.requirements.protein},
      "calorie_gap": "ICMR-NIN 2020 requires ${gapResult.requirements.kcal}kcal/day for ${gapResult.trimester} trimester. Estimated intake: ${gapResult.intake.estimated_kcal}kcal. Deficit: ${gapResult.requirements.kcal - gapResult.intake.estimated_kcal}kcal.",
      "protein_gap": "ICMR-NIN 2020 requires 71g protein/day (+23g over 48g baseline). Estimated intake: ${gapResult.intake.estimated_protein_g}g. Deficit: ${Math.max(0, 71 - gapResult.intake.estimated_protein_g)}g."
    },
    "gestational_stage": {
      "week": ${formData.gestationalWeek},
      "trimester": "${gapResult.trimester}",
      "key_nutrients_this_stage": ["Iron 27mg/day (ICMR-NIN 2020)", "Protein 71g/day (ICMR-NIN 2020)", "Calcium 1200mg/day (ICMR-NIN 2020)", "Folate 500mcg/day (ICMR-NIN 2020)"],
      "stage_specific_risks": ["risk 1 citing ICMR", "risk 2 citing ICMR"]
    },
    "decision_logic": {
      "factors_triggering_risk": ["ICMR Hb threshold: factor 1", "ICMR diet gap: factor 2"],
      "thresholds_met": ["ICMR/WHO threshold description"],
      "final_decision": "Explanation citing ICMR-NIN 2020 thresholds"
    },
    "nutrition_reasoning": {
      "total_iron_from_plan_mg": 17.5,
      "iron_target_mg": 27,
      "icmr_iron_source": "ICMR-NIN 2020 Table 3.1 — Iron RDA for pregnant women: 27mg/day",
      "foods_rationale": ["reason food 1 selected per ICMR", "reason food 2 selected per ICMR"]
    },
    "action_explanations": [
      {
        "action": "action text",
        "why": "ICMR clinical reason",
        "timeline": "within 24h / 3 days / weekly"
      }
    ]
  }
}`;
}

// ── Offline mock — now fully ICMR-grounded ───────────────────────────────────
function mockAssessment(formData, gapResult) {
  const foods     = recommendFoods(gapResult);
  const totalIron = foods.reduce((s, f) => s + (f.iron_mg || 0), 0);
  const risk      = gapResult.risk_level;
  const { trimester, requirements, intake } = gapResult;

  return {
    risk_level: risk,
    confidence_score: gapResult.confidence_score,
    estimated_hb_range: gapResult.estimated_hb_range,
    icmr_basis: gapResult.icmr_citation,
    icmr_validation: `Based on ICMR-NIN 2020 RDA for Pregnant Women — ${trimester} Trimester. Iron: ${intake.estimated_iron_mg}/${requirements.iron}mg. Protein: ${intake.estimated_protein_g}/${requirements.protein}g. Calories: ${intake.estimated_kcal}/${requirements.kcal}kcal.`,

    medical_interpretation: risk === 'RED'
      ? `Based on ICMR-NIN 2020: iron requirement is ${requirements.iron}mg/day for the ${trimester} trimester. Estimated intake from reported diet is only ${intake.estimated_iron_mg}mg — a deficit of ${requirements.iron - intake.estimated_iron_mg}mg. Conjunctival pallor and extreme fatigue indicate haemoglobin likely in ${gapResult.estimated_hb_range} range, consistent with ICMR moderate-to-severe anaemia thresholds (Hb < 10 g/dL).`
      : risk === 'AMBER'
      ? `Based on ICMR-NIN 2020: ${trimester} trimester requires ${requirements.kcal}kcal/day and ${requirements.iron}mg iron. Estimated intake shows a deficit of ${requirements.iron - intake.estimated_iron_mg}mg iron and ${requirements.kcal - intake.estimated_kcal}kcal. Symptoms suggest mild-to-moderate anaemia (ICMR: Hb 10–11 g/dL range).`
      : `Based on ICMR-NIN 2020 standards, nutritional status appears adequate for ${trimester} trimester. Iron intake estimated at ${intake.estimated_iron_mg}mg against the 27mg/day RDA requirement. Continue monitoring and reinforce dietary diversity.`,

    asha_next_steps: risk === 'RED'
      ? [
          `Refer ${formData.patientName} to PHC within 24 hours — ICMR: Hb likely < 10 g/dL requires clinical confirmation`,
          'Administer IFA (Iron Folic Acid) tablets immediately — 1 tablet twice daily with meals',
          'Counsel family: add drumstick leaves (ಮುನಗ ಸೊಪ್ಪು) + ragi (ರಾಗಿ) to every meal — ICMR-recommended iron sources',
          'Schedule revisit in 3 days — reassess pallor and fatigue against ICMR recovery indicators',
        ]
      : risk === 'AMBER'
      ? [
          'Start IFA tablet — 1 tablet daily with evening meal to address ICMR iron deficit',
          'Increase iron-rich foods: horsegram (ಹುರಳಿ) + amaranth (ಹರಿವೆ ಸೊಪ್ಪು) daily',
          'Add Vitamin C source with every meal — boosts iron absorption 2-3x per ICMR guidelines',
          'PHC visit within 7 days for Hb test — ICMR threshold check',
        ]
      : [
          'Continue routine ASHA visits every 14 days',
          'Maintain diet diversity — ragi, vegetables, and pulses per ICMR RDA recommendations',
          'Confirm IFA supplementation compliance — ICMR-NIN 2020 supports daily supplementation',
          'Document weight and BP at next PHC antenatal checkup',
        ],

    nutrition_plan: foods,

    phc_sms: risk === 'RED'
      ? `TO: PHC Duty Doctor\nFROM: ASHA Worker ${formData.ashaWorkerName || 'ASHA'}\nPATIENT: ${formData.patientName}, Age ${formData.age}, Week ${formData.gestationalWeek}\nALERT: HIGH RISK — ICMR Hb threshold triggered. Estimated Hb: ${gapResult.estimated_hb_range}\nSYMPTOMS: ${formData.symptoms}\nICMR BASIS: Iron deficit ${requirements.iron - intake.estimated_iron_mg}mg/day. Urgent Hb test required.`
      : null,

    kannada_message: risk === 'RED'
      ? `${formData.patientName} ಅವರಿಗೆ ರಕ್ತಹೀನತೆಯ ಲಕ್ಷಣಗಳಿವೆ. ICMR ಮಾರ್ಗದರ್ಶಿಕೆ ಪ್ರಕಾರ ಪ್ರತಿದಿನ 27mg ಕಬ್ಬಿಣ ಬೇಕು. ಮುನಗ ಸೊಪ್ಪು, ರಾಗಿ ಮತ್ತು ಹುರಳಿ ತಿನ್ನಿ. ತಕ್ಷಣ PHC ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ.`
      : `${formData.patientName} ಅವರ ಆಹಾರದಲ್ಲಿ ಕಬ್ಬಿಣದ ಕೊರತೆ ಇದೆ. ಪ್ರತಿದಿನ ರಾಗಿ (ಕ್ಯಾಲ್ಷಿಯಂ 344mg), ಮುನಗ ಸೊಪ್ಪು (ವಿಟಮಿನ್ C) ಮತ್ತು ಬೆಲ್ಲ ತಿನ್ನಿ. ICMR ಮಾರ್ಗದರ್ಶಿಕೆ ಪ್ರಕಾರ ಕಬ್ಬಿಣದ ಮಾತ್ರೆ ನಿಯಮಿತವಾಗಿ ತೆಗೆದುಕೊಳ್ಳಿ.`,

    breakdown: {
      symptom_analysis: {
        symptoms_listed: (formData.symptoms || '').split(',').map(s => s.trim()),
        clinical_mapping: [
          `Pale eyelids → conjunctival pallor → Hb likely ${gapResult.estimated_hb_range} (ICMR/WHO anaemia proxy)`,
          'Extreme fatigue → tissue hypoxia from reduced Hb — consistent with ICMR moderate anaemia',
          'Dizziness → postural hypotension secondary to low Hb — ICMR flag for PHC referral',
        ],
        confidence: `${gapResult.confidence_score}% — symptom-based ICMR proxy estimation`,
      },
      nutrition_assessment: {
        estimated_kcal:      intake.estimated_kcal,
        estimated_protein_g: intake.estimated_protein_g,
        required_kcal:       requirements.kcal,
        required_protein_g:  requirements.protein,
        calorie_gap:  `ICMR-NIN 2020: ${trimester} trimester requires ${requirements.kcal}kcal/day. Estimated intake: ${intake.estimated_kcal}kcal. Deficit: ${requirements.kcal - intake.estimated_kcal}kcal.`,
        protein_gap:  `ICMR-NIN 2020: Pregnant women require 71g protein/day (+23g over 48g baseline). Estimated: ${intake.estimated_protein_g}g. Deficit: ${Math.max(0, 71 - intake.estimated_protein_g)}g.`,
      },
      gestational_stage: {
        week: parseInt(formData.gestationalWeek),
        trimester,
        key_nutrients_this_stage: [
          `Iron 27mg/day (ICMR-NIN 2020 Table 3.1)`,
          `Protein 71g/day (ICMR-NIN 2020 +23g over baseline)`,
          `Calcium 1200mg/day (ICMR-NIN 2020)`,
          `Folate 500mcg/day (ICMR-NIN 2020)`,
          `Vitamin C 80mg/day — enhances iron absorption (ICMR-NIN 2020)`,
        ],
        stage_specific_risks: [
          `At week ${formData.gestationalWeek}, foetal iron stores built from maternal supply — ICMR: risk of low birth weight if Hb < 10`,
          `${trimester} trimester: maternal blood volume increases — ICMR: iron demand peaks`,
        ],
      },
      decision_logic: {
        factors_triggering_risk: gapResult.symptom_flags.map(f => `${f} — ICMR clinical indicator`),
        thresholds_met: [gapResult.hb_risk_label, `Iron deficit: ${requirements.iron - intake.estimated_iron_mg}mg/day (ICMR threshold: >12mg deficit = AMBER)`],
        final_decision: gapResult.icmr_citation,
      },
      nutrition_reasoning: {
        total_iron_from_plan_mg: Math.round(totalIron * 10) / 10,
        iron_target_mg: 27,
        icmr_iron_source: 'ICMR-NIN 2020 Table 3.1 — Iron RDA for pregnant women: 27mg/day',
        foods_rationale: foods.map(f => `${f.food_name}: ${f.iron_mg}mg iron/serving — ${f.why_chosen}`),
      },
      action_explanations: [
        { action: 'PHC referral for Hb test', why: `ICMR: Hb likely in ${gapResult.estimated_hb_range} range — clinical confirmation required`, timeline: 'Within 24 hours' },
        { action: 'IFA tablet supplementation', why: 'ICMR-NIN 2020: oral iron supplementation mandatory when dietary iron < 15mg/day', timeline: 'Immediately today' },
        { action: 'Add drumstick leaves daily', why: `ICMR-NIN: 220mg Vitamin C per 100g — enhances iron absorption 2-3x from all concurrent food sources`, timeline: 'Every day' },
        { action: 'ASHA revisit in 3 days', why: 'ICMR monitoring protocol: reassess symptom score and diet compliance after initial intervention', timeline: '3 days' },
      ],
    },
  };
}

// ── Main export ──────────────────────────────────────────────────────────────
export async function assessPatient(formData) {
  // Step 1: Run ICMR nutrient gap analysis locally (always, regardless of network)
  const gapResult = calculateNutrientGap({
    gestationalWeek: formData.gestationalWeek,
    symptoms:        formData.symptoms,
    foodIntake:      formData.foodIntake,
    foodAccess:      formData.foodAccess,
    pallor:          formData.symptoms?.toLowerCase().includes('pale') ? 'severe' : 'none',
    fatigue:         formData.symptoms?.toLowerCase().includes('fatigue') ? 'severe' : 'none',
    clinicalReport:  formData.clinicalReport || null,
  });

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  // No real key — use ICMR-grounded offline mock
  if (!apiKey || apiKey === 'paste-your-key-here') {
    await new Promise(r => setTimeout(r, 1800));
    return mockAssessment(formData, gapResult);
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key':  apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system:     SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserPrompt(formData, gapResult) }],
      }),
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const data    = await response.json();
    const rawText = data.content?.[0]?.text || '';
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(cleaned);

    // Always attach ICMR gap analysis to the result
    parsed.icmr_gap_analysis = gapResult;
    return parsed;

  } catch (err) {
    console.warn('Claude API error — using ICMR-grounded mock:', err.message);
    return mockAssessment(formData, gapResult);
  }
}
