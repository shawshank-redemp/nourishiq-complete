import styles from './TabNavigation.module.css';

const DEFAULT_TABS = [
  { id: 'Assessment', label: 'Assessment',  icon: '📋' },
  { id: 'Results',    label: 'Results',     icon: '📊' },
  { id: 'Breakdown',  label: 'AI Reasoning',icon: '🧠' },
  { id: 'History',    label: 'History',     icon: '📁' },
  { id: 'Clinic',     label: 'Clinic Mode', icon: '🏥' },
];

export default function TabNavigation({ currentTab, onTabChange, hasResults, tabs }) {
  const TABS = tabs || DEFAULT_TABS;
  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        {TABS.map((tab) => {
          const locked = (tab.id === 'Results' || tab.id === 'Breakdown') && !hasResults;
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${active ? styles.active : ''} ${locked ? styles.locked : ''}`}
              onClick={() => !locked && onTabChange(tab.id)}
              disabled={locked}
              title={locked ? 'Run an assessment first' : tab.label}
            >
              <span className={styles.icon}>{tab.icon}</span>
              <span className={styles.label}>{tab.label}</span>
              {active && <span className={styles.bar} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
