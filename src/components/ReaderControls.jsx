import { useEffect, useState } from 'react';
import { readState, subscribeState, writeState } from '../lib/state.js';

function applyAppearance(theme, font) {
  const actualTheme = theme === 'auto'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.setAttribute('data-theme', actualTheme);
  document.documentElement.style.setProperty('--font-scale', font);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = actualTheme === 'dark' ? '#0f1621' : '#f7f9fc';
}

export default function ReaderControls() {
  const [theme, setTheme] = useState('auto');
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const state = readState();
    setTheme(state.theme);
    const sync = (next) => {
      setTheme(next.theme);
      const actual = next.theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : next.theme;
      setDark(actual === 'dark');
      applyAppearance(next.theme, next.font);
    };
    sync(state);
    const unsubscribe = subscribeState(sync);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemTheme = () => {
      if (readState().theme === 'auto') sync(readState());
    };
    media.addEventListener('change', onSystemTheme);
    return () => {
      unsubscribe();
      media.removeEventListener('change', onSystemTheme);
    };
  }, []);

  function toggleTheme() {
    const actual = document.documentElement.getAttribute('data-theme');
    const next = actual === 'dark' ? 'light' : 'dark';
    writeState({ theme: next });
  }

  function adjustFont(amount) {
    const next = Math.max(0.85, Math.min(1.3, Math.round((readState().font + amount) * 100) / 100));
    writeState({ font: next });
  }

  return (
    <div className="top-actions">
      <button className="icon-button" id="font-less" type="button" title="ลดขนาดตัวอักษร" aria-label="ลดขนาดตัวอักษร" onClick={() => adjustFont(-0.05)}>A−</button>
      <button className="icon-button" id="font-more" type="button" title="เพิ่มขนาดตัวอักษร" aria-label="เพิ่มขนาดตัวอักษร" onClick={() => adjustFont(0.05)}>A+</button>
      <button className="theme-button" id="theme-toggle" type="button" title="เปลี่ยนธีม" aria-label="เปลี่ยนธีม" onClick={toggleTheme}>
        <span id="theme-icon">{dark ? '☾' : '☀'}</span>
        <span id="theme-text">{dark ? 'Dark' : 'Light'}</span>
      </button>
    </div>
  );
}
