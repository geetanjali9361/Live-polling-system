import React, { useEffect, useState } from 'react';

export default function Timer({ endsAt }) {
  const [sec, setSec] = useState(0);
  
  useEffect(() => {
    const tick = () => {
      if (!endsAt) return setSec(0);
      const left = Math.max(0, Math.ceil((endsAt - Date.now())/1000));
      setSec(left);
    };
    tick();
    const t = setInterval(tick, 200);
    return () => clearInterval(t);
  }, [endsAt]);
  
  return (
    <div className="timer">
      ⏰ {String(Math.floor(sec / 60)).padStart(2,'0')}:{String(sec % 60).padStart(2,'0')}
    </div>
  );
}