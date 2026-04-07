import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/Chat.css';

const API_URL = 'https://your-backend.onrender.com';

function Chat({ roomId, socket }) {
  const senderId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const partnerName = localStorage.getItem('partnerName');

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(socket?.connected || false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onMessage = (msg) => {
      if (msg.content?.trim()) setMessages(prev => [...prev, msg]);
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receiveMessage', onMessage);
    setConnected(socket.connected);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receiveMessage', onMessage);
    };
  }, [socket]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data.filter(msg => msg.content?.trim()));
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    if (roomId) fetchMessages();
  }, [roomId]);

  const handleSend = () => {
    if (!message.trim() || !socket?.connected) return;
    socket.emit('sendMessage', { roomId, message: message.trim() });
    setMessage('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-root">
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-header-icon">💬</span>
          <span className="chat-header-name">{partnerName || 'Partner'}</span>
        </div>
        <div className={`chat-conn-dot ${connected ? 'on' : 'off'}`} />
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <div style={{ fontSize: '2rem' }}>👋</div>
            <p>Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMine = String(msg.sender_id) === String(senderId);
          return (
            <div key={idx} className={`chat-msg ${isMine ? 'mine' : 'theirs'}`}>
              {!isMine && <div className="chat-msg-name">{msg.sender_name}</div>}
              <div className="chat-msg-bubble">{msg.content}</div>
              <div className="chat-msg-time">{formatTime(msg.timestamp)}</div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          type="text"
          value={message}
          placeholder="Type a message…"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={!message.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default Chat;