import React, { useState, useRef, useEffect } from 'react';
import './ChatboxAI.css';
const BACKEND_URL = 'http://localhost:5000';

export default function ChatboxAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Mình có thể gợi ý giống thú cưng phù hợp với nhu cầu của bạn.' }
  ]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Xin lỗi, có lỗi xảy ra.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Không gọi được AI. Thử lại nhé.' }]);
    } finally {
      setLoading(false);
    }
  };
  const onKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="ai-chatbox">
      {open && (
        <div className="ai-chatbox-panel">
          <div className="ai-chatbox-header">
            <strong>Tư vấn nhận nuôi (AI)</strong>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="ai-chatbox-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}><div className="bubble">{m.content}</div></div>
            ))}
            {loading && <div className="msg assistant"><div className="bubble">Đang nhập...</div></div>}
            <div ref={endRef} />
          </div>
          <div className="ai-chatbox-input">
            <textarea
              rows={2}
              placeholder="Mô tả không gian, có trẻ nhỏ/thú cưng khác, mức vận động..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="button-primary" onClick={send} disabled={loading}>Gửi</button>
          </div>
        </div>
      )}
      <button className="ai-chatbox-toggle button-primary" onClick={() => setOpen(!open)}>
        {open ? 'Ẩn tư vấn' : 'Tư vấn AI'}
      </button>
    </div>
  );
}