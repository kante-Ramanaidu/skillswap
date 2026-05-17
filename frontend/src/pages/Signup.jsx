import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthFormInput from '../components/AuthFormInput';
import '../styles/Auth.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const predefinedTeachSkills = ['React', 'Python', 'JavaScript'];
  const predefinedLearnSkills = ['DSA', 'Node.js', 'DevOps'];
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [customTeach, setCustomTeach] = useState('');
  const [customLearn, setCustomLearn] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // ✅ loading state

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!form.name || !form.email || !form.password || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (skillsToTeach.length === 0 || skillsToLearn.length === 0) {
      setError('Please select at least one skill to teach and one to learn.');
      return;
    }

    setLoading(true); // ✅ start loading
    try {
      await axios.post(`${API_URL}/api/auth/signup`, {
        ...form, skillsToTeach, skillsToLearn
      });
      setSuccessMessage('📧 Signup successful! Please check your email to verify your account.');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false); // ✅ stop loading always
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>
        <p className="auth-subtitle">Create your account and start swapping skills today</p>

        <form onSubmit={handleSignup}>

          <AuthFormInput label="Name" type="text" name="name" value={form.name} onChange={handleChange} />
          <AuthFormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
          <AuthFormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} />
          <AuthFormInput label="Phone Number" type="text" name="phone" value={form.phone} onChange={handleChange} />

          {/* Skills to Teach */}
          <div className="skill-section">
            <label className="auth-label">Skills I Can Teach</label>
            <div className="skill-chips">
              {predefinedTeachSkills.map((skill, i) => (
                <span
                  key={i}
                  className={`chip ${skillsToTeach.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill, skillsToTeach, setSkillsToTeach)}
                >
                  {skill} {skillsToTeach.includes(skill) && '✅'}
                </span>
              ))}
            </div>
            <div className="skill-input-row">
              <input
                type="text"
                placeholder="Add custom skills (comma separated)"
                value={customTeach}
                onChange={(e) => setCustomTeach(e.target.value)}
                className="skill-input"
              />
              <button
                type="button"
                className="skill-add-btn"
                onClick={() => handleAddSkill(customTeach, skillsToTeach, setSkillsToTeach, setCustomTeach)}
              >
                Add
              </button>
            </div>
            <div className="selected-skills">
              {skillsToTeach.map((skill, i) => (
                <span key={i} className="chip selected" onClick={() => removeSkill(skill, skillsToTeach, setSkillsToTeach)}>
                  {skill} ❌
                </span>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          <div className="skill-section">
            <label className="auth-label">Skills I Want to Learn</label>
            <div className="skill-chips">
              {predefinedLearnSkills.map((skill, i) => (
                <span
                  key={i}
                  className={`chip ${skillsToLearn.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill, skillsToLearn, setSkillsToLearn)}
                >
                  {skill} {skillsToLearn.includes(skill) && '✅'}
                </span>
              ))}
            </div>
            <div className="skill-input-row">
              <input
                type="text"
                placeholder="Add custom skills (comma separated)"
                value={customLearn}
                onChange={(e) => setCustomLearn(e.target.value)}
                className="skill-input"
              />
              <button
                type="button"
                className="skill-add-btn"
                onClick={() => handleAddSkill(customLearn, skillsToLearn, setSkillsToLearn, setCustomLearn)}
              >
                Add
              </button>
            </div>
            <div className="selected-skills">
              {skillsToLearn.map((skill, i) => (
                <span key={i} className="chip selected" onClick={() => removeSkill(skill, skillsToLearn, setSkillsToLearn)}>
                  {skill} ❌
                </span>
              ))}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          {/* ✅ Loading button */}
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <span className="btn-loader">
                <span className="spinner" /> Sending verification email...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

        </form>

        {/* OR Divider */}
        <div className="auth-divider">
          <span className="divider-line" />
          <span className="divider-text">OR</span>
          <span className="divider-line" />
        </div>

        {/* Login redirect */}
        <p className="auth-redirect">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/login')}>Login</span>
        </p>

      </div>
    </div>
  );
}

export default Signup;