import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/TimerSession.css';

const API_URL = 'https://skillswap-backend-pbn7.onrender.com';

function TimerSession({ session, onEnd }) {
  const intervalRef = useRef(null);
  const isEnding = useRef(false);

  const token = localStorage.getItem('token');
  const partnerId = localStorage.getItem('partnerId');

  const durationInSeconds = session.duration * 60;

  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(0, durationInSeconds - Math.floor((Date.now() - session.startTime) / 1000))
  );
  const [partnerPhone, setPartnerPhone] = useState('');
  const [saving, setSaving] = useState(false);

  if (!session || !session.duration || !session.startTime) {
    return <p>Loading session...</p>;
  }

  const handleComplete = async () => {
    if (isEnding.current) return;
    isEnding.current = true;

    clearInterval(intervalRef.current);
    setSaving(true);

    try {
      await axios.post(
        `${API_URL}/api/sessions`,
        {
          type: session.type,
          subject: session.subject,
          concept: session.concept,
          duration: session.duration,
          startTime: session.startTime,
          completedAt: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      sessionStorage.removeItem('activeSession');
      onEnd();

    } catch (err) {
      console.error('Failed to save session:', err);
      alert('Failed to save session. Please try again.');
      isEnding.current = false;
      setSaving(false);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Session will end if you leave!';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/user/${partnerId}/phone`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPartnerPhone(res.data.phone);
      } catch (err) {
        console.error('Failed to fetch phone:', err);
      }
    };
    if (partnerId && token) fetchPhone();
  }, [partnerId, token]);

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="timer-session">
      <h2 className="timer-title">
        {session.type} - {session.subject}
      </h2>

      <p className="timer-subject">{session.concept}</p>

      <div className="timer-count">{formatTime()}</div>

      {saving && (
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          Saving session...
        </p>
      )}

      <div className="button-group">
        <button
          className="end-button"
          disabled={saving}
          onClick={() => {
            if (window.confirm('End session and save to history?')) {
              handleComplete();
            }
          }}
        >
          {saving ? 'Saving...' : 'End Session'}
        </button>
      </div>
    </div>
  );
}

export default TimerSession;