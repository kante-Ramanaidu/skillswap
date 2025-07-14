// components/TimerSession.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import './TimerSession.css';

function TimerSession({ session, onEnd }) {
  if (!session || !session.duration || !session.startTime) {
    return <p>⏳ Loading session...</p>;
  }

  const durationInSeconds = session.duration * 60;
  const [secondsLeft, setSecondsLeft] = useState(
    durationInSeconds - Math.floor((Date.now() - session.startTime) / 1000)
  );
  const [partnerPhone, setPartnerPhone] = useState('');
  const userId = localStorage.getItem('userId');
  const partnerId = localStorage.getItem('partnerId');

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave? Your session will end.';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/${partnerId}/phone`);
        setPartnerPhone(res.data.phone);
      } catch (err) {
        console.error('Failed to fetch phone number:', err);
      }
    };
    fetchPhone();
  }, [partnerId]);

  const handleComplete = async () => {
    try {
      await axios.post('http://localhost:5000/api/sessions', {
        userId,
        ...session,
        completedAt: new Date().toISOString(),
      });
      sessionStorage.removeItem('activeSession');
      onEnd();
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="timer-session">
      <h2 className="timer-title">⏳ {session.type} - {session.subject}</h2>
      <p className="timer-subject">{session.concept}</p>
      <div className="timer-count">{formatTime()}</div>

      <div className="button-group">
        <button className="end-button" onClick={() => {
          const confirmEnd = window.confirm("Do you want to end the session?");
          if (confirmEnd) handleComplete();
        }}>
           End Session Early
        </button>

        {partnerPhone && (
          <a
            href={`https://wa.me/91${partnerPhone}?text=Let's start our SkillSwap session!`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
          >
             Join on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

export default TimerSession;
