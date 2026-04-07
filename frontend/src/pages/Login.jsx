import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthFormInput from '../components/AuthFormInput';
import axios from 'axios';
import '../styles/Auth.css';

const API_URL = 'https://skillswap-backend-pbn7.onrender.com';

function Login() {
  // 🔹 State to store form inputs
  const [form, setForm] = useState({ email: '', password: '' });

  // 🔹 State for error & success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Handle login submit
  const handleLogin = async (e) => {
    e.preventDefault();

    // Reset messages
    setError('');
    setSuccess('');

    // 🔹 Basic validation
    if (!form.email || !form.password) {
      setError('⚠️ Please fill in both email and password.');
      return;
    }

    try {
      // 🔹 Get base URL from .env
    

      // 🔹 Send login request to backend
      const res = await axios.post(`${API_URL}/api/auth/login`, form);

      // 🔹 Store JWT token in localStorage
      localStorage.setItem('token', res.data.token);

      // 🔹 Store user ID (optional)
      localStorage.setItem('userId', res.data.user.id);

      // 🔹 Show success message
      setSuccess('✅ Login successful');

      // 🔹 Redirect to dashboard after delay
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (err) {
      // 🔹 Handle error from backend
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        {/* 🔹 Form */}
        <form onSubmit={handleLogin}>

          {/* 🔹 Email Input */}
          <AuthFormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          {/* 🔹 Password Input */}
          <AuthFormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          {/* 🔹 Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* 🔹 Success Message */}
          {success && <p className="success-message">{success}</p>}

          {/* 🔹 Submit Button */}
          <button type="submit" className="auth-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;