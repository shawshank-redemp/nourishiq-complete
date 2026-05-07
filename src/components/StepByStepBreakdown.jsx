import { useState } from 'react';
import styles from './StepByStepBreakdown.module.css';

function ExpandableStep({ stepNum, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.step}>
      <button className={styles.stepHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.stepLeft}>
          <span className={styles.stepBadge}>{stepNum}</span>
          <span className={styles.stepTitle}>{title}</span>
        </div>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>▼</span>
      </button>
      {open && <div className={styles.stepBody}>{children}</div>}
    </div>
  );
}

function Bar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={styles.barRow}>
      <div className={styles.barLabel}>{label}</div>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className={styles.barValue}>{value.toLocaleString()}</div>
    </div>
  );
}

export default function StepByStepBreakdown({ assessment, onBack }) {
  if (!assessment) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🧠</div>
        <p>No assessment to break down. Run an assessment first.</p>
      </div>
    );
  }

  const { formData, result } = assessment;
  const bd = result?.breakdown || {};
  const sa = bd.symptom_analysis || {};
  const na = bd.nutrition_assessment || {};
  const gs = bd.gestational_stage || {};
  const dl = bd.decision_logic || {};
  const nr = bd.nutrition_reasoning || {};
  const ae = bd.action_explanations || [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerTitle}>AI Reasoning — Step by Step</div>
          <div className={styles.headerSub}>How NourishIQ assessed {formData.patientName || 'this patient'}</div>
        </div>
        <div className={`${styles.riskPill} ${styles[`risk${result.risk_level}`]}`}>
          {result.risk_level === 'RED' ? '🔴' : result.risk_level === 'AMBER' ? '🟡' : '🟢'} {result.risk_level}
        </div>
      </div>

      <div className={styles.timeline}>
        {/* Step 1 */}
        <ExpandableStep stepNum="1" title="Symptom Analysis — What Was Reported?">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Reported symptoms</div>
              <div className={styles.infoValue}>{formData.symptoms || '—'}</div>
            </div>
          </div>
          {sa.clinical_mapping?.length > 0 && (
            <>
              <div className={styles.subLabel}>Clinical mapping</div>
              <ul className={styles.dotList}>
                {sa.clinical_mapping.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </>
          )}
          {sa.confidence && (
            <div className={styles.confidenceBadge}>
              <span>🎯</span> {sa.confidence}
            </div>
          )}
        </ExpandableStep>

        {/* Step 2 */}
        <ExpandableStep stepNum="2" title="Nutritional Status Assessment">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Food intake (last 24h)</div>
              <div className={styles.infoValue}>{formData.foodIntake || '—'}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Food access level</div>
              <div className={styles.infoValue}>{formData.foodAccess || '—'}</div>
            </div>
          </div>
          <div className={styles.subLabel}>ICMR Requirements vs Estimated Intake</div>
          <div className={styles.barsWrapper}>
            <Bar label="Calories (kcal)" value={na.estimated_kcal || 0} max={na.required_kcal || 2200}
              color={na.estimated_kcal < (na.required_kcal || 2200) * 0.6 ? '#E24B4A' : '#D97706'} />
            <div className={styles.barRequired}>Target: {(na.required_kcal || 2200).toLocaleString()} kcal/day</div>
            <Bar label="Protein (g)" value={na.estimated_protein_g || 0} max={na.required_protein_g || 78}
              color={na.estimated_protein_g < (na.required_protein_g || 78) * 0.6 ? '#E24B4A' : '#D97706'} />
            <div className={styles.barRequired}>Target: {na.required_protein_g || 78}g/day</div>
          </div>
          {na.calorie_gap && <div className={styles.gapNote}>⚠️ {na.calorie_gap}</div>}
          {na.protein_gap && <div className={styles.gapNote}>⚠️ {na.protein_gap}</div>}
        </ExpandableStep>

        {/* Step 3 */}
        <ExpandableStep stepNum="3" title="Pregnancy Stage Risk Assessment">
          <div className={styles.stageBanner}>
            <span className={styles.weekBig}>Week {gs.week || formData.gestationalWeek}</span>
            <span className={styles.trimesterTag}>{gs.trimester || '—'} Trimester</span>
          </div>
          {gs.key_nutrients_this_stage?.length > 0 && (
            <>
              <div className={styles.subLabel}>Critical nutrients at this stage</div>
              <div className={styles.tagRow}>
                {gs.key_nutrients_this_stage.map((n, i) => (
                  <span key={i} className={styles.nutrientTag}>{n}</span>
                ))}
              </div>
            </>
          )}
          {gs.stage_specific_risks?.length > 0 && (
            <>
              <div className={styles.subLabel}>Stage-specific complications to watch</div>
              <ul className={styles.dotList}>
                {gs.stage_specific_risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </>
          )}
        </ExpandableStep>

        {/* Step 4 */}
        <ExpandableStep stepNum="4" title="Decision Logic — How Was Risk Level Determined?">
          {dl.factors_triggering_risk?.length > 0 && (
            <>
              <div className={styles.subLabel}>Factors that triggered this risk level</div>
              <ul className={styles.dotList}>
                {dl.factors_triggering_risk.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </>
          )}
          {dl.thresholds_met?.length > 0 && (
            <>
              <div className={styles.subLabel}>Thresholds met</div>
              <ul className={styles.dotList}>
                {dl.thresholds_met.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </>
          )}
          {dl.final_decision && (
            <div className={styles.decisionBox}>
              <span className={styles.decisionLabel}>Final decision</span>
              <p>{dl.final_decision}</p>
            </div>
          )}
        </ExpandableStep>

        {/* Step 5 */}
        <ExpandableStep stepNum="5" title="Nutrition Recommendation Engine — Why These Foods?">
          {result.nutrition_plan?.length > 0 && (
            <table className={styles.foodTable}>
              <thead>
                <tr><th>Food</th><th>Iron (mg)</th><th>Vit C (mg)</th><th>₹/day</th><th>Why chosen</th></tr>
              </thead>
              <tbody>
                {result.nutrition_plan.map((food, i) => (
                  <tr key={i}>
                    <td><strong>{food.food_name}</strong><br /><span className={styles.tableKannada}>{food.food_kannada}</span></td>
                    <td className={styles.tableNum}>{food.iron_mg || '—'}</td>
                    <td className={styles.tableNum}>{food.vitamin_c_mg || '—'}</td>
                    <td className={styles.tableNum}>₹{food.cost_per_day || '—'}</td>
                    <td className={styles.tableReason}>{food.why_chosen || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className={styles.ironSummary}>
            <span>Total iron from plan:</span>
            <strong>{nr.total_iron_from_plan_mg || '—'}mg/day</strong>
            <span className={styles.ironTarget}>(Target: {nr.iron_target_mg || 27}mg/day)</span>
          </div>
        </ExpandableStep>

        {/* Step 6 */}
        <ExpandableStep stepNum="6" title="Clinical Action Items — What Happens Next?">
          <div className={styles.actionList}>
            {ae.length > 0 ? ae.map((item, i) => (
              <div key={i} className={styles.actionCard}>
                <div className={styles.actionNum}>{i + 1}</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>{item.action}</div>
                  {item.why && <div className={styles.actionWhy}><strong>Why:</strong> {item.why}</div>}
                  {item.timeline && <span className={styles.timelineBadge}>⏱ {item.timeline}</span>}
                </div>
              </div>
            )) : (result.asha_next_steps || []).map((step, i) => (
              <div key={i} className={styles.actionCard}>
                <div className={styles.actionNum}>{i + 1}</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionTitle}>{step}</div>
                </div>
              </div>
            ))}
          </div>
        </ExpandableStep>
      </div>

      <button className={styles.backBtn} onClick={onBack}>← Back to Results</button>
    </div>
  );
}
