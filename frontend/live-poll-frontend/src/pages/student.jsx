// src/pages/student.jsx
import React, { useEffect, useState } from 'react';
import { usePoll } from '../context/pollContext';
import { socket } from '../context/pollContext'; // use the SAME socket
import Timer from '../components/timer';
import ResultsBar from '../components/resultsBar';
import TabbedSidebar from '../components/tabbedSidebar.jsx';

export default function Student() {
  const { name, setName, joined, poll, activeQ, endsAt, counts, joinAsStudent, currentQuestion } = usePoll();
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [myAnswer, setMyAnswer] = useState(null); // Track what the student answered

  useEffect(() => { 
    setSubmitted(false); 
    setSelected(null); 
    setMyAnswer(null); // Reset when new question starts
  }, [activeQ]);

  const join = async () => {
    const ack = await joinAsStudent((name || '').trim());
    if (!ack?.ok) alert(ack?.msg || 'Join failed');
  };

  // show join form until actually joined
  if (!joined) {
    return (
      <div className="page">
        <h2>Let's Get Started</h2>
        <input
          placeholder="Enter your name"
          value={name}
          onChange={e=>setName(e.target.value)}
        />
        <button className="primary" onClick={join}>Continue</button>
      </div>
    );
  }

  if (!poll && !currentQuestion) {
    return (
      <div className="page center">
        <h3>Wait for the teacher to ask questions…</h3>
      </div>
    );
  }

  // Use currentQuestion if available, fallback to poll question
  const q = currentQuestion || poll?.questions?.[0];

  const submit = () => {
    if (activeQ == null || selected == null) return;
    socket.emit('student:answer', { questionId: activeQ, optionIndex: selected }, (ack)=>{
      if (!ack?.ok) return alert(ack?.msg || 'Submit failed');
      setSubmitted(true);
      setMyAnswer(selected); // Remember what they answered
    });
  };

  return (
    <div className="page two-col">
      <div className="left">
        {activeQ ? (
          <>
            <div className="row">
              <h3>Question 1</h3>
              <Timer endsAt={endsAt} />
            </div>
            <h2>{q?.text}</h2>

            {!submitted ? (
              <>
                <ul className="options">
                  {q?.options?.map((opt,i)=>(
                    <li key={i} className="option">
                      <div className="choice">
                        <label>
                          <input
                            type="radio"
                            name="opt"
                            checked={selected===i}
                            onChange={()=>setSelected(i)}
                          />
                          {opt}
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className="primary" disabled={!joined || selected==null} onClick={submit}>
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
                <p>Wait for the teacher to ask a new question.</p>
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
            <p>Wait for the teacher to ask a new question..</p>
          </>
        )}
      </div>

      <div className="right">
        <TabbedSidebar />
      </div>
    </div>
  );
}