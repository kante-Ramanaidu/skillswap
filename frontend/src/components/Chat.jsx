import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/Chat.css';

//const socket = io(import.meta.env.VITE_API_BASE_URL);  // ✅ UPDATED
const socket = io('http://localhost:5000');
function Chat() {
  const { roomId } = useParams();
  const senderId = localStorage.getItem('userId');
  const partnerPhone = localStorage.getItem('partnerPhone');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  // ✅ WhatsApp handler
  const handleWhatsApp = () => {
    if (!partnerPhone) return alert("Partner's phone number not available.");
    const number = partnerPhone.startsWith('+') ? partnerPhone : `+91${partnerPhone}`;
    window.open(`https://wa.me/${number}`, '_blank');
  };

  // ✅ Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
       const res = await axios.get(`http://localhost:5000/api/chat/${roomId}`); // ✅ UPDATED
        const filtered = res.data.filter(msg => msg.content?.trim() !== '');
        setMessages(filtered);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    if (roomId) fetchMessages();
  }, [roomId]);

  // ✅ Join room and listen for real-time messages
  useEffect(() => {
    if (!roomId || !senderId) return;

    socket.emit('joinRoom', roomId);

    const handleReceiveMessage = (msg) => {
      if (!msg.message?.trim()) return;
      setMessages(prev => [...prev, msg]);
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [roomId, senderId]);

  // ✅ Send message
  const handleSend = () => {
    if (message.trim()) {
      socket.emit('sendMessage', {
        roomId,
        senderId,
        message: message.trim()
      });
      setMessage('');
    }
  };

  // ✅ Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2> Chat Room </h2>
        {partnerPhone && (
          <button className="whatsapp-button" onClick={handleWhatsApp}>
            WhatsApp 📞
          </button>
        )}
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.senderId == senderId ? 'sent' : 'received'}`}
          >
            <strong>{msg.senderId == senderId ? 'You' : msg.sender_name || msg.senderName}:</strong>{' '}
            {msg.message || msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
