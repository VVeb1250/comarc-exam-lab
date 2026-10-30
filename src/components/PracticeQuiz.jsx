import { useEffect, useState } from 'react';
import siteData from '../data/site-data.json';
import { readState, subscribeState, writeState } from '../lib/state.js';

export default function PracticeQuiz({ chapter, basePath }) {
  const [answers, setAnswers] = useState({});
  const quiz = siteData.quizzes[String(chapter)] || [];
  const chapterInfo = siteData.chapters[chapter - 1];

  useEffect(() => {
    setAnswers(readState().answers);
    return subscribeState((state) => setAnswers(state.answers));
  }, []);

  function answerQuestion(key, value) {
    const next = { ...readState().answers, [key]: value };
    writeState({ answers: next });
  }

  return (
    <>
      <div className="eyebrow">PRACTICE LAB / CHAPTER {String(chapter).padStart(2, '0')}</div>
      <h1 className="hero-title">{chapterInfo.title}</h1>
      <p className="hero-lede">ลองตอบจากความเข้าใจ แล้วดูเหตุผลทันที หากไม่แน่ใจสามารถกลับไปอ่านบทเรียนได้โดยไม่เสียคำตอบเดิม</p>
      <div className="view-tabs">
        <a href={`${basePath}/study/${chapter}/`}>▤ บทเรียน</a>
        <a className="active" href={`${basePath}/practice/${chapter}/`}>✎ ฝึกทำ</a>
      </div>
      {quiz.map((item, itemIndex) => {
        const key = `${chapter}-${itemIndex}`;
        const chosen = answers[key];
        return (
          <div className="quiz-card" key={key}>
            <div className="quiz-number">QUESTION {itemIndex + 1} / {quiz.length}</div>
            <h3>{item.q}</h3>
            {item.choices.map((choice, choiceIndex) => (
              <button
                type="button"
                className={`quiz-option ${chosen === choiceIndex ? 'selected' : ''} ${chosen !== undefined && choiceIndex === item.correct ? 'correct' : ''} ${chosen === choiceIndex && chosen !== item.correct ? 'wrong' : ''}`}
                data-action="answer"
                data-key={key}
                data-value={choiceIndex}
                key={choiceIndex}
                onClick={() => answerQuestion(key, choiceIndex)}
              >
                <span className="letter">{String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span>
              </button>
            ))}
            {chosen !== undefined && (
              <div className={`quiz-feedback ${chosen === item.correct ? 'ok' : 'no'}`}>
                <strong>{chosen === item.correct ? '✓ ถูกต้อง' : 'ลองทบทวนอีกครั้ง'}</strong><div>{item.why}</div>
              </div>
            )}
          </div>
        );
      })}
      <div className="lesson-nav">
        <a href={`${basePath}/study/${chapter}/`}>← กลับไปอ่านบทเรียน</a>
        <a href={`${basePath}/practice/${chapter < 6 ? chapter + 1 : 1}/`}>ฝึกข้อ {chapter < 6 ? chapter + 1 : 1} →</a>
      </div>
    </>
  );
}
