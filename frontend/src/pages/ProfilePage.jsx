import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  // ✅ Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/profile/${userId}`
        );
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile');
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  const handleEdit = (field, value) => {
    setEditField(field);
    setEditValue(value || '');
  };

  // ✅ Save Profile Update
  const handleSave = async () => {
    if (!editField) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/profile/${userId}`,
        {
          field: editField,
          value: editValue,
        }
      );

      setProfile(prev => ({
        ...prev,
        [editField]: fieldIsSkill(editField)
          ? editValue.split(',').map(s => s.trim())
          : editValue,
      }));

      setEditField(null);
      setEditValue('');

    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const fieldIsSkill = (field) =>
    field === 'skills_to_teach' || field === 'skills_to_learn';

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-heading">👤 Your Profile</h2>

      {error && <p className="error-message">{error}</p>}

      {/* ✅ Name + Phone */}
      {['name', 'phone'].map((field) => (
        <div className="profile-field" key={field}>
          <label>
            {field.charAt(0).toUpperCase() + field.slice(1)}:
          </label>

          {editField === field ? (
            <div className="edit-row">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
              <button onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="view-row">
              <span>{profile[field]}</span>
              <button
                onClick={() => handleEdit(field, profile[field])}
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      ))}

      {/* ✅ Email */}
      <div className="profile-field">
        <label>Email:</label>
        <div className="view-row">
          <span>{profile.email}</span>
        </div>
      </div>

      {/* ✅ Skills */}
      {['skills_to_teach', 'skills_to_learn'].map((field) => (
        <div className="profile-field" key={field}>
          <label>
            {field
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())}
            :
          </label>

          {editField === field ? (
            <div className="edit-row">
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Comma-separated skills"
              />
              <button onClick={handleSave}>Save</button>
            </div>
          ) : (
            <div className="view-row">
              <span>
                {Array.isArray(profile[field])
                  ? profile[field].join(', ')
                  : profile[field]}
              </span>

              <button
                onClick={() =>
                  handleEdit(
                    field,
                    Array.isArray(profile[field])
                      ? profile[field].join(', ')
                      : ''
                  )
                }
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProfilePage;