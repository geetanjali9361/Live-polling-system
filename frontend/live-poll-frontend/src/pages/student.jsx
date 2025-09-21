import React, { useEffect, useState } from 'react';
import { usePoll } from '../context/pollContext';
import { socket } from '../context/pollContext';
import Timer from '../components/timer';
import ResultsBar from '../components/resultsBar';
import TabbedSidebar from '../components/tabbedSidebar.jsx';

export default function Student() {
  const { name, setName, joined, poll, activeQ, endsAt, counts, joinAsStudent, currentQuestion } = usePoll();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [myAnswer, setMyAnswer] = useState(null);

  useEffect(() => { 
    setSubmitted(false); 
    setSelected(null); 
    setMyAnswer(null);
  }, [activeQ]);

  const join = async () => {
    const ack = await joinAsStudent((name || '').trim());
    if (!ack?.ok) alert(ack?.msg || 'Join failed');
  };

  if (!joined) {
    return (
      <div className="page">
        <div className="container">
          <div className="header-badge">Interactive Poll</div>
          
          <h2>Let's Get Started</h2>
          <p className="subtitle">If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates</p>
          
          <div className="form-group">
            <label>Enter your Name</label>
            <input
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="form-control"
            />
          </div>
          
          <button className="primary" onClick={join}>Continue</button>
        </div>
      </div>
    );
  }

  if (!poll && !currentQuestion) {
    return (
      <div className="page center">
        <div className="container">
          <div className="header-badge">Interactive Poll</div>
          <div className="loading-spinner"></div>
          <h3>Wait for the teacher to ask questions...</h3>
        </div>
      </div>
    );
  }

  const q = currentQuestion || poll?.questions?.[0];

  const submit = () => {
    if (activeQ == null || selected == null) return;
    socket.emit('student:answer', { questionId: activeQ, optionIndex: selected }, (ack) => {
      if (!ack?.ok) return alert(ack?.msg || 'Submit failed');
      setSubmitted(true);
      setMyAnswer(selected);
    });
  };

  return (
    <div className="two-col">
      <div className="left">
        <div className="header-badge">Interactive Poll</div>
        
        {activeQ ? (
          <>
            <div className="row">
              <h3>Question 1</h3>
              <Timer endsAt={endsAt} />
            </div>
            <div className="question-text">{q?.text}</div>
            
            {!submitted ? (
              <>
                <ul className="options">
                  {q?.options?.map((opt,i) => (
                    <li key={i} className="option">
                      <button
                        className={`option-button ${selected === i ? 'selected' : ''}`}
                        onClick={() => setSelected(i)}
                      >
                        <input
                          type="radio"
                          name="opt"
                          checked={selected === i}
                          onChange={() => setSelected(i)}
                          className="option-radio"
                        />
                        <span>{opt}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button className="primary" disabled={!joined || selected == null} onClick={submit}>
                  Submit
                </button>
              </>
            ) : (
              <>
                <ResultsBar 
                  options={q?.options} 
                  counts={counts} 
                  correctIndex={q?.correctIndex}
                  myAnswer={myAnswer}
                />
                <p className="waiting-message">Wait for the teacher to ask a new question.</p>
              </>
            )}
          </>
        ) : (
          <>
            <ResultsBar 
              options={q?.options} 
              counts={counts} 
              correctIndex={q?.correctIndex}
              myAnswer={myAnswer}
            />
            <p className="waiting-message">Wait for the teacher to ask a new question..</p>
          </>
        )}
      </div>
      
      <div className="right">
        <TabbedSidebar />
      </div>
    </div>
  );
}