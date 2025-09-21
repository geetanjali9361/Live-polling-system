import React from 'react';
import { usePoll } from '../context/pollContext';

export default function RosterPanel() {
  const { roster, removeStudent, role } = usePoll();
  if (role !== 'teacher') return null;

  return (
    <div className="panel">
      <h4>Participants</h4>
      <ul>
        {roster.map(r => (
          <li key={r.socketId}>
            {r.name}
            <button onClick={()=>removeStudent(r.socketId)}>Kick out</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
