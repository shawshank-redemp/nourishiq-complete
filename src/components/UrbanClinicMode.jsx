import { useState } from 'react';
import { assessPatient } from '../utils/claudeApi.js';
import styles from './UrbanClinicMode.module.css';

const FATIGUE_OPTS    = ['None', 'Mild', 'Moderate', 'Severe'];
const DIZZINESS_OPTS  = ['None', 'Occasional', 'Frequent', 'Constant'];
const SLEEP_OPTS      = ['Good', 'Fair', 'Poor', 'Very Poor'];
const HYDRATION_OPTS  = ['Good', 'Fair', 'Low', 'Very Low'];
const STRESS_OPTS     = ['Low', 'Moderate', 'High', 'Very High'];
const SWELLING_OPTS   = ['None', 'Feet only', 'Feet and hands', 'Face and hands'];

function TileGroup({ label, options, value, onChange }) {
  return (
    <div className={styles.tileGroup}>
      <div className={styles.tileLabel}>{label}</div>
      <div className={styles.tiles}>
        {options.map(opt => (
          <button key={opt} type="button"
            className={`${styles.tile} ${value === opt ? styles.tileSelected : ''}`}
            onClick={() => onChange(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

const emptyIntake = {
  patientName: '', age: '', gestationalWeek: '', ashaWorkerName: '',
  fatigue: '', dizziness: '', sleep: '', hydration: '',
  stress: '', foodIntake: '', swelling: '', prevComplications: '',
};

export default function UrbanClinicMode() {
  const [form, setForm] = useState(emptyIntake);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function generateSummary() {
    setLoading(true);
    setSummary(null);
    try {
      // Build a pseudo form for claudeApi
      const pseudoForm = {
        patientName: form.patientName,
        ashaWorkerName: form.ashaWorkerName || 'Nurse',
        age: form.age,
        gestationalWeek: form.gestationalWeek,
        symptoms: [
          form.fatigue !== 'None' ? `${form.fatigue} fatigue` : '',
          form.dizziness !== 'None' ? `${form.dizziness} dizziness` : '',
          form.swelling !== 'None' ? `Swelling: ${form.swelling}` : '',
          form.sleep !== 'Good' ? `${form.sleep} sleep quality` : '',
          form.hydration !== 'Good' ? `${form.hydration} hydration` : '',
        ].filter(Boolean).join(', ') || 'No major symptoms',
        foodIntake: form.foodIntake || 'Not specified',
        foodAccess: form.stress === 'Very High' || form.hydration === 'Very Low' ? 'Limited — basic rice and roti only' : 'Good — vegetables, pulses, milk available',
      };

      const result = await assessPatient(pseudoForm);

      // Calculate queue priority
      const isRed   = result.risk_level === 'RED';
      const isAmber = result.risk_level === 'AMBER';
      const score   = isRed ? 9 : isAmber ? 6 : 3;

      setSummary({ result, score, form });
    } catch {
      setSummary({ error: true });
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() { window.print(); }

  const riskBadge = {
    RED:   { label: '🔴 HIGH PRIORITY — See Soon',        cls: styles.priorityRed   },
    AMBER: { label: '🟡 MODERATE PRIORITY — Standard Queue', cls: styles.priorityAmber },
    GREEN: { label: '🟢 ROUTINE — Normal Queue',           cls: styles.priorityGreen },
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>🏥</div>
        <div>
          <div className={styles.headerTitle}>Urban Clinic Intake Mode</div>
          <div className={styles.headerDesc}>Nurse enters once → Doctor receives AI-prepared consultation summary</div>
        </div>
        <div className={styles.modeBadge}>Clinic Mode</div>
      </div>

      {!summary ? (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Patient Name</label>
              <input className={styles.input} value={form.patientName} onChange={e => setField('patientName', e.target.value)} placeholder="e.g. Priya Sharma" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Age</label>
              <input className={styles.input} type="number" value={form.age} onChange={e => setField('age', e.target.value)} placeholder="e.g. 27" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Gestational Week</label>
              <input className={styles.input} type="number" value={form.gestationalWeek} onChange={e => setField('gestationalWeek', e.target.value)} placeholder="e.g. 28" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Attending Nurse</label>
              <input className={styles.input} value={form.ashaWorkerName} onChange={e => setField('ashaWorkerName', e.target.value)} placeholder="e.g. Nurse Kavitha" />
            </div>
          </div>

          <div className={styles.tilesSection}>
            <TileGroup label="Fatigue Level"    options={FATIGUE_OPTS}   value={form.fatigue}    onChange={v => setField('fatigue', v)} />
            <TileGroup label="Dizziness"        options={DIZZINESS_OPTS} value={form.dizziness}  onChange={v => setField('dizziness', v)} />
            <TileGroup label="Sleep Quality"    options={SLEEP_OPTS}     value={form.sleep}      onChange={v => setField('sleep', v)} />
            <TileGroup label="Hydration Level"  options={HYDRATION_OPTS} value={form.hydration}  onChange={v => setField('hydration', v)} />
            <TileGroup label="Stress / Work"    options={STRESS_OPTS}    value={form.stress}     onChange={v => setField('stress', v)} />
            <TileGroup label="Swelling Observed" options={SWELLING_OPTS}  value={form.swelling}   onChange={v => setField('swelling', v)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Food intake today</label>
            <input className={styles.input} value={form.foodIntake} onChange={e => setField('foodIntake', e.target.value)} placeholder="e.g. chapati and dal, skipped breakfast" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Previous complications (if any)</label>
            <input className={styles.input} value={form.prevComplications} onChange={e => setField('prevComplications', e.target.value)} placeholder="e.g. anaemia in previous pregnancy" />
          </div>

          <button className={styles.generateBtn} onClick={generateSummary} disabled={loading || !form.patientName || !form.gestationalWeek}>
            {loading ? <><span className={styles.spinner} />Generating doctor summary...</> : '🩺 Generate Doctor Summary →'}
          </button>
        </div>
      ) : summary.error ? (
        <div className={styles.errorCard}>
          <p>Failed to generate summary. Please try again.</p>
          <button className={styles.generateBtn} onClick={() => setSummary(null)}>← Try Again</button>
        </div>
      ) : (
        <div className={styles.summaryCard}>
          {/* Priority banner */}
          <div className={`${styles.priorityBanner} ${riskBadge[summary.result.risk_level]?.cls}`}>
            {riskBadge[summary.result.risk_level]?.label}
          </div>

          <div className={styles.summaryBody}>
            {/* Snapshot */}
            <div className={styles.snapshotGrid}>
              <div className={styles.snapshotItem}>
                <div className={styles.snapshotLabel}>Patient</div>
                <div className={styles.snapshotVal}>{summary.form.patientName}, Age {summary.form.age}</div>
              </div>
              <div className={styles.snapshotItem}>
                <div className={styles.snapshotLabel}>Gestational Week</div>
                <div className={styles.snapshotVal}>{summary.form.gestationalWeek} weeks</div>
              </div>
              <div className={styles.snapshotItem}>
                <div className={styles.snapshotLabel}>Key Symptoms</div>
                <div className={styles.snapshotVal}>
                  {[summary.form.fatigue !== 'None' && `${summary.form.fatigue} fatigue`, summary.form.dizziness !== 'None' && `${summary.form.dizziness} dizziness`].filter(Boolean).join(', ') || 'None significant'}
                </div>
              </div>
              <div className={styles.snapshotItem}>
                <div className={styles.snapshotLabel}>Swelling</div>
                <div className={styles.snapshotVal}>{summary.form.swelling || 'None'}</div>
              </div>
            </div>

            {/* AI Flags */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Possible Concerns — For Doctor Review</div>
              <ul className={styles.flagList}>
                {(summary.result.asha_next_steps || []).slice(0, 3).map((step, i) => (
                  <li key={i} className={styles.flagItem}>{step}</li>
                ))}
              </ul>
              <div className={styles.disclaimer}>These are AI-generated flags for doctor consideration — not a diagnosis</div>
            </div>

            {/* Doctor focus */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Suggested Doctor Focus</div>
              <ol className={styles.focusList}>
                {(summary.result.asha_next_steps || []).map((step, i) => (
                  <li key={i} className={styles.focusItem}>
                    <span className={styles.focusNum}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Queue score */}
            <div className={styles.queueCard}>
              <div className={styles.queueLeft}>
                <div className={styles.queueLabel}>Queue Priority Score</div>
                <div className={styles.queueScore}>{summary.score}/10</div>
                <div className={styles.queueNote}>
                  {summary.score >= 8 ? 'Consider moving ahead in queue if symptoms worsen' : summary.score >= 5 ? 'Standard queue — monitor in waiting area' : 'Routine — normal queue position'}
                </div>
              </div>
              <div className={styles.queueRight}>
                <div className={styles.interpretation}>{summary.result.medical_interpretation}</div>
              </div>
            </div>

            <div className={styles.summaryActions}>
              <button className={styles.printBtn} onClick={handlePrint}>🖨️ Print Summary</button>
              <button className={styles.resetBtn} onClick={() => { setSummary(null); setForm(emptyIntake); }}>← New Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
