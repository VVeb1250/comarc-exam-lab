export const STORAGE_KEY = 'comarc-v1';
export const STATE_EVENT = 'comarc:state-change';

export function readState() {
  if (typeof window === 'undefined') {
    return { theme: 'auto', font: 1, completed: [], answers: {} };
  }
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      theme: saved.theme || 'auto',
      font: saved.font || 1,
      completed: Array.isArray(saved.completed) ? saved.completed : [],
      answers: saved.answers && typeof saved.answers === 'object' ? saved.answers : {},
    };
  } catch {
    return { theme: 'auto', font: 1, completed: [], answers: {} };
  }
}

export function writeState(patch) {
  if (typeof window === 'undefined') return readState();
  const next = { ...readState(), ...patch };
  const saved = {
    theme: next.theme,
    font: next.font,
    completed: next.completed,
    answers: next.answers,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: saved }));
  return saved;
}

export function subscribeState(callback) {
  if (typeof window === 'undefined') return () => {};
  const onChange = (event) => callback(event.detail || readState());
  const onStorage = () => callback(readState());
  window.addEventListener(STATE_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(STATE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}
