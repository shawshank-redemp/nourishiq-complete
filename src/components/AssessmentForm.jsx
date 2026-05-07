import { useState } from 'react';
import { assessPatient } from '../utils/claudeApi.js';
import { saveAssessment } from '../utils/storage.js';
import { addToQueue, triageOffline } from '../utils/offlineQueue.js';
import ClinicalReportUpload from './ClinicalReportUpload.jsx';
import styles from './AssessmentForm.module.css';

const DEMO_PATIENT = {
  patientName: 'Kavitha Reddy', ashaWorkerName: 'Meera Patil',
  age: '24', gestationalWeek: '26',
  symptoms: 'Pale eyelids, extreme fatigue, dizziness when standing up, mild swelling in feet',
  foodIntake: 'Rice and sambar only, no vegetables or pulses, skipped breakfast',
  foodAccess: 'Limited — basic rice and roti only',
};

const SYMPTOM_CHIPS = ['Pale eyelids','Extreme fatigue','Swollen feet','Dizziness','Reduced fetal movement','Headache','Nausea'];

const FOOD_ACCESS_OPTIONS = [
  { value: 'Good — vegetables, pulses, milk available', label: 'Good',        description: 'Vegetables, pulses, milk available', icon: '🥦' },
  { value: 'Limited — basic rice and roti only',        label: 'Limited',      description: 'Basic rice and roti only',           icon: '🍚' },
  { value: 'Very limited — irregular meals',            label: 'Very limited', description: 'Irregular meals',                    icon: '⚠️' },
];

const emptyForm = { patientName:'', ashaWorkerName:'', age:'', gestationalWeek:'', symptoms:'', foodIntake:'', foodAccess:'' };

export default function AssessmentForm({ onAssessmentComplete, isOnline }) {
  const [form, setForm]               = useState(emptyForm);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [activeChips, setActiveChips] = useState([]);
  const [clinicalData, setClinicalData] = useState(null);

  function handleChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  function handleChip(chip) {
    const isActive = activeChips.includes(chip);
    if (isActive) {
      setActiveChips(prev => prev.filter(c => c !== chip));
      setForm(prev => ({ ...prev, symptoms: prev.symptoms.replace(`, ${chip}`,'').replace(`${chip}, `,'').replace(chip,'').trim().replace(/^,\s*/,'').replace(/,\s*$/,'') }));
    } else {
      setActiveChips(prev => [...prev, chip]);
      setForm(prev => ({ ...prev, symptoms: prev.symptoms ? `${prev.symptoms.trim()}, ${chip}` : chip }));
    }
  }

  function loadDemo() { setForm(DEMO_PATIENT); setActiveChips(['Pale eyelids','Extreme fatigue','Dizziness','Swollen feet']); setError(''); }
  function clearForm() { setForm(emptyForm); setActiveChips([]); setError(''); setClinicalData(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patientName || !form.gestationalWeek || !form.symptoms) {
      setError('Please fill in patient name, gestational week, and symptoms at minimum.');
      return;
    }
    setError('');
    setLoading(true);

    // Enrich form with clinical report data if available
    const enrichedForm = clinicalData
      ? { ...form, clinicalReport: clinicalData, symptoms: `${form.symptoms}${clinicalData.haemoglobin ? `, Hb: ${clinicalData.haemoglobin}` : ''}${clinicalData.blood_pressure ? `, BP: ${clinicalData.blood_pressure}` : ''}` }
      : form;

    try {
      if (!isOnline) {
        // Offline path — triage locally and queue
        const triageResult = triageOffline(enrichedForm);
        const queued = addToQueue(enrichedForm, triageResult);
        const saved  = saveAssessment(enrichedForm, triageResult);
        onAssessmentComplete({ id: saved.id, formData: enrichedForm, result: triageResult, timestamp: saved.timestamp, offline: true });
      } else {
        // Online path — full AI assessment
        const result = await assessPatient(enrichedForm);
        const saved  = saveAssessment(enrichedForm, result);
        onAssessmentComplete({ id: saved.id, formData: enrichedForm, result, timestamp: saved.timestamp });
      }
    } catch (err) {
      setError(err.message || 'Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Patient Assessment</h2>
            <p className={styles.cardDesc}>Enter patient details to generate an AI-powered maternal nutrition risk report</p>
          </div>
          {!isOnline && (
            <div className={styles.offlinePill}>📵 Offline — triage mode</div>
          )}
        </div>

        <div className={styles.quickActions}>
          <button type="button" className={styles.btnDemo} onClick={loadDemo}>✨ Load Demo — Kavitha</button>
          <button type="button" className={styles.btnClear} onClick={clearForm}>✕ Clear</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Patient Name</label>
              <input className={styles.input} type="text" name="patientName" value={form.patientName} onChange={handleChange} placeholder="e.g. Kavitha Reddy" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>ASHA Worker Name</label>
              <input className={styles.input} type="text" name="ashaWorkerName" value={form.ashaWorkerName} onChange={handleChange} placeholder="e.g. Meera Patil" />
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Age (years)</label>
              <input className={styles.input} type="number" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 24" min="12" max="55" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Gestational Week</label>
              <input className={styles.input} type="number" name="gestationalWeek" value={form.gestationalWeek} onChange={handleChange} placeholder="e.g. 26" min="1" max="42" />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Symptoms observed<span className={styles.labelHint}> — describe in plain words or tap chips below</span></label>
            <textarea className={styles.textarea} name="symptoms" value={form.symptoms} onChange={handleChange} rows={4} placeholder="Describe what you see and what the patient reports..." />
            <div className={styles.chips}>
              {SYMPTOM_CHIPS.map(chip => (
                <button type="button" key={chip}
                  className={`${styles.chip} ${activeChips.includes(chip) ? styles.chipActive : ''}`}
                  onClick={() => handleChip(chip)}>{chip}</button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Last 24-hour food intake</label>
            <input className={styles.input} type="text" name="foodIntake" value={form.foodIntake} onChange={handleChange} placeholder="e.g. rice and sambar only, no vegetables" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Food access at home</label>
            <div className={styles.foodCards}>
              {FOOD_ACCESS_OPTIONS.map(opt => (
                <button type="button" key={opt.value}
                  className={`${styles.foodCard} ${form.foodAccess === opt.value ? styles.foodCardSelected : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, foodAccess: opt.value }))}>
                  <span className={styles.foodCardIcon}>{opt.icon}</span>
                  <span className={styles.foodCardLabel}>{opt.label}</span>
                  <span className={styles.foodCardDesc}>{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feature 1 — Clinical Report Upload */}
          <div className={styles.divider} />
          <ClinicalReportUpload onExtracted={setClinicalData} apiKey={apiKey} />

          {error && <div className={styles.error}><span>⚠️</span> {error}</div>}

          <button type="submit" className={`${styles.btnSubmit} ${!isOnline ? styles.btnOffline : ''}`} disabled={loading}>
            {loading ? (
              <><span className={styles.spinner} />{isOnline ? 'Analysing with AI...' : 'Saving offline...'}</>
            ) : isOnline ? 'Run AI Assessment →' : '📵 Save for Offline Sync →'}
          </button>
        </form>
      </div>
    </div>
  );
}
