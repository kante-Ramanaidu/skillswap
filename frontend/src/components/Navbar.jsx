import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false); // Close dropdown on navigation
  };

  if (!userId) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
        <div className="navbar-logo" onClick={() => handleNavigate('/dashboard')}>
          🔁 SkillSwap
        </div>
      </div>

      <ul className="navbar-main-links">
        <li onClick={() => handleNavigate('/dashboard')}>Dashboard</li>
        <li onClick={() => handleNavigate('/match')}>Matches</li>
        <li onClick={() => handleNavigate(`/progress/${userId}`)}>Progress</li>
        <li onClick={() => handleNavigate('/profile')}>Profile</li> {/* ✅ Added */}
      </ul>

      {menuOpen && (
        <ul className="navbar-dropdown">
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
