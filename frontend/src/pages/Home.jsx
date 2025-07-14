// Home.jsx
import { Link } from "react-router-dom";
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-text">
          <h1 className="home-title">SkillSwap 🚀</h1>
          <p className="home-tagline">
            Learn what you love. Teach what you know. <br />
            Connect, grow, and collaborate through real-time learning.
          </p>
          <div className="home-buttons">
            <Link to="/login">
              <button className="btn login-btn">Login</button>
            </Link>
            <Link to="/signup">
              <button className="btn signup-btn">Signup</button>
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/online-learning-6299030-5207327.png"
            alt="Learning Illustration"
          />
        </div>
      </header>

      <section className="how-it-works">
        <h2>How SkillSwap Works 💡</h2>
        <div className="workflow">
          <div className="step">
            <h3>🧑‍💻 Sign Up</h3>
            <p>Create your profile, add skills you can teach or learn.</p>
          </div>
          <div className="step">
            <h3>🤝 Match</h3>
            <p>Find perfect matches based on your goals and skills.</p>
          </div>
          <div className="step">
            <h3>📚 Study Together</h3>
            <p>Collaborate in sessions with timers, chat, and file sharing.</p>
          </div>
          <div className="step">
            <h3>📈 Grow</h3>
            <p>Track your progress and unlock new learning opportunities.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
