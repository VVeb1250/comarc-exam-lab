import { useEffect, useState } from 'react';
import siteData from '../data/site-data.json';
import { readState, subscribeState } from '../lib/state.js';

export function ChapterNavigation({ mode, chapter, basePath }) {
  const [completed, setCompleted] = useState([]);
  useEffect(() => {
    setCompleted(readState().completed);
    return subscribeState((state) => setCompleted(state.completed));
  }, []);

  return (
    <nav id="chapter-nav" className="chapter-nav" aria-label="หัวข้อเรียน">
      {siteData.chapters.map((item) => (
        <a href={`${basePath}/study/${item.id}/`} className={`chapter-link ${mode === 'study' && chapter === item.id ? 'active' : ''}`} key={item.id}>
          <span className="chapter-number">{String(item.id).padStart(2, '0')}</span>
          <span className="chapter-info"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
          {completed.includes(item.id) && <span className="chapter-done">✓</span>}
        </a>
      ))}
      <div className="nav-separator" />
      <a href={`${basePath}/study/bonus/`} className={`chapter-link ${mode === 'bonus' ? 'active' : ''}`}>
        <span className="chapter-number">＋</span><span className="chapter-info"><strong>เสริมกันเหนียว</strong><small>พื้นฐานและโจทย์ประยุกต์</small></span>
      </a>
      <div className="nav-separator" />
      <a href={`${basePath}/`} className={`chapter-link ${mode === 'library' ? 'active' : ''}`}>
        <span className="chapter-number">⌂</span><span className="chapter-info"><strong>Exam Library</strong><small>รายการบทเรียน</small></span>
      </a>
      <a href={`${basePath}/review/`} className={`chapter-link ${mode === 'review' ? 'active' : ''}`}>
        <span className="chapter-number">◷</span><span className="chapter-info"><strong>Progress</strong><small>สถานะและผลแบบฝึกหัด</small></span>
      </a>
    </nav>
  );
}

export function ProgressSummary() {
  const [completed, setCompleted] = useState([]);
  useEffect(() => {
    setCompleted(readState().completed);
    return subscribeState((state) => setCompleted(state.completed));
  }, []);
  const percent = Math.round(completed.length / 6 * 100);
  return (
    <div className="sidebar-bottom">
      <div className="sidebar-progress">
        <span>YOUR PROGRESS</span><strong id="progress-sidebar">{percent}%</strong>
        <div className="progress-track"><div id="progress-fill" style={{ width: `${percent}%` }} /></div>
      </div>
      <p>อ่านให้เข้าใจ ทดลอง แล้วค่อยฝึกทำ</p>
    </div>
  );
}

export function CompletionCount() {
  const [completed, setCompleted] = useState([]);
  useEffect(() => {
    setCompleted(readState().completed);
    return subscribeState((state) => setCompleted(state.completed));
  }, []);
  return <span id="completed-short">{completed.length}/6</span>;
}

export function ReaderOutline({ sections = [] }) {
  return (
    <nav id="outline" className="outline">
      {sections.map((section) => (
        <button type="button" data-value={section.id} className="outline-link" key={section.id} onClick={() => {
          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}>{section.title}</button>
      ))}
    </nav>
  );
}
