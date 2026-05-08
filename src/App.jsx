import { useState, useEffect, useCallback } from 'react';
import TabNavigation from './components/TabNavigation.jsx';
import AssessmentForm from './components/AssessmentForm.jsx';
import ResultOutput from './components/ResultOutput.jsx';
import StepByStepBreakdown from './components/StepByStepBreakdown.jsx';
import HistoryTab from './components/HistoryTab.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import UrbanClinicMode from './components/UrbanClinicMode.jsx';
import { loadHistory } from './utils/storage.js';
import { getQueue, updateQueueItem, setLastSync, getPendingCount } from './utils/offlineQueue.js';
import { assessPatient } from './utils/claudeApi.js';
import { saveAssessment } from './utils/storage.js';
import styles from './App.module.css';

export default function App() {
  const [prefillData, setPrefillData] = useState(null);
  const [currentTab, setCurrentTab]           = useState('Assessment');
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [history, setHistory]                 = useState([]);
  const [isOnline, setIsOnline]               = useState(navigator.onLine);
  const [isSyncing, setIsSyncing]             = useState(false);
  const [syncCount, setSyncCount]             = useState(0);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const syncQueue = useCallback(async () => {
    const pending = getQueue().filter(q => q.status === 'pending');
    if (!pending.length || isSyncing) return;
    setIsSyncing(true);
    let synced = 0;
    for (const item of pending) {
      try {
        updateQueueItem(item.id, { status: 'syncing' });
        const result = await assessPatient(item.formData);
        saveAssessment(item.formData, result);
        updateQueueItem(item.id, { status: 'synced', aiResult: result });
        synced++;
      } catch {
        updateQueueItem(item.id, { status: 'failed' });
      }
    }
    if (synced > 0) {
      setLastSync();
      setSyncCount(c => c + synced);
      setHistory(loadHistory());
    }
    setIsSyncing(false);
  }, [isSyncing]);

  useEffect(() => {
    if (isOnline && getPendingCount() > 0) syncQueue();
  }, [isOnline]);

  useEffect(() => { setHistory(loadHistory()); }, []);

  function handleAssessmentComplete(assessment) {
    setCurrentAssessment(assessment);
    setHistory(loadHistory());
    setCurrentTab('Results');
  }

  function handleLoadFromHistory(entry) {
    setCurrentAssessment({ id: entry.id, formData: entry.formData, result: entry.result, timestamp: entry.timestamp });
    setCurrentTab('Results');
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🌿</span>
            <div>
              <div className={styles.logoName}>NourishIQ</div>
              <div className={styles.logoTagline}>AI maternal nutrition risk assessment for ASHA workers in rural Karnataka</div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={`${styles.netStatus} ${isOnline ? styles.netOnline : styles.netOffline}`}>
              <span className={styles.netDot} />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              AI-Powered
            </div>
          </div>
        </div>
      </header>

      <TabNavigation currentTab={currentTab} onTabChange={setCurrentTab} hasResults={!!currentAssessment} />
      <OfflineBanner isOnline={isOnline} syncCount={syncCount} isSyncing={isSyncing} />

      <main className={styles.main}>
        {currentTab === 'Assessment' && <AssessmentForm prefillData={prefillData} onPrefillConsumed={() => setPrefillData(null)} onAssessmentComplete={handleAssessmentComplete} isOnline={isOnline} />}
        {currentTab === 'Results'    && <ResultOutput assessment={currentAssessment} onNewAssessment={() => setCurrentTab('Assessment')} onViewBreakdown={() => setCurrentTab('Breakdown')} />}
        {currentTab === 'Breakdown'  && <StepByStepBreakdown assessment={currentAssessment} onBack={() => setCurrentTab('Results')} />}
        {currentTab === 'History'    && <HistoryTab onLoadAssessment={handleLoadFromHistory} />}
        {currentTab === 'Clinic' && <UrbanClinicMode onFillAssessment={(data) => { setPrefillData(data); setCurrentTab('Assessment'); }} />}
      </main>

      <footer className={styles.footer}>
        Built for SparkVerse+ Ideathon · May 2025 · Based on ICMR Dietary Guidelines
      </footer>
    </div>
  );
}
