import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';
import ChatWidget from './chatWidget';

export default function TabbedSidebar() {
  const { roster, removeStudent, role } = usePoll();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="tabbed-sidebar">
      <div className="tab-headers">
        <button 
          className={`tab-header ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button 
          className={`tab-header ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          Participants
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'chat' ? (
          <ChatWidget />
        ) : (
          <div className="participants-panel">
            <div className="participants-header">
              <h4>Name</h4>
              {role === 'teacher' && <h4>Action</h4>}
            </div>
            <div className="participants-list">
              {roster.map(r => (
                <div key={r.socketId} className="participant-row">
                  <span className="participant-name">{r.name}</span>
                  {role === 'teacher' && (
                    <button 
                      className="kick-button"
                      onClick={() => removeStudent(r.socketId)}
                    >
                      Kick out
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}