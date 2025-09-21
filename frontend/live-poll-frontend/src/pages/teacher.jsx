import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';
import { socket } from '../context/pollContext';
import Timer from '../components/timer';
import ResultsBar from '../components/resultsBar';
import QuestionForm from '../components/questionForm';
import TabbedSidebar from '../components/tabbedSidebar.jsx';
import PollHistory from '../components/pollHistory';

export default function Teacher() {
  const { poll, activeQ, endsAt, counts, startQuestion, setPoll, currentQuestion } = usePoll();
  const [compose, setCompose] = useState(!poll);
  const [showHistory, setShowHistory] = useState(false);

  const q = currentQuestion || poll?.questions?.[0];

  const openComposer = () => {
    socket.emit('teacher:reset', () => {
      setPoll(null);
      setCompose(true);
    });
  };

  return (
    <>
      <div className="two-col">
        <div className="left">
          {compose && <QuestionForm onCreated={() => setCompose(false)} />}
          
          {!compose && (poll || currentQuestion) && (
            <>
              <div className="header-badge">Interactive Poll</div>
              
              <h2>Question</h2>
              {activeQ ? (
                <>
                  <div className="row">
                    <div className="question-text">{q?.text}</div>
                    <Timer endsAt={endsAt} />
                  </div>
                  <ResultsBar 
                    options={q?.options} 
                    counts={counts} 
                    correctIndex={q?.correctIndex}
                  />
                  <p className="waiting-message">Wait for the students to answer...</p>
                </>
              ) : (
                <>
                  <div className="question-text">{q?.text}</div>
                  <ResultsBar 
                    options={q?.options} 
                    counts={counts} 
                    correctIndex={q?.correctIndex}
                  />
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button className="primary" onClick={() => startQuestion(q?.qid || q?.id || 'q1')}>
                      Ask this question
                    </button>
                    <button className="secondary-btn" onClick={openComposer}>
                      + New poll
                    </button>
                    <button className="secondary-btn" onClick={() => setShowHistory(true)}>
                      📊 View History
                    </button>
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

      {showHistory && <PollHistory onClose={() => setShowHistory(false)} />}
    </>
  );
}