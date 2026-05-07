import { useState } from 'react';
import styles from './ResultOutput.module.css';

export default function ResultOutput({ assessment, onNewAssessment, onViewBreakdown }) {
  const [toastVisible, setToastVisible] = useState(false);

  if (!assessment) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📊</div>
        <p>No assessment yet. Run an assessment to see results here.</p>
      </div>
    );
  }

  const { formData, result } = assessment;
  const { risk_level, medical_interpretation, asha_next_steps, nutrition_plan, phc_sms, kannada_message } = result;

  const riskConfig = {
    RED:   { bg: styles.bannerRed,   emoji: '🔴', text: 'HIGH RISK — Immediate Action Required',  subColor: '#7F1D1D' },
    AMBER: { bg: styles.bannerAmber, emoji: '🟡', text: 'MODERATE RISK — Monitor Closely',         subColor: '#78350F' },
    GREEN: { bg: styles.bannerGreen, emoji: '🟢', text: 'LOW RISK — Routine Follow-up',            subColor: '#14532D' },
  };
  const rc = riskConfig[risk_level] || riskConfig.AMBER;

  const totalCost = nutrition_plan?.reduce((s, f) => s + (f.cost_per_day || 0), 0) || 0;

  function showToast() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  return (
    <div className={styles.wrapper}>
      {toastVisible && <div className={styles.toast}>✓ Assessment saved to history</div>}

      <button className={styles.backBtn} onClick={onNewAssessment}>← New Assessment</button>

      {/* Risk Banner */}
      <div className={`${styles.banner} ${rc.bg}`}>
        <div className={styles.bannerMain}>{rc.emoji} {rc.text}</div>
        <div className={styles.bannerSub} style={{ color: rc.subColor }}>
          Patient: {formData.patientName || '—'} · Age {formData.age || '—'} · Week {formData.gestationalWeek || '—'} · Assessed by {formData.ashaWorkerName || '—'}
        </div>
      </div>

      {/* Medical Interpretation */}
      <div className={styles.card}>
        <div className={styles.sectionLabel}>Why This Risk Level?</div>
        <p className={styles.bodyText}>{medical_interpretation}</p>
      </div>

      {/* ASHA Next Steps */}
      <div className={styles.card}>
        <div className={styles.sectionLabel}>What You Must Do Now</div>
        <ol className={styles.stepList}>
          {(asha_next_steps || []).map((step, i) => (
            <li key={i} className={styles.stepItem}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span className={styles.stepText}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Nutrition Plan */}
      <div className={styles.card}>
        <div className={styles.sectionLabel}>Karnataka Nutrition Plan</div>
        <div className={styles.foodGrid}>
          {(nutrition_plan || []).map((food, i) => (
            <div key={i} className={styles.foodCard}>
              <div className={styles.foodName}>{food.food_name}</div>
              <div className={styles.foodKannada}>{food.food_kannada}</div>
              <div className={styles.foodAdvice}>{food.daily_advice}</div>
              <div className={styles.costBadge}>₹{food.cost_per_day}/day</div>
            </div>
          ))}
        </div>
        <div className={styles.totalCost}>Estimated total: ₹{totalCost} per day</div>
      </div>

      {/* PHC Alert — RED only */}
      {risk_level === 'RED' && phc_sms && (
        <div className={styles.phcCard}>
          <div className={styles.phcLabel}>🚑 PHC Emergency Alert — Automatic Notification</div>
          <pre className={styles.phcSms}>{phc_sms}</pre>
          <div className={styles.phcConfirm}>✓ Alert would be sent to nearest PHC via Twilio SMS</div>
        </div>
      )}

      {/* Kannada Message */}
      {kannada_message && (
        <div className={styles.kannadaCard}>
          <div className={styles.kannadaLabel}>Kannada Counselling Message — Read Aloud to Family</div>
          <p className={styles.kannadaText}>{kannada_message}</p>
          <div className={styles.kannadaHint}>(Read this directly to the patient and family)</div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className={styles.bottomActions}>
        <div className={styles.revisitBadge}>📅 Revisit in 3 days</div>
        <div className={styles.bottomRight}>
          <button className={styles.btnSecondary} onClick={onViewBreakdown}>View AI Reasoning</button>
          <button className={styles.btnSave} onClick={showToast}>Save to History</button>
        </div>
      </div>
    </div>
  );
}
