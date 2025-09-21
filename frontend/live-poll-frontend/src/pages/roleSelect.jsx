import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';

export default function RoleSelect({ onContinue }) {
  const { setRole } = usePoll();
  const [tempRole, setTempRole] = useState('student');

  return (
    <div className="page role-select-page">
      <div className="role-select-content">
        <div className="header-badge">Interactive Poll</div>
        
        <h1>Welcome to the <strong>Live Polling System</strong></h1>
        <p className="subtitle">Please select the role that best describes you to begin using the live polling system.</p>
        
        <div className="role-cards-horizontal">
          <button
            className={`role-card ${tempRole === 'student' ? 'active' : ''}`}
            onClick={() => setTempRole('student')}
          >
            <h3>I'm a Student</h3>
            <p>Answer live polls and instantly see class results.</p>
          </button>
          <button
            className={`role-card ${tempRole === 'teacher' ? 'active' : ''}`}
            onClick={() => setTempRole('teacher')}
          >
            <h3>I'm a Teacher</h3>
            <p>Ask questions and view student responses in real time.</p>
          </button>
        </div>
        
        <button className="primary" onClick={() => { setRole(tempRole); onContinue(); }}>
          Continue
        </button>
      </div>
    </div>
  );
}