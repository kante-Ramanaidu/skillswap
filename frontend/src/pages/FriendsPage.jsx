import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { openStudyRoom } from '../components/openStudyRoom';
import '../styles/FriendsPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
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

  const filteredFriends = friends.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="friends-container">

      {/* Header */}
      <h2 className="friends-title">Your Learning Circle</h2>
      <p className="friends-subtitle">
        Collaborate, study, and grow together with your learning partners.
      </p>

      {/* Search bar */}
      <div className="friends-search-row">
        <div className="friends-search-wrap">
          <span className="friends-search-icon"></span>
          <input
            className="friends-search"
            type="text"
            placeholder="Search friends by name or skill..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="friends-filter-btn">
           Filter
        </button>
      </div>

      {/* Friends grid */}
      {filteredFriends.length === 0 ? (
        <p className="friends-empty">
          {search ? 'No friends match your search.' : 'No friends yet. Start connecting!'}
        </p>
      ) : (
        <div className="friends-list">
          {filteredFriends.map(friend => (
            <div key={friend.id} className="friend-card">

              {/* Avatar with online dot */}
              <div className="friend-avatar-wrap">
                <div className="friend-avatar">
                  {friend.name?.charAt(0).toUpperCase()}
                </div>
                <span className="friend-online-dot"></span>
              </div>

              {/* Info */}
              <div className="friend-info">
                <h3>{friend.name}</h3>
                {friend.specialty && (
                  <p className="friend-specialty">{friend.specialty}</p>
                )}
              </div>

              {/* Skill badges */}
              {friend.skills_to_teach?.length > 0 && (
                <div className="friend-skills">
                  {friend.skills_to_teach.slice(0, 3).map((skill, i) => (
                    <span key={i} className="friend-skill-badge">{skill}</span>
                  ))}
                </div>
              )}

              {/* Study Room button */}
              <button className="study-btn" onClick={() => goToStudyRoom(friend)}>
                 Enter Study Room
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default FriendsPage;