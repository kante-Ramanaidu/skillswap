import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/Dashboard.css';

// ✅ Helper to decode JWT and get userId
const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Save token + userId from Google OAuth redirect
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      const userId = getUserIdFromToken(token);
      if (userId) localStorage.setItem('userId', String(userId));
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const userId = localStorage.getItem('userId');

  return (
    <div className="dashboard-container">

      {/* ===== Banner ===== */}
      <header className="dashboard-banner">
        <h1>Welcome to SkillSwap</h1>
        <p>
          Learn new skills, teach others, and grow together through
          collaborative peer-to-peer learning.
        </p>
      </header>

      {/* ===== Dashboard Cards ===== */}
      <section className="dashboard-cards">

        <div className="card" onClick={() => navigate('/match')}>
          <h2> Find Matches</h2>
          <p>Discover learners and mentors based on your learning and teaching interests.</p>
        </div>

        <div className="card" onClick={() => navigate(`/progress/${userId}`)}>
          <h2> Track Progress</h2>
          <p>Monitor completed topics, study sessions, and your overall learning journey.</p>
        </div>

        <div className="card" onClick={() => navigate('/friends')}>
          <h2> Your Friends</h2>
          <p>Manage your connections, collaborate in study rooms, and continue skill exchange together.</p>
        </div>

      </section>
    </div>
  );
}

export default Dashboard;