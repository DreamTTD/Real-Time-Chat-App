import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem('chat_name') || 'You');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [presence, setPresence] = useState(0);
  const [system, setSystem] = useState('');
  const socketRef = useRef(null);
  const bottom = useRef(null);

  useEffect(() => {
    const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      socket.emit('set-name', name);
      socket.emit('join');
      setJoined(true);
    });
    socket.on('history', (list) => setMessages(list));
    socket.on('chat:message', (m) => setMessages((prev) => [...prev, m]));
    socket.on('system', (t) => setSystem(t));
    socket.on('presence', setPresence);
    return () => socket.close();
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    socketRef.current?.emit('chat:message', t);
    setInput('');
  }

  function saveName() {
    localStorage.setItem('chat_name', name);
    socketRef.current?.emit('set-name', name);
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <img src="/assets/images/project-7.png" alt="" style={heroImg} />
      <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>Team chat (demo)</h1>
      <p style={{ color: '#9ca3af', margin: '0 0 12px', fontSize: 14 }}>
        Open multiple tabs — live messages &amp; connection count. Room: <strong>lobby</strong>
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #374151', background: '#111827', color: '#fff' }}
        />
        <button type="button" onClick={saveName} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: '#374151', color: '#fff' }}>
          Set name
        </button>
        <span style={{ fontSize: 13, color: presence > 1 ? '#86efac' : '#9ca3af' }}>Online: {presence}</span>
      </div>
      {system && <p style={{ fontSize: 13, color: '#93c5fd' }}>{system}</p>}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#161b26',
          borderRadius: 12,
          padding: 16,
          border: '1px solid #252a3a',
          marginBottom: 12,
        }}
      >
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 10, fontSize: 14 }}>
            <span style={{ color: '#fbbf24', fontWeight: 600 }}>{m.name}</span>
            <span style={{ color: '#6b7280', marginLeft: 8, fontSize: 12 }}>{new Date(m.at).toLocaleTimeString()}</span>
            <div style={{ marginTop: 4 }}>{m.text}</div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={joined ? 'Message…' : 'Connecting…'}
          disabled={!joined}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #374151', background: '#111827', color: '#fff' }}
        />
        <button type="submit" style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#fbbf24', color: '#111', fontWeight: 600 }}>
          Send
        </button>
      </form>
    </div>
  );
}

const heroImg = {
  width: '100%',
  maxHeight: 140,
  objectFit: 'cover',
  borderRadius: 12,
  marginBottom: 12,
  border: '1px solid #374151',
  flexShrink: 0,
};
