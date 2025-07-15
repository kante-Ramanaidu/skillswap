import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          🔁 SkillSwap
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
              <li onClick={() => handleNavigate('/match')}>🤝 Matches</li>
              <li onClick={() => handleNavigate(`/progress/${userId}`)}>📊 Progress</li>
              <li onClick={() => handleNavigate('/profile')}>👤 Profile</li>
            </>
          )}
          <li onClick={() => handleNavigate('/friend-requests')}>👥 Friend Requests</li>
          <li onClick={() => handleNavigate('/friends')}>✅ Friends</li>
          <li onClick={() => handleNavigate('/history')}>📖 History</li>
          <li onClick={handleLogout}>🚪 Logout</li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
