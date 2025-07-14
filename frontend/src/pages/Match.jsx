// src/pages/Match.jsx
import './Match.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Match() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post('http://localhost:5000/api/match', { userId });
        setMatches(res.data.matchedUsers);

        const friendsRes = await axios.get(`http://localhost:5000/api/friends/${userId}`);
        setFriends(friendsRes.data.map(f => f.id));

        const pendingRes = await axios.get(`http://localhost:5000/api/sent-friend-requests/${userId}`);
        setPendingRequests(pendingRes.data.map(req => req.receiver_id));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('❌ Failed to fetch data. Please try again.');
      }
    };

    if (userId) fetchData();
  }, [userId]);

  const sendFriendRequest = async (receiverId) => {
    try {
      const res = await axios.post('http://localhost:5000/api/friend-request', {
        senderId: userId,
        receiverId,
      });
      setPendingRequests([...pendingRequests, receiverId]);
      setSuccessMsg(res.data.message || '✅ Friend request sent!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Failed to send friend request:", err);
      setError("⚠️ Could not send friend request.");
    }
  };

  return (
    <div className="matches-container">
      <h1 className="matches-title">🤝 Find Your Perfect Match</h1>
      <p className="match-subtitle">
        Explore learners and teachers aligned with your skill goals.
      </p>

      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}

      {matches.length === 0 ? (
        <p className="no-matches">
          😕 No matches found at the moment. Try updating your skills or check back later!
        </p>
      ) : (
        <div className="match-cards">
          {matches.map(user => (
            <div key={user.id} className="match-card">
              <div className="profile-circle">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="match-name">{user.name}</div>

              <div className="match-section">
                <strong>Can Teach:</strong>
                <div className="badge-container">
                  {user.skills_to_teach.map((skill, i) => (
                    <span key={i} className="badge">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="match-section">
                <strong>Wants to Learn:</strong>
                <div className="badge-container">
                  {user.skills_to_learn.map((skill, i) => (
                    <span key={i} className="badge badge-learn">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="match-actions">
                {friends.includes(user.id) ? (
                  <span className="friend-status success">✅ Already Friends</span>
                ) : pendingRequests.includes(user.id) ? (
                  <span className="friend-status pending">⏳ Request Sent</span>
                ) : (
                  <button
                    className="chat-button"
                    onClick={() => sendFriendRequest(user.id)}
                  >
                    Send Friend Request 👋
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Match;
