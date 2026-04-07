import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/HistoryPage.css';

const API_URL = 'https://skillswap-backend-pbn7.onrender.com';

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
        console.error('Failed to fetch session history:', err);
        setError('❌ Failed to load history');
      }
    };
    if (token) fetchHistory();
  }, [token]);

  return (
    <div className="history-page">
      <h2>🕒 Study Session History</h2>

      {error && <p className="error-message">{error}</p>}

      {history.length === 0 ? (
        <p>No sessions completed yet.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Subject</th>
              <th>Concept</th>
              <th>Duration (min)</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx}>
                <td>{item.type}</td>
                <td>{item.subject}</td>
                <td>{item.concept}</td>
                <td>{item.duration}</td>
                <td>{new Date(item.completed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistoryPage;