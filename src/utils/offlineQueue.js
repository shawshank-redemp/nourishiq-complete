// ─────────────────────────────────────────────────────────────────────────────
// NourishIQ — Offline-First Rural Healthcare Sync System
// ─────────────────────────────────────────────────────────────────────────────

const QUEUE_KEY = 'nourishiq_offline_queue';
const LAST_SYNC_KEY = 'nourishiq_last_sync';

// ── Local triage engine (works 100% offline, no AI needed) ──────────────────
export function triageOffline(formData) {
  const sym = (formData.symptoms || '').toLowerCase();
  const week = parseInt(formData.gestationalWeek) || 0;
  const food = (formData.foodAccess || '').toLowerCase();
  const intake = (formData.foodIntake || '').toLowerCase();

  // RED triggers
  const redFlags = [
    sym.includes('reduced fetal') || sym.includes('fetal movement'),
    sym.includes('severe headache') || sym.includes('blurred vision'),
    sym.includes('convuls') || sym.includes('seizure'),
    (sym.includes('pale') && sym.includes('fatigue') && week >= 28),
    (sym.includes('swollen') && sym.includes('headache')),
    food.includes('very limited') && week >= 24,
  ];

  // AMBER triggers
  const amberFlags = [
    sym.includes('pale eyelids') || sym.includes('pallor'),
    sym.includes('extreme fatigue') || sym.includes('dizziness'),
    sym.includes('swollen feet') || sym.includes('swelling'),
    sym.includes('nausea') && week >= 20,
    food.includes('limited') && week >= 16,
    intake.includes('rice only') || intake.includes('skipped'),
    week >= 32,
  ];

  const redCount   = redFlags.filter(Boolean).length;
  const amberCount = amberFlags.filter(Boolean).length;

  let risk = 'GREEN';
  let reasoning = '';

  if (redCount >= 1) {
    risk = 'RED';
    reasoning = `Emergency triage: ${redCount} critical indicator(s) detected. Immediate PHC referral recommended. Full AI assessment pending sync.`;
  } else if (amberCount >= 2) {
    risk = 'AMBER';
    reasoning = `Moderate risk triage: ${amberCount} risk indicator(s) detected. Monitor closely. Full AI assessment will run on reconnection.`;
  } else {
    risk = 'GREEN';
    reasoning = `Low risk triage: No critical indicators. Routine follow-up recommended. Full AI assessment pending sync.`;
  }

  return {
    risk_level: risk,
    offline_triage: true,
    triage_reasoning: reasoning,
    medical_interpretation: `[OFFLINE TRIAGE — AI assessment pending sync] ${reasoning}`,
    asha_next_steps: risk === 'RED'
      ? [
          'Refer to PHC immediately — do not wait for AI confirmation',
          'Check vital signs and document in patient file',
          'Administer IFA tablets if available',
          'Assessment will be AI-verified once internet is restored',
        ]
      : risk === 'AMBER'
      ? [
          'Monitor symptoms closely over next 24 hours',
          'Provide IFA tablet and dietary counselling',
          'Schedule PHC visit within 3 days',
          'Full AI assessment will run automatically on reconnection',
        ]
      : [
          'Continue routine monitoring and follow-up',
          'Reinforce dietary counselling — ragi, pulses, greens',
          'Full AI assessment will run automatically on reconnection',
          'Next ASHA visit in 14 days',
        ],
    nutrition_plan: [
      { food_name: 'Ragi Mudde', food_kannada: 'ರಾಗಿ ಮುದ್ದೆ', daily_advice: '2 balls with sambar at lunch and dinner', cost_per_day: 8, iron_mg: 5.8, vitamin_c_mg: 0, why_chosen: 'Highest iron per rupee — offline default recommendation' },
      { food_name: 'Drumstick Leaves', food_kannada: 'ನುಗ್ಗೆ ಸೊಪ್ಪು', daily_advice: '1 cup cooked with lunch', cost_per_day: 8, iron_mg: 3.5, vitamin_c_mg: 51, why_chosen: 'Vitamin C boosts iron absorption — offline default' },
      { food_name: 'Horsegram', food_kannada: 'ಹುರಳಿ', daily_advice: '½ cup cooked as evening snack', cost_per_day: 12, iron_mg: 5.6, vitamin_c_mg: 1, why_chosen: 'High iron legume — offline default recommendation' },
      { food_name: 'Jaggery', food_kannada: 'ಬೆಲ್ಲ', daily_advice: '2 pieces after each meal', cost_per_day: 5, iron_mg: 2.2, vitamin_c_mg: 0, why_chosen: 'Traditional iron supplement — offline default' },
    ],
    phc_sms: risk === 'RED'
      ? `TO: PHC Duty Doctor\nFROM: ASHA Worker ${formData.ashaWorkerName || 'ASHA'}\nPATIENT: ${formData.patientName}, Age ${formData.age}, Week ${formData.gestationalWeek}\nALERT: OFFLINE EMERGENCY TRIAGE — HIGH RISK\nSYMPTOMS: ${formData.symptoms}\nACTION: Urgent referral — AI confirmation pending`
      : null,
    kannada_message: risk === 'RED'
      ? `${formData.patientName} ಅವರಿಗೆ ತುರ್ತು ಆರೈಕೆ ಬೇಕು. ತಕ್ಷಣ PHC ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ.`
      : `${formData.patientName} ಅವರ ಆರೋಗ್ಯ ತಪಾಸಣೆ ನಡೆಯುತ್ತಿದೆ. ರಾಗಿ, ನುಗ್ಗೆ ಸೊಪ್ಪು ಮತ್ತು ಬೆಲ್ಲ ಪ್ರತಿದಿನ ತಿನ್ನಿ.`,
    breakdown: {
      symptom_analysis: { symptoms_listed: (formData.symptoms || '').split(',').map(s => s.trim()), clinical_mapping: ['Offline triage — clinical mapping will be detailed after AI sync'], confidence: 'Low — offline rule-based only. Full AI analysis pending.' },
      nutrition_assessment: { estimated_kcal: 900, estimated_protein_g: 20, required_kcal: 2200, required_protein_g: 78, calorie_gap: 'Offline estimate only', protein_gap: 'Offline estimate only' },
      gestational_stage: { week: parseInt(formData.gestationalWeek) || 0, trimester: (parseInt(formData.gestationalWeek) || 0) <= 13 ? 'First' : (parseInt(formData.gestationalWeek) || 0) <= 26 ? 'Second' : 'Third', key_nutrients_this_stage: ['Iron', 'Protein', 'Calcium'], stage_specific_risks: ['Full stage analysis pending AI sync'] },
      decision_logic: { factors_triggering_risk: [`Offline triage assigned ${risk} based on rule-based symptom analysis`], thresholds_met: [`${risk} threshold: see triage reasoning`], final_decision: reasoning },
      nutrition_reasoning: { total_iron_from_plan_mg: 17.1, iron_target_mg: 27, foods_rationale: ['Offline defaults — Karnataka standard iron-rich foods'] },
      action_explanations: [{ action: 'Sync with AI when internet restores', why: 'Full clinical analysis requires Claude AI — currently unavailable', timeline: 'Automatic on reconnection' }],
    },
  };
}

// ── Queue management ─────────────────────────────────────────────────────────
export function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch { return []; }
}

export function addToQueue(formData, triageResult) {
  const queue = getQueue();
  const entry = {
    id: `offline_${Date.now()}`,
    timestamp: new Date().toISOString(),
    formData,
    triageResult,
    status: 'pending', // pending | syncing | synced | failed
  };
  queue.push(entry);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return entry;
}

export function updateQueueItem(id, updates) {
  const queue = getQueue();
  const idx = queue.findIndex(q => q.id === id);
  if (idx !== -1) {
    queue[idx] = { ...queue[idx], ...updates };
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }
}

export function removeFromQueue(id) {
  const queue = getQueue().filter(q => q.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function getPendingCount() {
  return getQueue().filter(q => q.status === 'pending').length;
}

export function getLastSync() {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function setLastSync() {
  const now = new Date().toISOString();
  localStorage.setItem(LAST_SYNC_KEY, now);
  return now;
}

export function formatLastSync(iso) {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
