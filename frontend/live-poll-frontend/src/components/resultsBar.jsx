import React from 'react';

export default function ResultsBar({ 
  options = [], 
  counts = [], 
  correctIndex = null, 
  myAnswer = null 
}) {
  const total = counts.reduce((a,b)=>a+b,0) || 1;
  
  return (
    <ul className="results">
      {options.map((opt,i)=>{
        const pct = Math.round(100 * (counts[i]||0) / total);
        const isCorrect = correctIndex !== null && i === correctIndex;
        const isMyAnswer = myAnswer !== null && i === myAnswer;
        const isMyCorrectAnswer = isMyAnswer && isCorrect;
        const isMyWrongAnswer = isMyAnswer && !isCorrect;
        
        // Determine bar color and class
        let barClass = "bar";
        let listClass = "result-item";
        let statusText = "";
        
        if (isMyCorrectAnswer) {
          barClass = "bar bar-green";
          listClass = "result-item correct-answer";
          statusText = "CORRECT";
        } else if (isMyWrongAnswer) {
          barClass = "bar bar-red";
          listClass = "result-item wrong-answer";
          statusText = "WRONG";
        } else if (isCorrect) {
          barClass = "bar bar-green";
          listClass = "result-item correct-answer";
          statusText = "CORRECT";
        }
        
        return (
          <li key={i} className={listClass}>
            <div className={barClass} style={{ width: `${pct}%` }} />
            <div className="result-content">
              <span className="label">{opt}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pct">{pct}%</span>
                {statusText && <span className="status-badge">{statusText}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}