import React, { useState, useEffect } from 'react';

export default function PollHistory({ onClose }) {
  const [history, setHistory] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/polls/history`);
      const data = await response.json();
      if (data.success) {
        setHistory(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPollDetails = async (pollId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/polls/history/${pollId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedPoll(data);
      }
    } catch (error) {
      console.error('Failed to fetch poll details:', error);
    }
  };

  if (selectedPoll) {
    return (
      <div className="poll-history-modal">
        <div className="poll-history-content">
          <div className="poll-history-header">
            <h2>{selectedPoll.poll.title}</h2>
            <div>
              <button onClick={() => setSelectedPoll(null)} className="secondary-btn">← Back</button>
              <button onClick={onClose} className="secondary-btn">✕ Close</button>
            </div>
          </div>
          
          <div className="poll-details">
            <p><strong>Created:</strong> {new Date(selectedPoll.poll.createdAt).toLocaleString()}</p>
            
            {selectedPoll.results.map((result, idx) => (
              <div key={idx} className="question-result">
                <h3>Question: {result.questionText}</h3>
                <div className="question-meta">
                  <p>Completed: {new Date(result.endedAt).toLocaleString()}</p>
                  <p>Total Responses: {result.responses.length}</p>
                </div>
                
                <ul className="results">
                  {result.options.map((option, i) => {
                    const count = result.counts[i] || 0;
                    const total = result.responses.length;
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isCorrect = i === result.correctIndex;
                    
                    return (
                      <li key={i} className={`result-item ${isCorrect ? 'correct-answer' : ''}`}>
                        <div className={`bar ${isCorrect ? 'bar-green' : ''}`} style={{ width: `${percentage}%` }} />
                        <div className="result-content">
                          <span className="label">{option}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="pct">{percentage}%</span>
                            {isCorrect && <span className="status-badge">CORRECT</span>}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-history-modal">
      <div className="poll-history-content">
        <div className="poll-history-header">
          <h2>Poll History</h2>
          <button onClick={onClose} className="secondary-btn">✕ Close</button>
        </div>
        
        {loading ? (
          <div className="loading-spinner"></div>
        ) : history.length === 0 ? (
          <p className="waiting-message">No poll history available yet.</p>
        ) : (
          <div className="history-list">
            {history.map((poll) => (
              <div key={poll._id} className="history-item">
                <div className="history-info">
                  <h3>{poll.title}</h3>
                  <p>Last Completed: {new Date(poll.lastCompleted).toLocaleDateString()}</p>
                  <p>Questions: {poll.totalQuestions}</p>
                </div>
                <button 
                  onClick={() => viewPollDetails(poll._id)}
                  className="secondary-btn"
                >
                  View Results
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}