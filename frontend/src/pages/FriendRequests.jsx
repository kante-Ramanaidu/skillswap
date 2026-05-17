import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/FriendRequests.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        setError('Failed to load requests');
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
      setRequests(requests.filter(r => r.id !== requestId));
      setSuccessMsg(' Friend request accepted!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError('⚠️ Failed to accept request');
    }
  };

  const declineRequest = async (requestId) => {
    try {
      await axios.post(
        `${API_URL}/api/friend-request/decline`,
        { requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(requests.filter(r => r.id !== requestId));
      setSuccessMsg(' Friend request declined.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError('⚠️ Failed to decline request');
    }
  };

  return (
    <div className="friend-requests-container">
      <h2 className="friend-requests-title">Incoming Friend Requests</h2>

      {successMsg && <p className="success-message">{successMsg}</p>}
      {error && <p className="error-message">{error}</p>}

      {requests.length === 0 ? (
        <p className="no-requests-msg">No friend requests at the moment.</p>
      ) : (
        <div className="friend-requests-list">
          {requests.map(req => (
            <div key={req.id} className="request-card">
              <div className="profile-circle">{req.sender_name?.charAt(0).toUpperCase()}</div>
              <p className="request-name">{req.sender_name}</p>
              <div className="request-actions">
                <button className="accept-btn" onClick={() => acceptRequest(req.id)}> Accept</button>
                <button className="decline-btn" onClick={() => declineRequest(req.id)}> Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendRequests;