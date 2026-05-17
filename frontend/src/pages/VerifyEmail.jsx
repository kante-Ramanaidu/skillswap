import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('❌ Invalid verification link.');
      setSuccess(false);
      return;
    }

    axios.get(`${API_URL}/api/auth/verify-email?token=${token}`)
      .then(() => {
        setMessage('✅ Email verified successfully!  Redirecting to login...');
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(() => {
        setMessage('❌ Invalid or expired link. Please signup again.');
        setSuccess(false);
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>{message}</h2>
      {success === false && (
        <button onClick={() => navigate('/signup')}>
          Go to Signup
        </button>
      )}
      {success === true && (
        <button onClick={() => navigate('/login')}>
          Go to Login
        </button>
      )}
    </div>
  );
}

export default VerifyEmail;