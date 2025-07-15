import { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfilePage.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profile/${userId}`);
      setProfile(res.data);
    };
    fetchProfile();
  }, [userId]);

  const handleEdit = (field, value) => {
    setEditField(field);
    setEditValue(value);
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/profile/${userId}`, {
        field: editField,
        value: editValue,
      });

      setProfile({
        ...profile,
        [editField]: fieldIsSkill(editField)
          ? editValue.split(',').map((s) => s.trim())
          : editValue,
      });

      setEditField(null);
      setEditValue('');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const fieldIsSkill = (field) => field === 'skills_to_teach' || field === 'skills_to_learn';

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-heading">👤 Your Profile</h2>

      {['name', 'phone'].map((field) => (
        <div className="profile-field" key={field}>
          <label>{field[0].toUpperCase() + field.slice(1)}:</label>
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
        <div className="view-row">
          <span>{profile.email}</span>
        </div>
      </div>

      {['skills_to_teach', 'skills_to_learn'].map((field) => (
        <div className="profile-field" key={field}>
          <label>{field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:</label>
          {editField === field ? (
            <div className="edit-row">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Comma-separated skills (e.g., JavaScript, Python)"
              />
              <button onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="view-row">
              <span>{Array.isArray(profile[field]) ? profile[field].join(', ') : profile[field]}</span>
              <button onClick={() => handleEdit(field, profile[field]?.join(', ') || '')}>✏️</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProfilePage;
