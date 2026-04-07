import '../styles/Match.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_URL = 'https://your-backend.onrender.com';

function Match() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const matchRes = await axios.get(`${API_URL}/api/match`, config);
        setMatches(matchRes.data.matchedUsers);
        const friendsRes = await axios.get(`${API_URL}/api/friends`, config);
        setFriends(friendsRes.data.map(f => f.id));
        const pendingRes = await axios.get(`${API_URL}/api/sent-friend-requests`, config);
        setPendingRequests(pendingRes.data.map(req => req.receiver_id));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('❌ Failed to fetch data.');
      }
    };
    if (token) fetchData();
  }, [token]);

  const sendFriendRequest = async (receiverId) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/friend-request`,
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingRequests([...pendingRequests, receiverId]);
      setSuccessMsg(res.data.message || '✅ Friend request sent!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setError('⚠️ Could not send friend request.');
    }
  };

  return (
    <div className="matches-container">
      <h1 className="matches-title">🤝 Skill Matches</h1>
      <p className="match-subtitle">Find people who can teach you and learn from you</p>
      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}
      {matches.length === 0 ? (
        <p className="no-matches">No matches found</p>
      ) : (
        <div className="match-cards">
          {matches.map(user => (
            <div key={user.id} className="match-card">
              <div className="profile">
                <div className="profile-circle">{user.name?.charAt(0).toUpperCase()}</div>
                <div className="match-name">{user.name}</div>
              </div>
              <div className="skill-section">
                <div className="skill-title">Can Teach</div>
                <div className="badge-container">
                  {user.skills_to_teach?.map((s, i) => <span key={i} className="badge">{s}</span>)}
                </div>
              </div>
              <div className="skill-section">
                <div className="skill-title">Wants to Learn</div>
                <div className="badge-container">
                  {user.skills_to_learn?.map((s, i) => <span key={i} className="badge badge-learn">{s}</span>)}
                </div>
              </div>
              <div className="action-area">
                {friends.includes(user.id) ? (
                  <span className="friend-status success">✅ Friends</span>
                ) : pendingRequests.includes(user.id) ? (
                  <span className="friend-status pending">⏳ Request Sent</span>
                ) : (
                  <button className="chat-button" onClick={() => sendFriendRequest(user.id)}>
                    Send Friend Request
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