import { useState, useEffect } from 'react';
import { getPendingCount, getLastSync, formatLastSync, getQueue } from '../utils/offlineQueue.js';
import styles from './OfflineBanner.module.css';

export default function OfflineBanner({ isOnline, syncCount, isSyncing }) {
  const [pending, setPending] = useState(0);
  const [lastSync, setLastSync] = useState(getLastSync());
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [prevSyncCount, setPrevSyncCount] = useState(0);

  useEffect(() => {
    setPending(getPendingCount());
    setLastSync(getLastSync());
  }, [isOnline, syncCount]);

  useEffect(() => {
    if (syncCount > prevSyncCount && syncCount > 0) {
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 4000);
    }
    setPrevSyncCount(syncCount);
  }, [syncCount]);

  if (isOnline && pending === 0 && !showSyncToast) return null;

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <span className={styles.dot} />
            <div>
              <div className={styles.bannerTitle}>Offline Mode Active</div>
              <div className={styles.bannerSub}>
                Assessments saved locally — will sync automatically when internet returns
              </div>
            </div>
          </div>
          <div className={styles.bannerRight}>
            {pending > 0 && (
              <div className={styles.pendingBadge}>
                <span className={styles.syncIcon}>↑</span>
                {pending} pending
              </div>
            )}
          </div>
        </div>
      )}

      {/* Syncing banner */}
      {isOnline && isSyncing && (
        <div className={`${styles.banner} ${styles.bannerSyncing}`}>
          <div className={styles.bannerLeft}>
            <span className={styles.syncSpinner} />
            <div>
              <div className={styles.bannerTitle}>Syncing assessments with AI...</div>
              <div className={styles.bannerSub}>Running full Claude analysis on queued patients</div>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSyncToast && (
        <div className={styles.syncToast}>
          <span className={styles.toastIcon}>✓</span>
          <div>
            <div className={styles.toastTitle}>{syncCount} assessment{syncCount !== 1 ? 's' : ''} synced successfully</div>
            <div className={styles.toastSub}>Full AI analysis complete — results updated</div>
          </div>
        </div>
      )}
    </>
  );
}
