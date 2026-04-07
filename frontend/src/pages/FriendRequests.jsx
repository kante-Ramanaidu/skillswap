import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/FriendRequests.css';

const API_URL = 'https://your-backend.onrender.com';

function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/friend-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load requests');
      }
    };
    if (token) fetchRequests();
  }, [token]);

  const acceptRequest = async (requestId) => {
    try {
      await axios.post(
        `${API_URL}/api/friend-request/accept`,
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Friend request accepted!");
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (err) {
      console.error(err);
      setError('⚠️ Failed to accept request');
    }
  };

  return (
    <div className="friend-requests-container">
      <h2 className="friend-requests-title">Incoming Friend Requests</h2>

      {error && <p className="error-message">{error}</p>}

      {requests.length === 0 ? (
        <p className="no-requests-msg">No friend requests at the moment.</p>
      ) : (
        <div className="friend-requests-list">
          {requests.map(req => (
            <div key={req.id} className="request-card">
              <p className="request-name">{req.sender_name}</p>
              <button className="accept-btn" onClick={() => acceptRequest(req.id)}>
                Accept ✅
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendRequests;