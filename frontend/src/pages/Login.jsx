import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import AuthFormInput from '../components/AuthFormInput';
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

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Handle token from Google OAuth redirect
  useEffect(() => {
    const token = searchParams.get('token');
    const err   = searchParams.get('error');

    if (token) {
      localStorage.setItem('token', token);
      const userId = getUserIdFromToken(token);
      if (userId) localStorage.setItem('userId', String(userId));
      navigate('/dashboard');
    }
    if (err) {
      setError('Google sign in failed. Please try again.');
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('userId', String(res.data.user.id)); // ✅ save userId
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>
        <p className="auth-subtitle">Welcome back! Sign in to continue.</p>

        {/* ✅ Google Sign In Button */}
        <button className="google-btn" onClick={handleGoogleLogin} type="button">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
          Continue with Google
        </button>

        <div className="auth-divider">
          <span className="divider-line" />
          <span className="divider-text">OR</span>
          <span className="divider-line" />
        </div>

        <form onSubmit={handleLogin}>
          <AuthFormInput label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
          <AuthFormInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} />

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <span className="btn-loader"><span className="spinner" /> Logging in...</span> : 'Login'}
          </button>
        </form>

        <p className="auth-redirect">
          Don't have an account?{' '}
          <span className="auth-link" onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default Login;