import { useState, useEffect } from 'react';
import { loadHistory, clearHistory, formatTimestamp } from '../utils/storage.js';
import styles from './HistoryTab.module.css';

export default function HistoryTab({ onLoadAssessment }) {
  const [history, setHistory] = useState([]);

  useEffect(() => { setHistory(loadHistory()); }, []);

  function handleClear() {
    if (window.confirm('Clear all saved assessments? This cannot be undone.')) {
      clearHistory();
      setHistory([]);
    }
  }

  const riskLabel = {
    RED:   { label: '🔴 HIGH RISK', cls: styles.riskRed   },
    AMBER: { label: '🟡 MODERATE',  cls: styles.riskAmber },
    GREEN: { label: '🟢 LOW RISK',  cls: styles.riskGreen },
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Assessment History</h2>
        {history.length > 0 && (
          <button className={styles.clearBtn} onClick={handleClear}>Clear All</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📁</div>
          <p>No assessments saved yet.</p>
          <p className={styles.emptyHint}>Run your first assessment on the Assessment tab.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {history.map(entry => {
            const risk = riskLabel[entry.result?.risk_level] || riskLabel.AMBER;
            const interp = entry.result?.medical_interpretation || '';
            const truncated = interp.length > 120 ? interp.slice(0, 120) + '…' : interp;
            return (
              <button key={entry.id} className={styles.card} onClick={() => onLoadAssessment(entry)}>
                <div className={styles.cardTop}>
                  <div className={styles.cardLeft}>
                    <div className={styles.patientName}>{entry.formData?.patientName || 'Unknown patient'}</div>
                    <div className={styles.cardMeta}>
                      {entry.formData?.ashaWorkerName && <span>ASHA: {entry.formData.ashaWorkerName}</span>}
                      {entry.formData?.age && <span>Age {entry.formData.age}</span>}
                      {entry.formData?.gestationalWeek && <span>Week {entry.formData.gestationalWeek}</span>}
                    </div>
                  </div>
                  <div className={styles.cardRight}>
                    <span className={`${styles.riskBadge} ${risk.cls}`}>{risk.label}</span>
                    <div className={styles.timestamp}>{formatTimestamp(entry.timestamp)}</div>
                  </div>
                </div>
                {truncated && <div className={styles.preview}>{truncated}</div>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
