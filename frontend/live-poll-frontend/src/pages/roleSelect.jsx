import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';

export default function RoleSelect({ onContinue }) {
  const { setRole } = usePoll();
  const [tempRole, setTempRole] = useState('student');

  return (
    <div className="page">
      <h1>Welcome to the <b>Live Polling System</b></h1>
      <div className="cards">
        <button
          className={`card ${tempRole==='student'?'active':''}`}
          onClick={() => setTempRole('student')}
        >I’m a Student</button>

        <button
          className={`card ${tempRole==='teacher'?'active':''}`}
          onClick={() => setTempRole('teacher')}
        >I’m a Teacher</button>
      </div>

      <button className="primary" onClick={() => { setRole(tempRole); onContinue(); }}>
        Continue
      </button>
    </div>
  );
}
