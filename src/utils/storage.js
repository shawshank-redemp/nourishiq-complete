const KEY = 'nourishiq_history';

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAssessment(formData, result) {
  const history = loadHistory();
  const entry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    formData,
    result,
  };
  const updated = [entry, ...history].slice(0, 50);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch { /* storage full */ }
  return entry;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function formatTimestamp(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
