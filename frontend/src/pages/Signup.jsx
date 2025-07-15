import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthFormInput from '../components/AuthFormInput';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const predefinedTeachSkills = ['React', 'Python', 'JavaScript'];
  const predefinedLearnSkills = ['DSA', 'Node.js', 'DevOps'];

  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [customTeach, setCustomTeach] = useState('');
  const [customLearn, setCustomLearn] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const toggleSkill = (skill, list, setList) => {
    if (list.includes(skill)) {
      setList(list.filter(s => s !== skill));
    } else {
      setList([...list, skill]);
    }
  };

  const handleAddSkill = (value, list, setList, clearInput) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    const uniqueSkills = [...new Set([...list, ...skills])];
    setList(uniqueSkills);
    clearInput('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

    const processedForm = {
      ...form,
      skillsToTeach,
      skillsToLearn
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, processedForm);
      localStorage.setItem('userId', res.data.user.id);
      setSuccessMessage('Signup successful');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <AuthFormInput label="Name" type="text" name="name" value={form.name} onChange={handleChange} />
          <AuthFormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
          <AuthFormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} />
          <AuthFormInput label="Phone Number" type="text" name="phone" value={form.phone} onChange={handleChange} />

          {/* === Skills to Teach Section === */}
          <div className="skill-section">
            <label className="auth-label">Skills I Can Teach</label>
            <div className="skill-chips">
              {predefinedTeachSkills.map((skill, i) => (
                <span
                  key={`pre-${i}`}
                  className={`chip ${skillsToTeach.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill, skillsToTeach, setSkillsToTeach)}
                >
                  {skill} {skillsToTeach.includes(skill) && '✅'}
                </span>
              ))}

              {skillsToTeach
                .filter(skill => !predefinedTeachSkills.includes(skill))
                .map((skill, i) => (
                  <span
                    key={`custom-teach-${i}`}
                    className="chip selected custom-chip"
                    onClick={() => toggleSkill(skill, skillsToTeach, setSkillsToTeach)}
                  >
                    {skill} ✅
                  </span>
                ))}
            </div>

            <div className="custom-skill-group">
              <input
                type="text"
                placeholder="Add custom skills (e.g., HTML,C++)"
                value={customTeach}
                onChange={(e) => setCustomTeach(e.target.value)}
                className="custom-skill-input"
              />
              <button
                type="button"
                className="add-button"
                onClick={() => handleAddSkill(customTeach, skillsToTeach, setSkillsToTeach, setCustomTeach)}
              >
                ➕ Add
              </button>
            </div>
          </div>

          {/* === Skills to Learn Section === */}
          <div className="skill-section">
            <label className="auth-label">Skills I Want to Learn</label>
            <div className="skill-chips">
              {predefinedLearnSkills.map((skill, i) => (
                <span
                  key={`pre-learn-${i}`}
                  className={`chip ${skillsToLearn.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill, skillsToLearn, setSkillsToLearn)}
                >
                  {skill} {skillsToLearn.includes(skill) && '✅'}
                </span>
              ))}

              {skillsToLearn
                .filter(skill => !predefinedLearnSkills.includes(skill))
                .map((skill, i) => (
                  <span
                    key={`custom-learn-${i}`}
                    className="chip selected custom-chip"
                    onClick={() => toggleSkill(skill, skillsToLearn, setSkillsToLearn)}
                  >
                    {skill} ✅
                  </span>
                ))}
            </div>

            <div className="custom-skill-group">
              <input
                type="text"
                placeholder="Add custom skills (e.g., Flutter,MySQL)"
                value={customLearn}
                onChange={(e) => setCustomLearn(e.target.value)}
                className="custom-skill-input"
              />
              <button
                type="button"
                className="add-button"
                onClick={() => handleAddSkill(customLearn, skillsToLearn, setSkillsToLearn, setCustomLearn)}
              >
                ➕ Add
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <button type="submit" className="auth-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
