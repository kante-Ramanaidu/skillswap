import { useNavigate } from 'react-router-dom';
import './Dashboard.css';


function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <header className="dashboard-banner">
        <h1>👋 Welcome to SkillSwap</h1>
        <p>Empowering peer-to-peer learning through shared knowledge.</p>
      </header>

      <section className="dashboard-cards">
        <div className="card" onClick={() => navigate('/match')}>
          <h2>🔍 Find Matches</h2>
          <p>Connect with learners and mentors who align with your skill goals.</p>
        </div>

        <div className="card" onClick={() => navigate(`/progress/${localStorage.getItem('userId')}`)}>
          <h2>📊 Track Progress</h2>
          <p>Monitor your growth across learning and teaching sessions.</p>
        </div>

        <div className="card" onClick={() => navigate('/friends')}>
          <h2>✅ Your Friends</h2>
          <p>Manage your learning circle, start a study room, or collaborate.</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
