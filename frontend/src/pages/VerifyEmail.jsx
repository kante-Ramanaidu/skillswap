import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [subMessage, setSubMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('❌ Invalid verification link.');
      setSubMessage('No token found in the URL.');
      setSuccess(false);
      return;
    }

    console.log('API_URL:', API_URL);
    console.log('Token:', token);

    axios.get(`${API_URL}/api/auth/verify-email?token=${token}`)
      .then((res) => {
        console.log('Verify success:', res.data);
        setMessage('✅ Email verified successfully!');
        setSubMessage('Redirecting to login in 3 seconds...');
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        console.error('Verify error:', err.response?.data || err.message);
        const errMsg = err.response?.data?.message || err.message || 'Unknown error';
        setMessage('❌ Verification failed.');
        setSubMessage(errMsg);
        setSuccess(false);
      });
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>

        {/* Spinner while verifying */}
        {success === null && (
          <div style={{ marginBottom: '20px' }}>
            <span className="spinner" style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(79,255,203,0.15)',
              borderTopColor: '#4fffcb',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        )}

        <h2 className="auth-title" style={{ fontSize: '1.4rem' }}>{message}</h2>

        {subMessage && (
          <p className="auth-subtitle" style={{ marginTop: '10px' }}>{subMessage}</p>
        )}

        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {success === false && (
            <button className="auth-button" onClick={() => navigate('/signup')}>
              Go to Signup
            </button>
          )}
          {success === true && (
            <button className="auth-button" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default VerifyEmail;