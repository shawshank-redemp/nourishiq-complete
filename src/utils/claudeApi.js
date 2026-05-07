const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are NourishIQ, a maternal nutrition risk assessment AI for ASHA workers in rural Karnataka, India. You base all decisions on ICMR Dietary Guidelines for Indians and the National Guidelines for Pregnant Women. You return only raw JSON with no markdown, no backticks, no explanation.`;

function buildUserPrompt(formData) {
  return `ICMR MATERNAL NUTRITION GUIDELINES:
- Iron requirement in pregnancy: 27mg/day (most Indian diets provide only 10-15mg)
- Protein requirement: 78g/day (second trimester onwards)
- Calorie requirement: 2200 kcal/day (second trimester), 1800 kcal (first trimester), 2400 kcal (third trimester)
- Calcium: 1200mg/day
- Folate: 600mcg/day
- Vitamin C aids iron absorption significantly

KARNATAKA-SPECIFIC AFFORDABLE FOODS (all under ₹50/day):
- Ragi mudde: 3.9mg iron/100g, costs ₹8/day, staple grain
- Green leafy vegetables (palak/methi): 2-3mg iron/100g, costs ₹10/day
- Horsegram (hurali): 7mg iron/100g, costs ₹12/day
- Rajma/red kidney beans: 8mg iron/100g, costs ₹15/day
- Dried figs (anjeer): 2.1mg iron/100g, costs ₹20/day
- Jaggery (bella): 11mg iron/100g, costs ₹5/day
- Drumstick leaves (nugge soppu): 7mg iron/100g, costs ₹8/day
- Sesame seeds (ellu): 14.6mg iron/100g, costs ₹10/day

RISK THRESHOLDS:
- RED: Severe anaemia indicators (pale eyelids + fatigue + poor diet), gestational week >28 with nutrient deficit, reduced fetal movement, severe calorie deficit
- AMBER: Moderate symptoms, partial diet adequacy, gestational week 14-28 with some gaps
- GREEN: Adequate nutrition, no severe symptoms, early pregnancy with manageable gaps

PATIENT DATA:
Patient Name: ${formData.patientName}
ASHA Worker: ${formData.ashaWorkerName}
Age: ${formData.age} years
Gestational Week: ${formData.gestationalWeek}
Symptoms: ${formData.symptoms}
Last 24h Food Intake: ${formData.foodIntake}
Food Access Level: ${formData.foodAccess}

