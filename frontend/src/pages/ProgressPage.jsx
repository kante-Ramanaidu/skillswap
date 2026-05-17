import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { openStudyRoom } from '../components/openStudyRoom';
import '../styles/ProgressPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function ProgressPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({ friendId: '', skill: '', description: '', date: '', time: '', role: 'teacher' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const friendsRes = await axios.get(`${API_URL}/api/friends`, { headers: { Authorization: `Bearer ${token}` } });
        setFriends(friendsRes.data);
        const schedulesRes = await axios.get(`${API_URL}/api/schedules/me`, { headers: { Authorization: `Bearer ${token}` } });
        setSchedules(schedulesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async () => {
    setFormError('');
    setSuccessMsg('');
    if (!form.friendId || !form.skill || !form.date || !form.time) {
      setFormError(' Please fill all required fields.');
      return;
    }
    const scheduled_time = new Date(`${form.date}T${form.time}`);
    const roomId = [form.friendId, Date.now()].join('_');
    try {
      await axios.post(
        `${API_URL}/api/schedules`,
        { roomId, friendId: form.friendId, skill: form.skill, description: form.description, scheduled_time, role: form.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(' Session created successfully!');
      setForm({ friendId: '', skill: '', description: '', date: '', time: '', role: 'teacher' });
      const res = await axios.get(`${API_URL}/api/schedules/me`, { headers: { Authorization: `Bearer ${token}` } });
      setSchedules(res.data);
      setShowForm(false);
    } catch (err) {
      setFormError(' Failed to create session. Please try again.');
      console.error(err);
    }
  };

  const markAsCompleted = async (sessionId) => {
    try {
      await axios.post(`${API_URL}/api/schedules/mark-complete/${sessionId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.get(`${API_URL}/api/schedules/me`, { headers: { Authorization: `Bearer ${token}` } });
      setSchedules(res.data);
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const now = new Date();
  const upcoming = schedules.filter(s => new Date(s.scheduled_time) > now && !s.is_completed);
  const completed = schedules.filter(s => s.is_completed);

  const goToRoom = (session) => {
    const partnerId = session.teacher_id === session.userId ? session.learner_id : session.teacher_id;
    const partnerName = session.teacher_id === session.userId ? session.learner_name : session.teacher_name;
    const path = openStudyRoom({ currentUserId: session.userId, partnerId, partnerName, skillsToTeach: [session.skill], skillsToLearn: [] });
    navigate(path);
  };

  return (
    <div className="progress-container">
      <h4 className="progress-title"> Track Your Progress</h4>
      <p className="progress-subtitle">Schedule sessions and track your learning journey with friends.</p>
      <div className="progress-actions">
        <button className="create-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : ' Create Schedule'}
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
          <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        </div>
      )}
      <div className="section">
        <h2>Upcoming Sessions</h2>
        {upcoming.length === 0 ? <p className="empty-msg">No upcoming sessions</p> : upcoming.map(s => (
          <div key={s.id} className="session-card upcoming">
            <p><strong>Skill:</strong> {s.skill}</p>
            <p><strong>Partner:</strong> {s.teacher_id === s.userId ? s.learner_name : s.teacher_name}</p>
            <p><strong>Date:</strong> {new Date(s.scheduled_time).toLocaleString()}</p>
            <p><strong>Note:</strong> {s.description}</p>
            <button onClick={() => goToRoom(s)}>Join Room</button>
            <button onClick={() => markAsCompleted(s.id)}>Mark Complete</button>
          </div>
        ))}
      </div>
      <div className="section">
        <h2>Completed Sessions</h2>
        {completed.length === 0 ? <p className="empty-msg">No completed sessions</p> : completed.map(s => (
          <div key={s.id} className="session-card completed">
            <p><strong>Skill:</strong> {s.skill}</p>
            <p><strong>Partner:</strong> {s.teacher_id === s.userId ? s.learner_name : s.teacher_name}</p>
            <p><strong>Completed:</strong> {new Date(s.scheduled_time).toLocaleString()}</p>
            <p><strong>Note:</strong> {s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressPage;