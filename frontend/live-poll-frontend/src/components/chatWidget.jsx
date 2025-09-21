import React, { useState } from 'react';
import { usePoll } from '../context/pollContext';

export default function ChatWidget() {
  const { chat, sendChat } = usePoll();
  const [msg, setMsg] = useState('');
  const onSend = async () => {
    const text = msg.trim();
    if (!text) return;
    await sendChat(text);
    setMsg('');
  };

  return (
    <div className="chat">
      <div className="chat-log">
        {chat.map((m,i)=>(
          <div key={i} className={`bubble ${m.fromRole}`}>
            <b>{m.name}:</b> {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Message…" />
        <button onClick={onSend}>Send</button>
      </div>
    </div>
  );
}
