import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';

export default function ChatWidget() {
  const { chat, sendChat } = usePoll();
  const [msg, setMsg] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const onSend = async () => {
    const text = msg.trim();
    if (!text) return;
    await sendChat(text);
    setMsg('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬 Chat {chat.length > 0 && <span className="chat-badge">{chat.length}</span>}
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <h4>Live Chat</h4>
            <button 
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-widget-messages">
            {chat.length === 0 ? (
              <div className="chat-empty">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chat.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.fromRole}`}>
                  <div className="chat-bubble-header">
                    <strong>{m.name}</strong>
                    <span className="chat-time">
                      {new Date(m.ts || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="chat-bubble-text">{m.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="chat-widget-input">
            <input 
              value={msg} 
              onChange={e => setMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..." 
              maxLength={200}
            />
            <button 
              onClick={onSend}
              disabled={!msg.trim()}
              className="chat-send-btn"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}