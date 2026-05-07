// ─────────────────────────────────────────────────────────────────────────────
// NourishIQ — ICMR-NIN 2020 Official Guidelines Data Module
// Source: "Nutrient Requirements for Indians" — ICMR-NIN, Hyderabad, 2020
// All values are official RDA (Recommended Dietary Allowances) for pregnant women
// ─────────────────────────────────────────────────────────────────────────────

// ── ICMR 2020 RDA for Pregnant Women ────────────────────────────────────────
export const ICMR_RDA = {
  iron:      { value: 27,   unit: 'mg/day',  source: 'ICMR-NIN 2020, Table 3.1' },
  protein:   { value: 71,   unit: 'g/day',   source: 'ICMR-NIN 2020 (+23g over 48g baseline)', note: 'Additional 23g/day over non-pregnant baseline of 48g/day' },
  calcium:   { value: 1200, unit: 'mg/day',  source: 'ICMR-NIN 2020, Table 3.1' },
  folate:    { value: 500,  unit: 'mcg/day', source: 'ICMR-NIN 2020, Table 3.1' },
  vitaminC:  { value: 80,   unit: 'mg/day',  source: 'ICMR-NIN 2020, Table 3.1', note: 'Enhances non-haem iron absorption by 2-3x' },
  zinc:      { value: 12,   unit: 'mg/day',  source: 'ICMR-NIN 2020, Table 3.1' },
  // Calorie requirements by trimester (ICMR-NIN 2020)
  calories: {
    trimester1: { value: 2100, unit: 'kcal/day', source: 'ICMR-NIN 2020, Trimester 1 additional 85kcal/day' },
    trimester2: { value: 2300, unit: 'kcal/day', source: 'ICMR-NIN 2020, Trimester 2 additional 285kcal/day' },
    trimester3: { value: 2500, unit: 'kcal/day', source: 'ICMR-NIN 2020, Trimester 3 additional 475kcal/day' },
  },
};

// ── ICMR / WHO Haemoglobin Thresholds for Anaemia in Pregnancy ──────────────
export const HB_THRESHOLDS = {
  // Source: WHO 2011 + ICMR-NIN 2020 combined guidelines
  normal:   { min: 11.0, label: 'Normal',           risk: 'GREEN', description: 'Hb ≥ 11 g/dL — No anaemia' },
  mild:     { min: 10.0, max: 10.9, label: 'Mild Anaemia',     risk: 'AMBER', description: 'Hb 10.0–10.9 g/dL' },
  moderate: { min: 7.0,  max: 9.9,  label: 'Moderate Anaemia', risk: 'AMBER', description: 'Hb 7.0–9.9 g/dL' },
  severe:   { max: 6.9,  label: 'Severe Anaemia',   risk: 'RED',   description: 'Hb < 7 g/dL — Emergency' },
};

// ── Karnataka Local Foods Database ──────────────────────────────────────────
// Source: ICMR-NIN Nutritive Value of Indian Foods (2017) + local market prices
export const KARNATAKA_FOODS = [
  {
    id: 'drumstick_leaves',
    name_english: 'Drumstick Leaves',
    name_kannada: 'ಮುನಗ ಸೊಪ್ಪು',
    iron_mg_per_100g:    5.3,   // ICMR-NIN Nutritive Value of Indian Foods, p.42
    calcium_mg_per_100g: 440,
    protein_g_per_100g:  6.7,
    vitaminC_mg_per_100g: 220,
    folate_mcg_per_100g: 44,
    calories_per_100g:   26,
    cost_per_100g_inr:   5,
    serving_g:           50,    // realistic daily serving
    why_chosen: 'Highest Vitamin C in Karnataka greens — boosts iron absorption 2-3x when eaten with iron foods',
    availability: 'Year-round, widely available in Karnataka villages',
  },
  {
    id: 'ragi',
    name_english: 'Ragi (Finger Millet)',
    name_kannada: 'ರಾಗಿ',
    iron_mg_per_100g:    3.9,   // ICMR-NIN Nutritive Value of Indian Foods, p.18
    calcium_mg_per_100g: 344,   // highest calcium among cereals
    protein_g_per_100g:  7.3,
    vitaminC_mg_per_100g: 0,
    folate_mcg_per_100g: 18,
    calories_per_100g:   328,
    cost_per_100g_inr:   4,
    serving_g:           150,   // 2 ragi mudde balls
    why_chosen: 'Staple Karnataka grain — highest calcium cereal (344mg/100g) + iron + calories',
    availability: 'Universally available across Karnataka, culturally accepted',
  },
  {
    id: 'jaggery',
    name_english: 'Jaggery',
    name_kannada: 'ಬೆಲ್ಲ',
    iron_mg_per_100g:    2.8,   // ICMR-NIN Nutritive Value of Indian Foods, p.91
    calcium_mg_per_100g: 80,
    protein_g_per_100g:  0.4,
    vitaminC_mg_per_100g: 0,
    folate_mcg_per_100g: 0,
    calories_per_100g:   383,
    cost_per_100g_inr:   6,
    serving_g:           20,    // 2 small pieces
    why_chosen: 'Traditional Karnataka iron supplement — inexpensive, culturally embedded in diet',
    availability: 'Available at all village kirana stores',
  },
  {
    id: 'horsegram',
    name_english: 'Horsegram',
    name_kannada: 'ಹುರಳಿ',
    iron_mg_per_100g:    6.7,   // ICMR-NIN Nutritive Value of Indian Foods, p.29
    calcium_mg_per_100g: 287,
    protein_g_per_100g:  22.0,  // highest protein in local legumes
    vitaminC_mg_per_100g: 0,
    folate_mcg_per_100g: 0,
    calories_per_100g:   321,
    cost_per_100g_inr:   8,
    serving_g:           80,    // cooked half cup
    why_chosen: 'Highest iron legume available in Karnataka (6.7mg/100g) + 22g protein per 100g',
    availability: 'Widely grown and consumed across Karnataka',
  },
  {
    id: 'amaranth_leaves',
    name_english: 'Amaranth Leaves',
    name_kannada: 'ಹರಿವೆ ಸೊಪ್ಪು',
    iron_mg_per_100g:    3.8,   // ICMR-NIN Nutritive Value of Indian Foods, p.44
    calcium_mg_per_100g: 397,
    protein_g_per_100g:  4.0,
    vitaminC_mg_per_100g: 99,
    folate_mcg_per_100g: 85,
    calories_per_100g:   45,
    cost_per_100g_inr:   4,
    serving_g:           100,
    why_chosen: 'High iron + highest folate among local greens — critical for neural tube development',
    availability: 'Available across Karnataka, grows easily in home gardens',
  },
  {
    id: 'spinach_dal',
    name_english: 'Spinach Dal',
    name_kannada: 'ಪಾಲಕ್ ಸಾರು',
    iron_mg_per_100g:    2.7,   // ICMR-NIN Nutritive Value of Indian Foods, p.43
    calcium_mg_per_100g: 73,
    protein_g_per_100g:  8.0,
    vitaminC_mg_per_100g: 28,
    folate_mcg_per_100g: 194,
    calories_per_100g:   73,
    cost_per_100g_inr:   6,
    serving_g:           150,
    why_chosen: 'Folate-rich (194mcg/100g) — essential for fetal brain development; pairs well with rice',
    availability: 'Common Karnataka vegetable, affordable year-round',
  },
  {
    id: 'groundnuts',
    name_english: 'Groundnuts',
    name_kannada: 'ಕಡಲೆಕಾಯಿ',
    iron_mg_per_100g:    2.5,   // ICMR-NIN Nutritive Value of Indian Foods, p.31
    calcium_mg_per_100g: 90,
    protein_g_per_100g:  25.0,
    vitaminC_mg_per_100g: 0,
    folate_mcg_per_100g: 145,
    calories_per_100g:   567,
    cost_per_100g_inr:   12,
    serving_g:           30,    // small handful
    why_chosen: 'Dense protein (25g/100g) + folate — calorie-efficient for underweight patients',
    availability: 'Universally available across Karnataka',
  },
  {
    id: 'beetroot',
    name_english: 'Beetroot',
    name_kannada: 'ಬೀಟ್‌ರೂಟ್',
    iron_mg_per_100g:    0.8,   // ICMR-NIN Nutritive Value of Indian Foods, p.57
    calcium_mg_per_100g: 18,
    protein_g_per_100g:  1.7,
    vitaminC_mg_per_100g: 4.9,
    folate_mcg_per_100g: 109,   // highest folate per 100g among root vegetables
    calories_per_100g:   43,
    cost_per_100g_inr:   5,
    serving_g:           100,
    why_chosen: 'Highest folate root vegetable (109mcg/100g) — important for DNA synthesis in fetal development',
    availability: 'Widely available in Karnataka markets',
  },
  {
    id: 'curry_leaves',
    name_english: 'Curry Leaves',
    name_kannada: 'ಕರಿಬೇವು',
    iron_mg_per_100g:    0.9,   // ICMR-NIN Nutritive Value of Indian Foods, p.47
    calcium_mg_per_100g: 830,   // exceptional calcium source
    protein_g_per_100g:  6.1,
    vitaminC_mg_per_100g: 4.0,
    folate_mcg_per_100g: 0,
    calories_per_100g:   108,
    cost_per_100g_inr:   2,     // cheapest per bunch
    serving_g:           10,
    why_chosen: 'Extremely affordable (₹2/bunch) — calcium-dense, used daily in Karnataka cooking',
    availability: 'Universally used in Karnataka cooking — available everywhere',
  },
  {
    id: 'green_banana',
    name_english: 'Green Banana',
    name_kannada: 'ಬಾಳೆಕಾಯಿ',
    iron_mg_per_100g:    0.6,
    calcium_mg_per_100g: 7,
    protein_g_per_100g:  1.3,
    vitaminC_mg_per_100g: 10,
    folate_mcg_per_100g: 22,
    calories_per_100g:   89,
    cost_per_100g_inr:   3,     // ₹3 per piece
    serving_g:           100,
    why_chosen: 'Potassium-rich, easily digestible calories — important for blood pressure in preeclampsia risk',
    availability: 'Abundant year-round in Karnataka, culturally accepted',
  },
];

// ── Trimester helper ─────────────────────────────────────────────────────────
export function getTrimester(gestationalWeek) {
  const w = parseInt(gestationalWeek) || 0;
  if (w <= 13) return { trimester: 'First',  number: 1 };
  if (w <= 26) return { trimester: 'Second', number: 2 };
  return              { trimester: 'Third',  number: 3 };
}

export function getCalorieRequirement(gestationalWeek) {
  const { number } = getTrimester(gestationalWeek);
  if (number === 1) return ICMR_RDA.calories.trimester1.value;
  if (number === 2) return ICMR_RDA.calories.trimester2.value;
  return ICMR_RDA.calories.trimester3.value;
}

// ── Diet quality estimator ────────────────────────────────────────────────────
// Maps verbal descriptions to approximate nutrient values
function estimateDietNutrients(foodIntake, foodAccess) {
  const intake = (foodIntake || '').toLowerCase();
  const access = (foodAccess || '').toLowerCase();

  let kcal = 1800, iron = 8, protein = 30, folate = 120, calcium = 400, vitaminC = 15;

  // Access level adjustments
  if (access.includes('very limited') || access.includes('irregular')) {
    kcal -= 600; iron -= 4; protein -= 15;
  } else if (access.includes('limited')) {
    kcal -= 300; iron -= 2; protein -= 8;
  } else if (access.includes('good')) {
    kcal += 200; iron += 4; protein += 15; vitaminC += 20;
  }

  // Diet content adjustments
  if (intake.includes('rice only') || intake.includes('rice and sambar only') || intake.includes('skipped')) {
    kcal -= 400; iron -= 5; protein -= 12; folate -= 60;
  }
  if (intake.includes('vegetables') || intake.includes('greens')) {
    iron += 3; folate += 80; vitaminC += 25;
  }
  if (intake.includes('pulses') || intake.includes('dal') || intake.includes('lentil')) {
    protein += 10; iron += 2; folate += 40;
  }
  if (intake.includes('egg') || intake.includes('meat') || intake.includes('chicken')) {
    protein += 15; iron += 3;
  }
  if (intake.includes('milk') || intake.includes('curd') || intake.includes('dairy')) {
    calcium += 300; protein += 8;
  }
  if (intake.includes('jaggery') || intake.includes('bella')) {
    iron += 2;
  }

  return {
    estimated_kcal:      Math.max(500, Math.round(kcal)),
    estimated_iron_mg:   Math.max(2,   Math.round(iron)),
    estimated_protein_g: Math.max(10,  Math.round(protein)),
    estimated_folate_mcg: Math.max(50, Math.round(folate)),
    estimated_calcium_mg: Math.max(200, Math.round(calcium)),
    estimated_vitaminC_mg: Math.max(5, Math.round(vitaminC)),
  };
}

// ── Symptom risk scorer ───────────────────────────────────────────────────────
function scoreSymptoms(symptoms) {
  const s = (symptoms || '').toLowerCase();
  let score = 0;
  const flags = [];

  if (s.includes('pale eyelid') || s.includes('pallor') || s.includes('pale'))       { score += 3; flags.push('conjunctival pallor'); }
  if (s.includes('extreme fatigue') || s.includes('severe fatigue'))                  { score += 3; flags.push('severe fatigue'); }
  if (s.includes('fatigue') && !s.includes('extreme') && !s.includes('severe'))       { score += 1; flags.push('mild fatigue'); }
  if (s.includes('dizziness') || s.includes('dizzy'))                                 { score += 2; flags.push('dizziness'); }
  if (s.includes('reduced fetal') || s.includes('fetal movement'))                    { score += 4; flags.push('reduced fetal movement — urgent'); }
  if (s.includes('swollen') || s.includes('swelling') || s.includes('oedema'))        { score += 2; flags.push('oedema'); }
  if (s.includes('headache') || s.includes('head ache'))                              { score += 2; flags.push('headache'); }
  if (s.includes('blurred') || s.includes('vision'))                                  { score += 3; flags.push('visual disturbance'); }
  if (s.includes('nausea') || s.includes('vomit'))                                    { score += 1; flags.push('nausea'); }
  if (s.includes('breathless') || s.includes('shortness of breath'))                  { score += 3; flags.push('dyspnoea'); }

  return { score, flags };
}

// ── Haemoglobin estimator from clinical proxies ───────────────────────────────
function estimateHbRange(pallor, fatigue, week) {
  // Rule-based Hb estimation from visible clinical signs
  // Based on: "Clinical Signs of Anaemia in Pregnancy" — FOGSI + ICMR Guidelines
  let low = 7.0, high = 12.0;

  if (pallor === 'severe')       { low = 5.0; high = 7.9; }
  else if (pallor === 'mild')    { low = 7.0; high = 10.9; }
  else if (pallor === 'none')    { low = 9.0; high = 13.0; }

  if (fatigue === 'severe')      { high = Math.min(high, 8.5); low = Math.min(low, 6.5); }
  else if (fatigue === 'mild')   { high = Math.min(high, 11.0); }

  if (week > 28) { low -= 0.5; } // haemodilution effect in late pregnancy

  return {
    low:  Math.max(4.0, Math.round(low  * 10) / 10),
    high: Math.min(15.0, Math.round(high * 10) / 10),
    display: `${Math.max(4.0, Math.round(low * 10) / 10)}–${Math.min(15.0, Math.round(high * 10) / 10)} g/dL (estimated)`,
  };
}

// ── MAIN: calculate_nutrient_gap ─────────────────────────────────────────────
// The primary ICMR-grounded risk scoring function
export function calculateNutrientGap(patientInputs) {
  const {
    gestationalWeek = 20,
    symptoms        = '',
    foodIntake      = '',
    foodAccess      = '',
    pallor          = 'none',  // none / mild / severe
    fatigue         = 'none',  // none / mild / severe
    clinicalReport  = null,    // extracted from blood report upload
  } = patientInputs;

  const week = parseInt(gestationalWeek) || 20;
  const { trimester, number: trimesterNum } = getTrimester(week);
  const reqKcal    = getCalorieRequirement(week);
  const reqIron    = ICMR_RDA.iron.value;        // 27 mg/day (ICMR-NIN 2020)
  const reqProtein = ICMR_RDA.protein.value;     // 71 g/day (ICMR-NIN 2020)
  const reqFolate  = ICMR_RDA.folate.value;      // 500 mcg/day (ICMR-NIN 2020)
  const reqCalcium = ICMR_RDA.calcium.value;     // 1200 mg/day (ICMR-NIN 2020)
  const reqVitC    = ICMR_RDA.vitaminC.value;    // 80 mg/day (ICMR-NIN 2020)

  // Estimated actual intake from diet description
  const intake = estimateDietNutrients(foodIntake, foodAccess);
  const { score: symptomScore, flags: symptomFlags } = scoreSymptoms(symptoms);

  // Hb estimation (clinical proxy)
  const hbRange = clinicalReport?.haemoglobin
    ? { display: clinicalReport.haemoglobin, low: parseFloat(clinicalReport.haemoglobin) || 8, high: parseFloat(clinicalReport.haemoglobin) || 8 }
    : estimateHbRange(pallor, fatigue, week);

  // Haemoglobin-based risk
  let hbRisk = 'GREEN';
  let hbLabel = 'Normal';
  if (hbRange.low < 7)     { hbRisk = 'RED';   hbLabel = 'Severe Anaemia (Hb < 7 g/dL)'; }
  else if (hbRange.low < 10) { hbRisk = 'AMBER'; hbLabel = 'Moderate Anaemia (Hb 7–10 g/dL)'; }
  else if (hbRange.low < 11) { hbRisk = 'AMBER'; hbLabel = 'Mild Anaemia (Hb 10–11 g/dL)'; }

  // Diet-based risk
  const ironDeficit    = reqIron    - intake.estimated_iron_mg;
  const proteinDeficit = reqProtein - intake.estimated_protein_g;
  const kcalDeficit    = reqKcal    - intake.estimated_kcal;
  const folateDeficit  = reqFolate  - intake.estimated_folate_mcg;

  let dietRisk = 'GREEN';
  if (ironDeficit > 18 && kcalDeficit > 600)  dietRisk = 'RED';
  else if (ironDeficit > 12 || kcalDeficit > 300) dietRisk = 'AMBER';

  // Symptom-based risk
  let symptomRisk = 'GREEN';
  if (symptomScore >= 7)      symptomRisk = 'RED';
  else if (symptomScore >= 3) symptomRisk = 'AMBER';

  // Combined final risk — most severe wins
  const riskOrder = { RED: 3, AMBER: 2, GREEN: 1 };
  const allRisks  = [hbRisk, dietRisk, symptomRisk];
  const finalRisk = allRisks.reduce((max, r) => riskOrder[r] > riskOrder[max] ? r : max, 'GREEN');

  // Confidence score
  let confidence = 65;
  if (clinicalReport?.haemoglobin) confidence += 25; // clinical data boosts confidence
  if (symptomFlags.length >= 2)    confidence += 5;
  if (foodAccess.includes('very limited')) confidence += 5;
  confidence = Math.min(97, confidence);

  // ICMR deficiency summary
  const deficiencies = [];
  if (ironDeficit > 5)    deficiencies.push({ nutrient: 'Iron',    deficit: ironDeficit,    unit: 'mg',  icmr_req: reqIron,    estimated: intake.estimated_iron_mg    });
  if (proteinDeficit > 10) deficiencies.push({ nutrient: 'Protein',  deficit: proteinDeficit, unit: 'g',   icmr_req: reqProtein, estimated: intake.estimated_protein_g  });
  if (kcalDeficit > 200)  deficiencies.push({ nutrient: 'Calories', deficit: kcalDeficit,   unit: 'kcal',icmr_req: reqKcal,    estimated: intake.estimated_kcal       });
  if (folateDeficit > 100) deficiencies.push({ nutrient: 'Folate',   deficit: folateDeficit, unit: 'mcg', icmr_req: reqFolate,  estimated: intake.estimated_folate_mcg });

  const primaryDeficiency = deficiencies[0]?.nutrient || 'None identified';

  // Build ICMR citation string
  const icmrCitation = deficiencies.length > 0
    ? deficiencies.map(d =>
        `ICMR Basis: ${d.nutrient} requirement is ${d.icmr_req}${d.unit}/day (ICMR-NIN 2020). ` +
        `Estimated current intake: ${d.estimated}${d.unit}. ` +
        `Deficit: ${Math.round(d.deficit)}${d.unit}/day.`
      ).join(' | ')
    : 'ICMR-NIN 2020: Nutrient intake appears adequate for this trimester.';

  return {
    // Core output
    risk_level:         finalRisk,
    trimester,
    gestational_week:   week,

    // Hb analysis
    estimated_hb_range: hbRange.display,
    hb_risk_label:      hbLabel,
    hb_risk:            hbRisk,

    // Diet analysis
    intake,
    requirements: { kcal: reqKcal, iron: reqIron, protein: reqProtein, folate: reqFolate, calcium: reqCalcium, vitC: reqVitC },
    deficiencies,
    primary_deficiency: primaryDeficiency,

    // Symptom analysis
    symptom_score:  symptomScore,
    symptom_flags:  symptomFlags,
    symptom_risk:   symptomRisk,

    // Scoring breakdown
    confidence_score: confidence,
    icmr_baseline_used: `ICMR-NIN 2020 RDA for Pregnant Women — ${trimester} Trimester`,
    icmr_citation:    icmrCitation,

    // For AI prompt injection
    diet_risk:    dietRisk,
    iron_deficit: ironDeficit,
    kcal_deficit: kcalDeficit,
  };
}

// ── Food recommender — selects best foods to close nutrient gap ──────────────
export function recommendFoods(gapResult, budgetInr = 25) {
  const { deficiencies, primary_deficiency } = gapResult;
  const scored = KARNATAKA_FOODS.map(food => {
    let score = 0;
    const servingFactor = food.serving_g / 100;
    const cost = food.cost_per_100g_inr * servingFactor;

    // Score by how well it addresses the primary deficiency
    if (primary_deficiency === 'Iron')    score += food.iron_mg_per_100g * 10;
    if (primary_deficiency === 'Protein') score += food.protein_g_per_100g * 5;
    if (primary_deficiency === 'Folate')  score += food.folate_mcg_per_100g * 0.5;
    if (primary_deficiency === 'Calories') score += food.calories_per_100g * 0.1;

    // Always value Vitamin C (boosts iron absorption)
    score += food.vitaminC_mg_per_100g * 2;

    // Cost efficiency bonus
    if (cost <= 10) score += 20;
    else if (cost <= 20) score += 10;

    return { ...food, relevance_score: score, daily_cost: Math.round(cost) };
  });

  // Sort by relevance and pick top 4 within budget
  scored.sort((a, b) => b.relevance_score - a.relevance_score);
  const selected = [];
  let totalCost = 0;

  for (const food of scored) {
    if (totalCost + food.daily_cost <= budgetInr && selected.length < 4) {
      selected.push(food);
      totalCost += food.daily_cost;
    }
  }

  // If budget not met, force top 4 regardless
  if (selected.length < 4) {
    const additional = scored.filter(f => !selected.find(s => s.id === f.id));
    selected.push(...additional.slice(0, 4 - selected.length));
  }

  return selected.slice(0, 4).map(food => ({
    food_name:    food.name_english,
    food_kannada: food.name_kannada,
    daily_advice: `${food.serving_g}g daily — ${food.why_chosen.split('—')[0].trim()}`,
    cost_per_day: food.daily_cost,
    iron_mg:      Math.round(food.iron_mg_per_100g * food.serving_g / 100 * 10) / 10,
    vitamin_c_mg: Math.round(food.vitaminC_mg_per_100g * food.serving_g / 100),
    protein_g:    Math.round(food.protein_g_per_100g * food.serving_g / 100 * 10) / 10,
    why_chosen:   food.why_chosen,
    icmr_source:  'ICMR-NIN Nutritive Value of Indian Foods (2017)',
  }));
}

