import { useEffect, useState } from 'react';
import { readState, subscribeState, writeState } from '../lib/state.js';

export default function ChapterCompletion({ chapter, basePath }) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(readState().completed.includes(chapter));
    return subscribeState((state) => setCompleted(state.completed.includes(chapter)));
  }, [chapter]);

  function toggle() {
    const current = readState().completed;
    const next = current.includes(chapter)
      ? current.filter((value) => value !== chapter)
      : [...current, chapter].sort((a, b) => a - b);
    writeState({ completed: next });
  }

  return (
    <div className="chapter-toolbar">
      <button id="mark-complete" className={completed ? 'done' : ''} type="button" onClick={toggle}>
        {completed ? '✓ เรียนแล้ว' : '○ ทำเครื่องหมายว่าเรียนแล้ว'}
      </button>
      <a className="btn-subtle" href={`${basePath}/practice/${chapter}/`}>ลองฝึกทำ ↗</a>
    </div>
  );
}
