// src/components/resultBar.jsx
import React from 'react';

export default function ResultsBar({ 
  options = [], 
  counts = [], 
  correctIndex = null, 
  myAnswer = null 
}) {
  const total = counts.reduce((a,b)=>a+b,0) || 1;
  
  return (
    <ul className="options">
      {options.map((opt,i)=>{
        const pct = Math.round(100 * (counts[i]||0) / total);
        const isCorrect = correctIndex !== null && i === correctIndex;
        const isMyAnswer = myAnswer !== null && i === myAnswer;
        const isMyCorrectAnswer = isMyAnswer && isCorrect;
        const isMyWrongAnswer = isMyAnswer && !isCorrect;
        
        // Determine the CSS classes
        let optionClass = "option frozen";
        if (isMyCorrectAnswer) {
          optionClass += " chosen-correct";
        } else if (isMyWrongAnswer) {
          optionClass += " chosen-wrong";
        } else if (isCorrect) {
          optionClass += " correct";
        }
        
        return (
          <li key={i} className={optionClass}>
            <div className="pill">
              <div className="bar" style={{ width: `${pct}%` }} />
              <span className="label">{opt}</span>
              <span className="pct">{pct}%</span>
              
              {/* Show tags for correct answer and user's choice */}
              <div className="tags">
                {isCorrect && correctIndex !== null && (
                  <span className="tag correct">Correct</span>
                )}
                {isMyCorrectAnswer && (
                  <span className="tag ok">You ✓</span>
                )}
                {isMyWrongAnswer && (
                  <span className="tag you">You</span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}