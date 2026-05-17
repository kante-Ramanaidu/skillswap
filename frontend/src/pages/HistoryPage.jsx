import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/HistoryPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const formatIST = (dateStr) => {
  if (!dateStr) return '—';
  const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
  return new Date(utcStr).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data);
      } catch (err) {
        setError('❌ Failed to load history');
      }
    };
    if (token) fetchHistory();
  }, [token]);

  // ── derived stats ──
  const totalSessions  = history.length;
  const totalMinutes   = history.reduce((sum, s) => sum + (s.duration || 0), 0);
  const learningSessions = history.filter(s => s.type === 'Learning').length;
  const teachingSessions = history.filter(s => s.type === 'Teaching').length;

  return (
    <div className="history-page">

      {/* ── Page title ── */}
      <h2>Study Session History</h2>

      {/* ── Stats row ── */}
      {history.length > 0 && (
        <div className="history-stats">
          <div className="history-stat-card">
            <div className="history-stat-label">Total Sessions</div>
            <div className="history-stat-value">{totalSessions}</div>
            <div className="history-stat-sub">completed</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-label">Total Time</div>
            <div className="history-stat-value">
              {totalMinutes >= 60
                ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                : `${totalMinutes}m`}
            </div>
            <div className="history-stat-sub">studied</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-label">Learning</div>
            <div className="history-stat-value">{learningSessions}</div>
            <div className="history-stat-sub">sessions</div>
          </div>
          <div className="history-stat-card">
            <div className="history-stat-label">Teaching</div>
            <div className="history-stat-value">{teachingSessions}</div>
            <div className="history-stat-sub">sessions</div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && <p className="error-message">{error}</p>}

      {/* ── Empty state ── */}
      {history.length === 0 && !error ? (
        <div className="history-empty">
          <div className="history-empty-icon">📚</div>
          <h3>No sessions yet</h3>
          <p>Complete your first study session and it will appear here.</p>
        </div>
      ) : (
        /* ── Table ── */
        <div className="history-table-wrap">
          <div className="history-table-scroll">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Concept</th>
                  <th>Duration</th>
                  <th>Completed At (IST)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    {/* Type badge */}
                    <td>
                      <span className={`history-badge ${
                        item.type === 'Learning'
                          ? 'history-badge-learning'
                          : 'history-badge-teaching'
                      }`}>
                        {item.type === 'Learning' ? '' : ''} {item.type}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="history-subject">{item.subject}</td>

                    {/* Concept */}
                    <td className="history-concept">{item.concept}</td>

                    {/* Duration */}
                    <td>
                      <span className="history-duration">
                        <span className="history-duration-dot" />
                        {item.duration} min
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="history-time">{formatIST(item.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default HistoryPage;