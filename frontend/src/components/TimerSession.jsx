import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/TimerSession.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function TimerSession({ session, onEnd }) {
  const intervalRef = useRef(null);
  const isEnding = useRef(false);
  const secondsLeftRef = useRef(
    Math.max(0, session.duration * 60 - Math.floor((Date.now() - session.startTime) / 1000))
  );

  const token = localStorage.getItem('token');
  const partnerId = localStorage.getItem('partnerId');

  const durationInSeconds = session.duration * 60;

  const [secondsLeft, setSecondsLeft] = useState(secondsLeftRef.current);
  const [saving, setSaving] = useState(false);

  if (!session || !session.duration || !session.startTime) {
    return <p>Loading session...</p>;
  }

  // ✅ IST display of session start time
  const startTimeIST = new Date(session.startTime).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    day: '2-digit',
    month: 'short',
  });

  const handleComplete = async () => {
    if (isEnding.current) return;
    isEnding.current = true;
    clearInterval(intervalRef.current);
    setSaving(true);

    const secondsRan = durationInSeconds - secondsLeftRef.current;
    const minutesActuallyRan = Math.max(1, Math.round(secondsRan / 60));

    try {
      await axios.post(
        `${API_URL}/api/sessions`,
        {
          type: session.type,
          subject: session.subject,
          concept: session.concept,
          duration: minutesActuallyRan,
          startTime: session.startTime,
          // ✅ removed completedAt — backend uses NOW() (always correct UTC)
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
        const next = prev - 1;
        secondsLeftRef.current = next;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          handleComplete();
          return 0;
        }
        return next;
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
        await axios.get(
          `${API_URL}/api/user/${partnerId}/phone`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  const minutesRanSoFar = Math.round((durationInSeconds - secondsLeft) / 60);

  return (
    <div className="timer-session">
      <h2 className="timer-title">
        {session.type} - {session.subject}
      </h2>

      <p className="timer-subject">{session.concept}</p>

      <p className="timer-starttime">Started at {startTimeIST} IST</p>

      <div className="timer-count">{formatTime()}</div>

      <p className="timer-ran">
        {minutesRanSoFar > 0 ? `${minutesRanSoFar} min run so far` : 'Just started'}
      </p>

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