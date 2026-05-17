import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ProfilePage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('❌ Failed to load profile');
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleEdit = (field, value) => { setEditField(field); setEditValue(value || ''); };

  const handleSave = async () => {
    if (!editField) return;
    try {
      await axios.patch(
        `${API_URL}/api/profile`,
        { field: editField, value: editValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(prev => ({
        ...prev,
        [editField]: fieldIsSkill(editField) ? editValue.split(',').map(s => s.trim()) : editValue,
      }));
      setEditField(null);
      setEditValue('');
    } catch (err) {
      console.error(err);
      setError('⚠️ Update failed');
    }
  };

  const fieldIsSkill = (field) => field === 'skills_to_teach' || field === 'skills_to_learn';

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-heading"> Your Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {['name', 'phone'].map((field) => (
        <div className="profile-field" key={field}>
          <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
          {editField === field ? (
            <div className="edit-row">
              <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
              <button onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="view-row">
              <span>{profile[field]}</span>
              <button onClick={() => handleEdit(field, profile[field])}>✏️</button>
            </div>
          )}
        </div>
      ))}
      <div className="profile-field">
        <label>Email:</label>
        <div className="view-row"><span>{profile.email}</span></div>
      </div>
      {['skills_to_teach', 'skills_to_learn'].map((field) => (
        <div className="profile-field" key={field}>
          <label>{field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:</label>
          {editField === field ? (
            <div className="edit-row">
              <input value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="Comma-separated skills" />
              <button onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="view-row">
              <span>{Array.isArray(profile[field]) ? profile[field].join(', ') : profile[field]}</span>
              <button onClick={() => handleEdit(field, Array.isArray(profile[field]) ? profile[field].join(', ') : '')}>✏️</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProfilePage;