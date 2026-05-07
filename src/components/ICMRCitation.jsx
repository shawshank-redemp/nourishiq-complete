import styles from './ICMRCitation.module.css';

export default function ICMRCitation({ icmrBasis, icmrValidation, confidenceScore, estimatedHb }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.logo}>🏛️</span>
        <span className={styles.title}>ICMR-NIN 2020 Basis</span>
        <span className={styles.badge}>Official Guidelines</span>
      </div>

      {icmrValidation && (
        <div className={styles.validation}>{icmrValidation}</div>
      )}

      {icmrBasis && icmrBasis !== icmrValidation && (
        <div className={styles.basis}>{icmrBasis}</div>
      )}

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.footerText}>
            Based on ICMR-NIN 2020 Recommended Dietary Allowances for Pregnant Women
          </span>
        </div>
        <div className={styles.footerRight}>
          {estimatedHb && (
            <div className={styles.hbBadge}>
              <span className={styles.hbLabel}>Est. Hb</span>
              <span className={styles.hbVal}>{estimatedHb}</span>
            </div>
          )}
          {confidenceScore && (
            <div className={styles.confBadge}>
              <span className={styles.confLabel}>Confidence</span>
              <span className={styles.confVal}>{confidenceScore}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
