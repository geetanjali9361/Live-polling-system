import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';
import { socket } from '../lib/socket';

export default function QuestionForm({ onCreated }) {
  const { setPoll } = usePoll();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [opts, setOpts] = useState(['','']);
  const [correct, setCorrect] = useState(0);
  const [limit, setLimit] = useState(60);

  const addOpt = () => setOpts(o => [...o, '']);
  const setOpt = (i, v) => setOpts(o => o.map((x,idx)=> idx===i ? v : x));

  const submit = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/polls`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        title: title || 'Untitled Poll',
        durationSec: Number(limit),
        questions: [{
          id: 'q1',
          text,
          options: opts.filter(Boolean),
          correctIndex: Number(correct)
        }]
      })
    });
    const data = await res.json();
    const poll = data.poll;

    await new Promise((resolve) => {
      socket.emit('teacher:loadPoll', { pollId: poll._id }, () => resolve());
    });

    const qid = poll.questions[0].qid || 'q1';
    socket.emit('teacher:startQuestion', { questionId: qid });
    setPoll(poll);
    onCreated?.();
  };

  return (
    <div className="panel">
      <div className="header-badge">Interactive Poll</div>
      
      <h2>Let's Get Started</h2>
      <p className="subtitle">You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>

      <div className="form-group">
        <label>Poll title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Solar System Quiz"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <div className="row">
          <label>Enter your question</label>
          <select value={limit} onChange={e => setLimit(e.target.value)} className="form-control" style={{ width: 'auto' }}>
            {[15,30,45,60,90].map(s => <option key={s} value={s}>{s} seconds</option>)}
          </select>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Which planet is known as the Red Planet?"
          className="form-control"
        />
      </div>

      <div className="options-section">
        <h4 style={{ marginBottom: '16px', color: '#333' }}>Edit Options</h4>
        {opts.map((v,i) => (
          <div key={i} className="option-row">
            <input
              value={v}
              onChange={e => setOpt(i, e.target.value)}
              placeholder={`Option ${i+1}`}
              className="form-control option-input"
            />
            <div className="correct-radio">
              <input
                type="radio"
                checked={Number(correct) === i}
                onChange={() => setCorrect(i)}
              />
              <span>Correct</span>
            </div>
          </div>
        ))}
        <button onClick={addOpt} className="add-option-btn">+ Add More option</button>
      </div>

      <button className="primary" onClick={submit}>Ask Question (create poll)</button>
    </div>
  );
}