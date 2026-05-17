import { Link } from "react-router-dom";
import '../styles/Home.css';

const steps = [
  {
    num: "01",
    icon: "",
    title: "Sign Up",
    desc: "Create your profile and list what you can teach and what you want to learn.",
    color: "purple",
  },
  {
    num: "02",
    icon: "",
    title: "Match",
    desc: "Smart matching finds your ideal swap partner based on goals and skill level.",
    color: "teal",
  },
  {
    num: "03",
    icon: "",
    title: "Learn Together",
    desc: "Collaborate in live sessions with timers, chat, and file sharing.",
    color: "coral",
  },
  {
    num: "04",
    icon: "",
    title: "Grow",
    desc: "Track your progress, earn badges, and unlock new opportunities.",
    color: "blue",
  },
];

const features = [
  {
    icon: "",
    title: "Smart Matching",
    desc: "AI-powered pairing based on goals, availability, and skill level.",
    bg: "purple",
  },
  {
    icon: "",
    title: "Live Sessions",
    desc: "Video calls, chat, shared whiteboards — everything in one place.",
    bg: "teal",
  },
  {
    icon: "",
    title: "File Sharing",
    desc: "Share notes, code, and resources directly in your session.",
    bg: "coral",
  },
  {
    icon: "",
    title: "Progress Tracking",
    desc: "Visualize your learning journey and celebrate milestones.",
    bg: "blue",
  },
];


function Home() {
  return (
    <div className="ss-root">

      {/* NAV */}
      <nav className="ss-nav">
       <div className="ss-nav-logo">
  SkillSwap
</div>
        <div className="ss-nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
        </div>
        <div className="ss-nav-cta">
          <Link to="/login"><button className="ss-btn-ghost">Login</button></Link>
          <Link to="/signup"><button className="ss-btn-primary">Sign up free</button></Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="ss-hero">
        <div className="ss-hero-bg-blob" />
        <div className="ss-hero-text">
          <span className="ss-badge">Real-time skill exchange</span>
          <h1 className="ss-hero-title">
            Learn what you <span className="ss-accent">love.</span><br />
            Teach what you <span className="ss-accent">know.</span>
          </h1>
          <p className="ss-hero-sub">
            Connect with learners and teachers worldwide. Swap skills, collaborate
            in live sessions, and grow together — no money needed.
          </p>
          <div className="ss-hero-actions">
            <Link to="/signup"><button className="ss-btn-primary ss-btn-lg">Get started free</button></Link>
            <a href="#how"><button className="ss-btn-ghost ss-btn-lg">See how it works ↓</button></a>
          </div>
        </div>

        <div className="ss-hero-card-wrap">
          <div className="ss-floating-card ss-card-back2" />
          <div className="ss-floating-card ss-card-back1" />
          <div className="ss-profile-card">
            <div className="ss-card-header">
              <div className="ss-avatar">AK</div>
              <div>
                <div className="ss-card-name">Arjun Kumar</div>
                <div className="ss-card-role">Teaches Python · Learns Guitar</div>
              </div>
            </div>
            <div className="ss-tags">
              <span className="ss-tag ss-tag-purple">Python</span>
              <span className="ss-tag ss-tag-purple">Data Science</span>
              <span className="ss-tag ss-tag-teal">Guitar</span>
              <span className="ss-tag ss-tag-coral">Music Theory</span>
            </div>
            <div className="ss-match-bar">
              <span className="ss-match-label">Match score</span>
              <div className="ss-bar-bg">
                <div className="ss-bar-fill" style={{ width: "88%" }} />
              </div>
              <span className="ss-match-pct">88%</span>
            </div>
          </div>

          <div className="ss-mini-card ss-mini-card-1">
            <span className="ss-mini-icon">🎸</span>
            <span className="ss-mini-text">Guitar swap matched!</span>
          </div>
          <div className="ss-mini-card ss-mini-card-2">
            <span className="ss-mini-icon">🐍</span>
            <span className="ss-mini-text">Python session live</span>
          </div>
        </div>
      </section>

     

      {/* HOW IT WORKS */}
      <section className="ss-section" id="how">
        <div className="ss-section-inner">
          <span className="ss-section-label">How it works</span>
          <h2 className="ss-section-title">Four steps to your next skill</h2>
          <p className="ss-section-sub">
            From signup to learning in minutes. SkillSwap makes peer-to-peer
            skill exchange simple and rewarding.
          </p>
          <div className="ss-steps">
            {steps.map((s) => (
              <div className={`ss-step-card ss-step-${s.color}`} key={s.num}>
                <div className="ss-step-num">{s.num}</div>
                <div className="ss-step-icon">{s.icon}</div>
                <h3 className="ss-step-title">{s.title}</h3>
                <p className="ss-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="ss-section ss-section-alt" id="features">
        <div className="ss-section-inner">
          <span className="ss-section-label">Features</span>
          <h2 className="ss-section-title">Everything you need to learn better</h2>
          <p className="ss-section-sub">
            Built for real collaboration — not just passive watching.
          </p>
          <div className="ss-features">
            {features.map((f) => (
              <div className="ss-feat-card" key={f.title}>
                <div className={`ss-feat-icon ss-feat-icon-${f.bg}`}>{f.icon}</div>
                <div>
                  <h3 className="ss-feat-title">{f.title}</h3>
                  <p className="ss-feat-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ss-cta-section">
        <div className="ss-cta-inner">
          <h2 className="ss-cta-title">Ready to start swapping skills?</h2>
          <p className="ss-cta-sub">
            Join thousands of learners and teachers already growing together.
          </p>
          <div className="ss-cta-btns">
            <Link to="/signup">
              <button className="ss-btn-primary ss-btn-lg">Create free account</button>
            </Link>
           
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ss-footer">
        <div className="ss-nav-logo">
   SkillSwap
</div>
        <div className="ss-footer-links">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <div className="ss-footer-copy">© 2026 SkillSwap</div>
      </footer>
    </div>
  );
}

export default Home;