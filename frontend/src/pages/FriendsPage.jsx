// src/pages/FriendsPage.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { openStudyRoom } from '../components/openStudyRoom';
import './FriendsPage.css';

function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/friends/${userId}`) // ✅ Updated URL
      .then(res => setFriends(res.data))
      .catch(err => console.error('Error fetching friends:', err));
  }, []);

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
