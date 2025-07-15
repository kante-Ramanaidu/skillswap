// src/pages/ProgressPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { openStudyRoom } from '../components/openStudyRoom';
import './ProgressPage.css';

function ProgressPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    friendId: '',
    skill: '',
    description: '',
    date: '',
    time: '',
    role: 'teacher'
  });

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/friends/${userId}`).then(res => setFriends(res.data));
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/schedules/${userId}`).then(res => setSchedules(res.data));
  }, [userId]);

  const handleSubmit = async () => {
    setFormError('');
    setSuccessMsg('');

    if (!form.friendId || !form.skill || !form.date || !form.time) {
      setFormError('⚠️ Please fill all required fields.');
      return;
    }

    const scheduled_time = new Date(`${form.date}T${form.time}`);
    const teacherId = form.role === 'teacher' ? userId : form.friendId;
    const learnerId = form.role === 'teacher' ? form.friendId : userId;
    const roomId = [teacherId, learnerId, Date.now()].join('_');

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/schedules`, {
        roomId,
        teacherId,
        learnerId,
        skill: form.skill,
        description: form.description,
        scheduled_time
      });

      setSuccessMsg('✅ Session created successfully!');
      setForm({
        friendId: '',
        skill: '',
        description: '',
        date: '',
        time: '',
        role: 'teacher'
      });

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/schedules/${userId}`);
      setSchedules(res.data);
      setShowForm(false);
    } catch (err) {
      setFormError('❌ Failed to create session. Please try again.');
    }
  };

  const markAsCompleted = async (sessionId) => {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/mark-complete/${sessionId}`);
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/schedules/${userId}`);
    setSchedules(res.data);
  };

  const now = new Date();
  const upcoming = schedules.filter(s => new Date(s.scheduled_time) > now && !s.is_completed);
  const completed = schedules.filter(s => s.is_completed === true);

  const goToRoom = (session) => {
    const partnerId = session.teacher_id == userId ? session.learner_id : session.teacher_id;
    const partnerName = session.teacher_id == userId ? session.learner_name : session.teacher_name;

    const path = openStudyRoom({
      currentUserId: userId,
      partnerId,
      partnerName,
      skillsToTeach: [session.skill],
      skillsToLearn: []
    });
    navigate(path);
  };

  return (
    <div className="progress-container">
      <h1 className="progress-title">📈 Track Your Progress</h1>
      <p className="progress-subtitle">Schedule sessions and track your learning journey with friends.</p>

      <div className="progress-actions">
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '📅 Create Schedule'}
        </button>
      </div>

      {showForm && (
        <div className="schedule-form">
          {formError && <p className="error-message">{formError}</p>}
          {successMsg && <p className="success-message">{successMsg}</p>}

          <select value={form.friendId} onChange={e => setForm({ ...form, friendId: e.target.value })}>
            <option value="">Select a Friend</option>
            {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>

          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="teacher">I will teach</option>
            <option value="learner">I will learn</option>
          </select>

          <input type="text" placeholder="Skill" value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} />
          <textarea placeholder="Optional Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          <button className="submit-btn" onClick={handleSubmit}>✅ Submit</button>
        </div>
      )}

      <div className="section">
        <h2>📆 Upcoming Sessions</h2>
        {upcoming.length === 0 ? (
          <p className="empty-msg">No upcoming sessions</p>
        ) : upcoming.map(s => (
          <div key={s.id} className="session-card upcoming">
            <p><strong>Skill:</strong> {s.skill}</p>
            <p><strong>Partner:</strong> {s.teacher_id == userId ? s.learner_name : s.teacher_name}</p>
            <p><strong>Date:</strong> {new Date(s.scheduled_time).toLocaleString()}</p>
            <p><strong>Note:</strong> {s.description}</p>
            <button onClick={() => goToRoom(s)}>💬 Join Room</button>
          </div>
        ))}
      </div>

      <div className="section">
        <h2>✅ Completed Sessions</h2>
        {completed.length === 0 ? (
          <p className="empty-msg">No completed sessions</p>
        ) : completed.map(s => (
          <div key={s.id} className="session-card completed">
            <p><strong>Skill:</strong> {s.skill}</p>
            <p><strong>Partner:</strong> {s.teacher_id == userId ? s.learner_name : s.teacher_name}</p>
            <p><strong>Completed:</strong> {new Date(s.scheduled_time).toLocaleString()}</p>
            <p><strong>Note:</strong> {s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressPage;
