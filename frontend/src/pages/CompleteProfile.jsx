import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Helper to decode JWT and get userId
const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
};

function CompleteProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const name  = searchParams.get('name');
  const email = searchParams.get('email');

  const predefinedTeachSkills = ['React', 'Python', 'JavaScript'];
  const predefinedLearnSkills = ['DSA', 'Node.js', 'DevOps'];

  const [phone, setPhone] = useState('');
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [customTeach, setCustomTeach] = useState('');
  const [customLearn, setCustomLearn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill, list, setList) => {
    if (list.includes(skill)) setList(list.filter(s => s !== skill));
    else setList([...list, skill]);
  };

  const handleAddSkill = (value, list, setList, clearInput) => {
    if (!value.trim()) return;
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    setList([...new Set([...list, ...skills])]);
    clearInput('');
  };

  const removeSkill = (skill, list, setList) => setList(list.filter(s => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone) return setError('Phone number is required.');
    if (skillsToTeach.length === 0 || skillsToLearn.length === 0)
      return setError('Please select at least one skill to teach and one to learn.');

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/complete-profile`, {
        token, phone, skillsToTeach, skillsToLearn
      });

      // ✅ Save token + userId
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userId', String(res.data.user.id));
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Complete Your Profile</h2>
        <p className="auth-subtitle">Welcome {name}! Just a few more details.</p>
        <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>{email}</p>

        <form onSubmit={handleSubmit}>

          <div className="auth-input-group">
            <label className="auth-label">Phone Number</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Skills to Teach */}
          <div className="skill-section">
            <label className="auth-label">Skills I Can Teach</label>
            <div className="skill-chips">
              {predefinedTeachSkills.map((skill, i) => (
                <span key={i} className={`chip ${skillsToTeach.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill, skillsToTeach, setSkillsToTeach)}>
                  {skill} {skillsToTeach.includes(skill) && '✅'}
                </span>
              ))}
            </div>
            <div className="skill-input-row">
              <input type="text" placeholder="Add custom skills (comma separated)"
                value={customTeach} onChange={(e) => setCustomTeach(e.target.value)} className="skill-input" />
              <button type="button" className="skill-add-btn"
                onClick={() => handleAddSkill(customTeach, skillsToTeach, setSkillsToTeach, setCustomTeach)}>Add</button>
            </div>
            <div className="selected-skills">
              {skillsToTeach.map((skill, i) => (
                <span key={i} className="chip selected"
                  onClick={() => removeSkill(skill, skillsToTeach, setSkillsToTeach)}>{skill} ❌</span>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          <div className="skill-section">
            <label className="auth-label">Skills I Want to Learn</label>
            <div className="skill-chips">
              {predefinedLearnSkills.map((skill, i) => (
                <span key={i} className={`chip ${skillsToLearn.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill, skillsToLearn, setSkillsToLearn)}>
                  {skill} {skillsToLearn.includes(skill) && '✅'}
                </span>
              ))}
            </div>
            <div className="skill-input-row">
              <input type="text" placeholder="Add custom skills (comma separated)"
                value={customLearn} onChange={(e) => setCustomLearn(e.target.value)} className="skill-input" />
              <button type="button" className="skill-add-btn"
                onClick={() => handleAddSkill(customLearn, skillsToLearn, setSkillsToLearn, setCustomLearn)}>Add</button>
            </div>
            <div className="selected-skills">
              {skillsToLearn.map((skill, i) => (
                <span key={i} className="chip selected"
                  onClick={() => removeSkill(skill, skillsToLearn, setSkillsToLearn)}>{skill} ❌</span>
              ))}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;