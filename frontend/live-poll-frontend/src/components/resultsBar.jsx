import React from 'react';
export default function ResultsBar({ options=[], counts=[] }) {
  const total = counts.reduce((a,b)=>a+b,0) || 1;
  return (
    <ul className="results">
      {options.map((opt,i)=>{
        const pct = Math.round(100 * (counts[i]||0) / total);
        return (
          <li key={i}>
            <div className="bar" style={{ width: `${pct}%` }} />
            <span className="label">{opt}</span>
            <span className="pct">{pct}%</span>
          </li>
        )
      })}
    </ul>
  );
}
