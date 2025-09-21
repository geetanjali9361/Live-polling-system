// src/pages/teacher.jsx
import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';
import { socket } from '../context/pollContext';
import Timer from '../components/timer';
import ResultsBar from '../components/resultsBar';
import QuestionForm from '../components/questionForm';
import TabbedSidebar from '../components/tabbedSidebar.jsx';

export default function Teacher() {
  const { poll, activeQ, endsAt, counts, startQuestion, setPoll, currentQuestion } = usePoll();
  const [compose, setCompose] = useState(!poll); // show form when no poll

  // Use currentQuestion if available (for live questions), otherwise use poll question
  const q = currentQuestion || poll?.questions?.[0];

  const openComposer = () => {
    // optional: clear room on the server for a fresh start
    socket.emit('teacher:reset', () => {
      setPoll(null);
      setCompose(true);
    });
  };

  return (
    <div className="page two-col">
      <div className="left">
        {compose && <QuestionForm onCreated={() => setCompose(false)} />}

        {!compose && (poll || currentQuestion) && (
          <>
            <h2>Question</h2>
            {activeQ ? (
              <>
                <div className="row">
                  <h3>{q?.text}</h3>
                  <Timer endsAt={endsAt} />
                </div>
                <ResultsBar 
                  options={q?.options} 
                  counts={counts} 
                  correctIndex={q?.correctIndex}
                  // Teacher doesn't need myAnswer prop
                />
                <p>Wait for the students to answer…</p>
              </>
            ) : (
              <>
                <div className="row">
                  <h3>{q?.text}</h3>
                </div>
                <ResultsBar 
                  options={q?.options} 
                  counts={counts} 
                  correctIndex={q?.correctIndex}
                  // Teacher doesn't need myAnswer prop
                />
                <div style={{ display:'flex', gap:12, marginTop:12 }}>
                  <button className="primary" onClick={() => startQuestion(q?.qid || q?.id || 'q1')}>
                    Ask this question
                  </button>
                  <button onClick={openComposer}>+ New poll</button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="right">
        <TabbedSidebar />
      </div>
    </div>
  );
}