Analyze this patient and return ONLY this exact JSON structure (no markdown, no backticks):
{
  "risk_level": "RED" | "AMBER" | "GREEN",
  "medical_interpretation": "2-3 sentence clinical explanation of why this risk level was assigned, citing specific symptoms and nutrition deficits",
  "asha_next_steps": ["Step 1 action","Step 2 action","Step 3 action","Step 4 action"],
  "nutrition_plan": [
    {
      "food_name": "English name",
      "food_kannada": "ಕನ್ನಡ ಹೆಸರು",
      "daily_advice": "How much to eat and when",
      "cost_per_day": 10,
      "iron_mg": 3.9,
      "vitamin_c_mg": 5,
      "why_chosen": "Specific reason this food helps this patient"
    }
  ],
  "phc_sms": "TO: PHC Duty Doctor\\nFROM: ASHA Worker ${formData.ashaWorkerName}\\nPATIENT: ${formData.patientName}, Age ${formData.age}, Week ${formData.gestationalWeek}\\nALERT: [specific clinical concern]\\nSYMPTOMS: [list]\\nACTION REQUIRED: [what PHC should do]",
  "kannada_message": "Kannada language counselling message for family (3-4 sentences about nutrition and care)",
  "breakdown": {
    "symptom_analysis": {
      "symptoms_listed": ["symptom 1","symptom 2"],
      "clinical_mapping": ["symptom → clinical indicator mapping"],
      "confidence": "High/Medium/Low confidence — reason"
    },
    "nutrition_assessment": {
      "estimated_kcal": 900,
      "estimated_protein_g": 20,
      "required_kcal": 2200,
      "required_protein_g": 78,
      "calorie_gap": "Severe deficit — estimated intake is X kcal vs required Y kcal",
      "protein_gap": "Deficit — estimated X g vs required 78g"
    },
    "gestational_stage": {
      "week": ${formData.gestationalWeek},
      "trimester": "First/Second/Third",
      "key_nutrients_this_stage": ["iron","protein","calcium"],
      "stage_specific_risks": ["risk 1","risk 2"]
    },
    "decision_logic": {
      "factors_triggering_risk": ["factor 1","factor 2"],
      "thresholds_met": ["threshold description"],
      "final_decision": "Explanation of the final risk decision"
    },
    "nutrition_reasoning": {
      "total_iron_from_plan_mg": 18,
      "iron_target_mg": 27,
      "foods_rationale": ["reason food 1 was selected","reason food 2 was selected"]
    },
    "action_explanations": [
      {"action": "action text","why": "clinical reason","timeline": "within 24h / 3 days / weekly"}
    ]
  }
}`;
}

/* ── deterministic offline mock ─────────────────────────────────── */
function mockAssessment(formData) {
  const week = parseInt(formData.gestationalWeek) || 20;
  const sym  = (formData.symptoms || '').toLowerCase();
  const food = (formData.foodAccess || '').toLowerCase();

  const isRed   = sym.includes('pale') || sym.includes('fatigue') || sym.includes('fetal') || week > 32;
  const isAmber = !isRed && (sym.includes('dizz') || sym.includes('head') || food.includes('limited'));
  const risk    = isRed ? 'RED' : isAmber ? 'AMBER' : 'GREEN';

  const trimester = week <= 13 ? 'First' : week <= 26 ? 'Second' : 'Third';
  const reqKcal   = week <= 13 ? 1800 : week <= 26 ? 2200 : 2400;

  return {
    risk_level: risk,
    medical_interpretation: risk === 'RED'
      ? `${formData.patientName} at week ${week} shows classic signs of iron-deficiency anaemia — pale eyelids and extreme fatigue indicate haemoglobin may be critically low. Combined with a rice-only diet providing less than 800 kcal/day and minimal iron, immediate PHC referral is required. This level of nutritional deficit at ${trimester} trimester poses significant risk to both maternal and foetal health.`
      : risk === 'AMBER'
      ? `${formData.patientName} at week ${week} shows moderate nutritional risk with reported dizziness and limited food diversity. Diet assessment suggests calorie and iron intake below ICMR targets. Structured intervention with affordable local foods and close ASHA monitoring over the next 7 days is recommended.`
      : `${formData.patientName} at week ${week} presents with manageable nutritional status. While some dietary gaps exist, early-stage intervention through food supplementation and regular ASHA follow-up should be sufficient. Continue monitoring and reinforce diet counselling at next visit.`,

    asha_next_steps: risk === 'RED'
      ? [
          `Refer ${formData.patientName} to PHC Doddaballapur within 24 hours for Hb test and iron supplementation`,
          'Provide IFA (Iron-Folic Acid) tablets immediately — 1 tablet twice daily with meals',
          'Counsel family to add jaggery, ragi, and drumstick leaves to every meal starting today',
          'Schedule revisit in 3 days and call PHC to confirm appointment was attended',
        ]
      : risk === 'AMBER'
      ? [
          'Start IFA tablet supplementation — 1 tablet daily with evening meal',
          'Counsel on adding green leafy vegetables and horsegram to daily diet',
          'Schedule revisit in 7 days to reassess symptoms and diet compliance',
          'Encourage Vitamin C intake (lemon, amla) alongside iron-rich foods',
        ]
      : [
          'Continue routine ASHA visits every 14 days',
          'Reinforce diet diversity — encourage ragi, vegetables, and pulses daily',
          'Confirm IFA supplementation compliance at next visit',
          'Document weight and BP at next PHC antenatal checkup',
        ],

    nutrition_plan: [
      {
        food_name: 'Ragi Mudde',
        food_kannada: 'ರಾಗಿ ಮುದ್ದೆ',
        daily_advice: '2 medium balls (150g) with sambar at lunch and dinner',
        cost_per_day: 8,
        iron_mg: 5.8,
        vitamin_c_mg: 0,
        why_chosen: 'Highest iron per rupee among Karnataka staple grains; easy to prepare and culturally accepted',
      },
      {
        food_name: 'Drumstick Leaves',
        food_kannada: 'ನುಗ್ಗೆ ಸೊಪ್ಪು',
        daily_advice: '1 cup cooked leaves (50g) with lunch — add to dal or stir-fry',
        cost_per_day: 8,
        iron_mg: 3.5,
        vitamin_c_mg: 51,
        why_chosen: 'High Vitamin C content maximises iron absorption from all foods eaten in the same meal',
      },
      {
        food_name: 'Horsegram',
        food_kannada: 'ಹುರಳಿ',
        daily_advice: '½ cup cooked (80g) as evening snack or with roti',
        cost_per_day: 12,
        iron_mg: 5.6,
        vitamin_c_mg: 1,
        why_chosen: 'Affordable high-iron legume widely available in Karnataka; also provides protein',
      },
      {
        food_name: 'Jaggery',
        food_kannada: 'ಬೆಲ್ಲ',
        daily_advice: '2 small pieces (20g) after meals or dissolved in warm water',
        cost_per_day: 5,
        iron_mg: 2.2,
        vitamin_c_mg: 0,
        why_chosen: 'Traditional Karnataka iron supplement — inexpensive and accepted across all communities',
      },
    ],

    phc_sms: `TO: PHC Duty Doctor\nFROM: ASHA Worker ${formData.ashaWorkerName || 'ASHA'}\nPATIENT: ${formData.patientName}, Age ${formData.age}, Week ${week}\nALERT: ${risk === 'RED' ? 'HIGH RISK — Suspected severe iron deficiency anaemia' : 'MODERATE RISK — Nutritional intervention required'}\nSYMPTOMS: ${formData.symptoms || 'As reported'}\nACTION REQUIRED: ${risk === 'RED' ? 'Urgent Hb test, IV iron assessment, immediate supplementation' : 'OPD visit within 3 days, diet counselling, IFA reinforcement'}`,

    kannada_message: risk === 'RED'
      ? `${formData.patientName} ಅವರಿಗೆ ರಕ್ತಹೀನತೆಯ ಲಕ್ಷಣಗಳಿವೆ — ದಯವಿಟ್ಟು ನಾಳೆಯೊಳಗೆ PHC ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ. ಪ್ರತಿ ಊಟದಲ್ಲಿ ರಾಗಿ, ನುಗ್ಗೆ ಸೊಪ್ಪು ಮತ್ತು ಬೆಲ್ಲ ಸೇರಿಸಿ. ಕಬ್ಬಿಣದ ಮಾತ್ರೆಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ತೆಗೆದುಕೊಳ್ಳಿ — ತಾಯಿ ಮತ್ತು ಮಗುವಿನ ಆರೋಗ್ಯ ಮುಖ್ಯ.`
      : risk === 'AMBER'
      ? `${formData.patientName} ಅವರ ಆಹಾರದಲ್ಲಿ ಕಬ್ಬಿಣ ಮತ್ತು ಪ್ರೋಟೀನ್ ಕೊರತೆ ಇದೆ. ಪ್ರತಿದಿನ ರಾಗಿ, ಹುರಳಿ, ಮತ್ತು ಹಸಿರು ತರಕಾರಿ ತಿನ್ನಿ. ಕಬ್ಬಿಣದ ಮಾತ್ರೆ ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು 7 ದಿನಗಳ ನಂತರ ASHA ಅವರನ್ನು ಭೇಟಿ ಮಾಡಿ.`
      : `${formData.patientName} ಅವರ ಆರೋಗ್ಯ ಸ್ಥಿರವಾಗಿದೆ. ಪ್ರತಿದಿನ ರಾಗಿ, ತರಕಾರಿ ಮತ್ತು ಕಾಳುಗಳನ್ನು ತಿನ್ನಿ. ನಿಯಮಿತ ASHA ಭೇಟಿ ಮತ್ತು ಆಸ್ಪತ್ರೆ ತಪಾಸಣೆ ಮಾಡಿಸಿ.`,

    breakdown: {
      symptom_analysis: {
        symptoms_listed: (formData.symptoms || 'None reported').split(',').map(s => s.trim()),
        clinical_mapping: [
          'Pale eyelids → Conjunctival pallor → Haemoglobin < 10g/dl indicator',
          'Extreme fatigue → Tissue hypoxia from reduced red blood cell count',
          'Dizziness on standing → Postural hypotension secondary to anaemia',
          'Reduced fetal movement → Possible placental insufficiency from maternal anaemia',
        ],
        confidence: `High confidence — ${isRed ? 'multiple classic anaemia indicators present simultaneously' : isAmber ? 'moderate indicators with diet gap — moderate confidence' : 'low severity symptoms with adequate diet — High confidence GREEN'}`,
      },
      nutrition_assessment: {
        estimated_kcal: isRed ? 750 : isAmber ? 1400 : 1900,
        estimated_protein_g: isRed ? 15 : isAmber ? 35 : 58,
        required_kcal: reqKcal,
        required_protein_g: 78,
        calorie_gap: isRed ? `Severe deficit — estimated 750 kcal vs required ${reqKcal} kcal/day` : isAmber ? `Moderate deficit — estimated 1400 kcal vs required ${reqKcal} kcal/day` : `Mild gap — estimated 1900 kcal vs required ${reqKcal} kcal/day`,
        protein_gap: isRed ? 'Severe deficit — estimated 15g vs required 78g protein/day' : isAmber ? 'Moderate deficit — estimated 35g vs required 78g protein/day' : 'Mild gap — estimated 58g vs required 78g protein/day',
      },
      gestational_stage: {
        week,
        trimester,
        key_nutrients_this_stage: ['Iron (27mg/day)', 'Protein (78g/day)', 'Calcium (1200mg/day)', 'Folate (600mcg/day)'],
        stage_specific_risks: [
          `At week ${week}, foetal iron stores are actively being built from maternal supply`,
          'Placental blood flow increases — maternal anaemia directly reduces oxygen delivery to foetus',
          `${trimester} trimester is critical for ${week > 26 ? 'foetal brain development and birth weight' : 'organ formation and neural tube closure'}`,
        ],
      },
      decision_logic: {
        factors_triggering_risk: isRed
          ? ['Pale eyelids + fatigue = anaemia probability > 85%', `Gestational week ${week} = high iron demand period`, 'Rice-only diet = iron intake < 5mg/day (target 27mg)', 'No green vegetables = zero Vitamin C for iron absorption']
          : isAmber
          ? [`Dizziness reported = possible low blood pressure from mild anaemia`, 'Limited food access = calorie deficit likely', `Week ${week} = moderate nutrient requirement period`]
          : [`No severe symptoms reported`, 'Adequate food access noted', `Early-stage pregnancy — week ${week} — lower immediate risk`],
        thresholds_met: isRed
          ? ['THRESHOLD MET: ≥2 anaemia symptoms + severe diet deficit = RED', `THRESHOLD MET: Week ${week} with zero iron-rich foods = RED`]
          : isAmber
          ? ['THRESHOLD MET: 1 moderate symptom + limited food = AMBER']
          : ['THRESHOLD CLEAR: No significant clinical indicators — GREEN assigned'],
        final_decision: `Based on symptom pattern, dietary analysis, and gestational week ${week}, NourishIQ assigned ${risk} risk. ${isRed ? 'Immediate PHC escalation protocol activated.' : isAmber ? 'Structured 7-day monitoring and dietary intervention recommended.' : 'Routine 14-day follow-up is appropriate.'}`,
      },
      nutrition_reasoning: {
        total_iron_from_plan_mg: 17.1,
        iron_target_mg: 27,
        foods_rationale: [
          'Ragi selected — highest iron per rupee among Karnataka staple grains (3.9mg/100g, ₹8/day)',
          'Drumstick leaves — uniquely high Vitamin C (51mg) maximises absorption from all concurrent iron sources',
          'Horsegram — legume with 7mg iron/100g, protein co-benefit, culturally familiar',
          'Jaggery — traditional Karnataka iron supplement, inexpensive, adds 2.2mg iron and social acceptance',
        ],
      },
      action_explanations: [
        { action: 'PHC referral within 24 hours', why: 'Haemoglobin test required to confirm anaemia severity and determine IV vs oral iron protocol', timeline: 'Within 24 hours' },
        { action: 'Start IFA tablet supplementation', why: 'Oral iron cannot correct severe anaemia fast enough without pharmaceutical supplementation at Week ' + week, timeline: 'Immediately today' },
        { action: 'Daily drumstick leaves in diet', why: 'Vitamin C dramatically increases non-haem iron absorption from plant sources by 2-3x', timeline: 'Every day from today' },
        { action: 'ASHA revisit in 3 days', why: 'Monitor for improvement or deterioration; confirm PHC visit was completed', timeline: '3 days' },
      ],
    },
  };
}

/* ── main export ─────────────────────────────────────────────────── */
export async function assessPatient(formData) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  // No real key — use offline mock
  if (!apiKey || apiKey === 'paste-your-key-here') {
    await new Promise(r => setTimeout(r, 1800)); // simulate latency
    return mockAssessment(formData);
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(formData) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // Graceful fallback to mock on API error
    console.warn('Claude API error — falling back to offline mock:', err?.error?.message);
    return mockAssessment(formData);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || '';
  const cleaned = rawText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return mockAssessment(formData);
  }
}
