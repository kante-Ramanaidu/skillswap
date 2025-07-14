// ✅ pages/StudyEnvironment.jsx
import './StudyEnvironment.css';
import { useEffect, useState } from 'react';
import SessionForm from '../components/SessionForm';
import TimerSession from '../components/TimerSession';

function StudyEnvironment() {
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    const savedSession = sessionStorage.getItem('activeSession');
    if (savedSession) {
      setActiveSession(JSON.parse(savedSession));
    }
  }, []);

  const handleStartSession = (sessionData) => {
    setActiveSession(sessionData);
    sessionStorage.setItem('activeSession', JSON.stringify(sessionData));
  };

  const handleEndSession = () => {
    sessionStorage.removeItem('activeSession');
    setActiveSession(null);
  };

  return (
    <div className="study-environment-container">
      {!activeSession ? (
        <SessionForm onStart={handleStartSession} />
      ) : (
        <TimerSession session={activeSession} onEnd={handleEndSession} />
      )}
    </div>
  );
}

export default StudyEnvironment;
