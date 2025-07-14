import { useEffect, useState } from 'react';
import axios from 'axios';
import './FriendRequests.css'; // optional for styling

function FriendRequests() {
  const userId = localStorage.getItem('userId');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/friend-requests/${userId}`)
      .then(res => setRequests(res.data));
  }, [userId]);

  const acceptRequest = async (requestId) => {
    await axios.post('http://localhost:5000/api/friend-request/accept', { requestId });
    alert("Friend request accepted!");
    setRequests(requests.filter(r => r.id !== requestId));
  };

  return (
    <div className="friend-requests-container">
      <h2 className="friend-requests-title">Incoming Friend Requests</h2>

      {requests.length === 0 ? (
        <p className="no-requests-msg">No friend requests at the moment.</p>
      ) : (
        <div className="friend-requests-list">
          {requests.map(req => (
            <div key={req.id} className="request-card">
              <p className="request-name">{req.sender_name}</p>
              <button className="accept-btn" onClick={() => acceptRequest(req.id)}>Accept ✅</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendRequests;
