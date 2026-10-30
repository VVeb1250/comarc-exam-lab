import { useEffect, useState } from 'react';
import siteData from '../data/site-data.json';
import { readState, subscribeState } from '../lib/state.js';

export default function ExamLibrary({ basePath }) {
  const [completed, setCompleted] = useState([]);
  useEffect(() => {
    setCompleted(readState().completed);
    return subscribeState((state) => setCompleted(state.completed));
  }, []);

  return (
    <>
      <div className="eyebrow">EXAM COLLECTION</div>
      <h1 className="hero-title">Computer Architecture: Visual Textbook ฉบับสมบูรณ์</h1>
      <p className="hero-lede">ข้อสอบ FE2019b · ข้อ 1–6 · พื้นฐาน → กลไก → ตัวอย่าง → เฉลย</p>
      <p>บทเรียนนี้เรียงตามข้อสอบจริง แต่เพิ่มภาพประกอบและ UI ในจุดที่ต้องมองเห็นการทำงานของฮาร์ดแวร์ โดยยังคงเหตุผลและรายละเอียดของแต่ละข้อไว้ ไม่ลดเป็น Cheat Sheet</p>
      <div className="library-heading">
        <div><strong>แผนการเรียนทั้ง 6 ข้อ</strong><span>FE2019b · ข้อ 1–6</span></div>
        <span className="pill">{completed.length}/6 เรียนแล้ว</span>
      </div>
      <div className="library-grid">
        {siteData.chapters.map((chapter) => (
          <a className="library-card" href={`${basePath}/study/${chapter.id}/`} key={chapter.id}>
            <div className="lib-top"><span>CHAPTER {String(chapter.id).padStart(2, '0')}</span>{completed.includes(chapter.id) && <span className="good">✓ เรียนแล้ว</span>}</div>
            <h3>{chapter.title}</h3><p>{chapter.subtitle}</p>
            <div className="lib-bottom">เปิดบทเรียน <span>↗</span></div>
          </a>
        ))}
      </div>
      <div className="learning-note info"><strong>Reading-first</strong><div>เนื้อหาทั้งหกข้อแบ่ง Concept, Diagram, Worked Example และเฉลยครบ การ์ดและ UI ใช้เพื่ออธิบายกลไก ไม่ใช่แทนเหตุผลของบทเรียน</div></div>
    </>
  );
}
