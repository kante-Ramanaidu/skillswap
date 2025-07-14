// ✅ HistoryPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import './HistoryPage.css'; // optional styling

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sessions/${userId}`);
        setHistory(res.data);
      } catch (err) {
        console.error('Failed to fetch session history:', err);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div className="history-page">
      <h2>🕒 Study Session History</h2>

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
