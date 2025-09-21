import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';

export default function RoleSelect({ onContinue }) {
  const { setRole } = usePoll();
  const [tempRole, setTempRole] = useState('student');

  return (
    <div className="page">
      <div className="container">
        <div className="header-badge">Interactive Poll</div>
        
        <h1>Welcome to the <strong>Live Polling System</strong></h1>
        <p className="subtitle">Please select the role that best describes you to begin using the live polling system.</p>
        
        <div className="cards">
          <button
            className={`card ${tempRole === 'student' ? 'active' : ''}`}
            onClick={() => setTempRole('student')}
          >
            <h3>I'm a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </button>
          <button
            className={`card ${tempRole === 'teacher' ? 'active' : ''}`}
            onClick={() => setTempRole('teacher')}
          >
            <h3>I'm a Teacher</h3>
            <p>Submit answers and view live poll results in real-time</p>
          </button>
        </div>
        
        <button className="primary" onClick={() => { setRole(tempRole); onContinue(); }}>
          Continue
        </button>
      </div>
    </div>
  );
}