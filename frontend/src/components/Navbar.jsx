import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Navbar.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/friend-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
       
        setPendingCount(res.data.length);
      } catch (err) {
        console.error('Failed to fetch pending requests:', err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  if (!userId) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
        <div className="navbar-logo" onClick={() => handleNavigate('/dashboard')}>
          SkillSwap
        </div>
      </div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <ul className="navbar-main-links">
          <li onClick={() => handleNavigate('/dashboard')}>Dashboard</li>
          <li onClick={() => handleNavigate('/match')}>Matches</li>
          <li onClick={() => handleNavigate(`/progress/${userId}`)}>Progress</li>
          <li onClick={() => handleNavigate('/profile')}>Profile</li>
        </ul>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <ul className="navbar-main-links mobile-only">
          <li onClick={() => handleNavigate('/dashboard')}>Dashboard</li>
        </ul>
      )}

      {menuOpen && (
        <ul className="navbar-dropdown">
          {isMobile && (
            <>
              <li onClick={() => handleNavigate('/match')}>Matches</li>
              <li onClick={() => handleNavigate(`/progress/${userId}`)}>Progress</li>
              <li onClick={() => handleNavigate('/profile')}>Profile</li>
            </>
          )}
          <li onClick={() => handleNavigate('/friend-requests')} className="nav-item-badge">
            Friend Requests
            {pendingCount > 0 && (
              <span className="nav-badge">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </li>
          <li onClick={() => handleNavigate('/friends')}>Friends</li>
          <li onClick={() => handleNavigate('/history')}>History</li>
          <li onClick={handleLogout}>➜ Logout</li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;