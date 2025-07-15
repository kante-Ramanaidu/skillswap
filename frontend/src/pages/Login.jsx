import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFormInput from '../components/AuthFormInput';
import axios from 'axios';
import './Auth.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) {
      setError('⚠️ Please fill in both email and password.');
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.post(`${baseURL}/api/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      setSuccess('✅ Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleLogin}>
          <AuthFormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <AuthFormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <button type="submit" className="auth-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