// ── Build ICMR-enriched context block for AI prompt ─────────────────────────
export function buildICMRContextBlock(gapResult) {
  const { requirements, intake, deficiencies, icmr_citation, estimated_hb_range, trimester, gestational_week } = gapResult;
  return `
ICMR-NIN 2020 OFFICIAL RDA — ${trimester.toUpperCase()} TRIMESTER (Week ${gestational_week}):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Iron:     Required ${requirements.iron}mg/day | Estimated intake: ${intake.estimated_iron_mg}mg | ${requirements.iron - intake.estimated_iron_mg > 0 ? `DEFICIT: ${requirements.iron - intake.estimated_iron_mg}mg` : 'ADEQUATE'}
Protein:  Required ${requirements.protein}g/day  | Estimated intake: ${intake.estimated_protein_g}g  | ${requirements.protein - intake.estimated_protein_g > 0 ? `DEFICIT: ${requirements.protein - intake.estimated_protein_g}g` : 'ADEQUATE'}
Calories: Required ${requirements.kcal}kcal/day | Estimated intake: ${intake.estimated_kcal}kcal | ${requirements.kcal - intake.estimated_kcal > 0 ? `DEFICIT: ${requirements.kcal - intake.estimated_kcal}kcal` : 'ADEQUATE'}
Folate:   Required ${requirements.folate}mcg/day | Estimated intake: ${intake.estimated_folate_mcg}mcg | ${requirements.folate - intake.estimated_folate_mcg > 0 ? `DEFICIT: ${requirements.folate - intake.estimated_folate_mcg}mcg` : 'ADEQUATE'}
Calcium:  Required ${requirements.calcium}mg/day | Source: ICMR-NIN 2020 Table 3.1
Vitamin C:Required ${requirements.vitC}mg/day  | Enhances iron absorption 2-3x when taken with iron foods

ESTIMATED HAEMOGLOBIN RANGE: ${estimated_hb_range}
ICMR CITATION: ${icmr_citation}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATE: All food recommendations MUST come from the Karnataka Local Foods Database below.
Each food recommendation MUST include: iron content, cost/day, and ICMR nutrient contribution.
`.trim();
}

// ── Test case: Kavitha (demo patient) ────────────────────────────────────────
export function runKavithaTestCase() {
  const kavitha = {
    gestationalWeek: 26,
    symptoms: 'Pale eyelids, extreme fatigue, dizziness when standing up, mild swelling in feet',
    foodIntake: 'Rice and sambar only, no vegetables or pulses, skipped breakfast',
    foodAccess: 'Limited — basic rice and roti only',
    pallor: 'severe',
    fatigue: 'severe',
  };

  const gap = calculateNutrientGap(kavitha);
  const foods = recommendFoods(gap);
  const icmrBlock = buildICMRContextBlock(gap);

  return {
    patient: 'Kavitha Reddy, Age 24, Week 26',
    gap_analysis: gap,
    recommended_foods: foods,
    icmr_context_for_ai: icmrBlock,
    expected_output: {
      risk_level: gap.risk_level,
      primary_deficiency: gap.primary_deficiency,
      estimated_hb: gap.estimated_hb_range,
      icmr_basis: gap.icmr_citation,
      confidence: `${gap.confidence_score}%`,
    },
  };
}
