// components/SessionForm.jsx
import { useState } from 'react';
import './SessionForm.css';

function SessionForm({ onStart }) {
  const [form, setForm] = useState({
    type: 'Learning',
    subject: '',
    concept: '',
    duration: 30,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const handleStart = () => {
  if (form.subject && form.concept && form.duration > 0) {
    const sessionWithTime = {
      ...form,
      startTime: Date.now(), // in milliseconds
    };
    onStart(sessionWithTime);
    sessionStorage.setItem('activeSession', JSON.stringify(sessionWithTime));
  } else {
    alert('Please fill all fields.');
  }
};

  return (
    <div className="session-form">
      <h2 className="form-title"> Start New Session</h2>

      <div className="form-group">
        <label>Mode</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option>Learning</option>
          <option>Teaching</option>
        </select>
      </div>

      <div className="form-group">
        <label>Subject</label>
        <input name="subject" value={form.subject} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Concept</label>
        <input name="concept" value={form.concept} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Duration (minutes)</label>
        <input
          type="number"
          name="duration"
          value={form.duration}
          onChange={handleChange}
        />
      </div>

      <button className="start-button" onClick={handleStart}>
        Start Session
      </button>
    </div>
  );
}

export default SessionForm;
