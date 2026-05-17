import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFormInput from '../components/AuthFormInput';
import axios from 'axios';
import '../styles/Auth.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.post(`${API_URL}/api/auth/login`, form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);

      setSuccess('Login successful');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <h6 className="auth-welcome">Welcome back</h6>
        <p className="auth-subtitle">Login to continue learning and teaching skills</p>

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

        {/* Divider */}
        <div className="auth-divider">
          <span className="divider-line" />
          <span className="divider-text">OR</span>
          <span className="divider-line" />
        </div>

        {/* Sign up redirect */}
        <p className="auth-redirect">
          Don't have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/signup')}>Sign up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;