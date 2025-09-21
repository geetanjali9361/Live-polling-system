import React, { useState } from 'react';
import PollProvider, { usePoll } from './context/pollContext';
import RoleSelect from './pages/roleSelect';
import Teacher from './pages/teacher';
import Student from './pages/student';
import './style.css';

function Shell() {
  const { role } = usePoll();
  const [stage, setStage] = useState('role'); // role | main

  if (stage === 'role') return <RoleSelect onContinue={()=>setStage('main')} />;
  if (role === 'teacher') return <Teacher />;
  return <Student />;
}

export default function App() {
  return (
    <PollProvider>
      <Shell />
    </PollProvider>
  );
}
