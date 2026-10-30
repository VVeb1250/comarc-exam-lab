import { useEffect, useState } from 'react';
import siteData from '../data/site-data.json';
import { readState, subscribeState } from '../lib/state.js';

export default function ProgressReview({ basePath }) {
  const [state, setState] = useState({ completed: [], answers: {} });
  useEffect(() => {
    setState(readState());
    return subscribeState(setState);
  }, []);
  const total = Object.values(siteData.quizzes).reduce((sum, questions) => sum + questions.length, 0);
  const count = Object.values(state.answers).length;

  return (
    <>
      <div className="eyebrow">STUDY PROGRESS</div>
      <h1 className="hero-title">Review &amp; Progress</h1>
      <p className="hero-lede">เก็บความคืบหน้าใน Browser ของเครื่องนี้โดยไม่ต้องมีบัญชี เพื่อกลับมาทวนเฉพาะข้อที่ยังไม่แม่น</p>
      <div className="review-stats">
        <div><small>CHAPTERS COMPLETED</small><strong>{state.completed.length} / 6</strong></div>
        <div><small>PRACTICE ANSWERED</small><strong>{count} / {total}</strong></div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr>{['บท', 'บทเรียน', 'ความคืบหน้า', 'ย้อนอ่าน'].map((label) => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>{siteData.chapters.map((chapter) => (
            <tr key={chapter.id}>
              <td><strong>{chapter.id}</strong></td>
              <td>{chapter.title}</td>
              <td>{state.completed.includes(chapter.id) ? <span className="good">✓ เรียนแล้ว</span> : 'ยังไม่ได้ทำเครื่องหมาย'}</td>
              <td><a href={`${basePath}/study/${chapter.id}/`}>เปิดบทเรียน ↗</a></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="learning-note info"><strong>Privacy</strong><div>สถานะบันทึกเฉพาะใน localStorage ของเบราว์เซอร์ หากเปิดในเครื่องอื่นจะยังไม่ซิงก์ข้อมูล</div></div>
    </>
  );
}
