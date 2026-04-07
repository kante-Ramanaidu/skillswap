import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { openStudyRoom } from '../components/openStudyRoom';
import '../styles/FriendsPage.css';

const API_URL = 'https://skillswap-backend-pbn7.onrender.com';


function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) return;

    axios
      .get(`${API_URL}/api/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setFriends(res.data))
      .catch(err => console.error('Error fetching friends:', err));
  }, [userId, token]);

  const goToStudyRoom = (friend) => {
    const path = openStudyRoom({
      currentUserId: userId,
      partnerId: friend.id,
      partnerName: friend.name,
      skillsToTeach: ['General'],
      skillsToLearn: []
    });
    navigate(path);
  };

  return (
    <div className="friends-container">
      <h2 className="friends-title">Your Friends</h2>
      <p className="friends-subtitle">Start a study room or collaborate with your learning partners!</p>

      <div className="friends-list">
        {friends.map(friend => (
          <div key={friend.id} className="friend-card">
            <div className="friend-avatar">
              {friend.name?.charAt(0).toUpperCase()}
            </div>
            <div className="friend-info">
              <h3>{friend.name}</h3>
              <button className="study-btn" onClick={() => goToStudyRoom(friend)}>
                📚 Study Room
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendsPage;