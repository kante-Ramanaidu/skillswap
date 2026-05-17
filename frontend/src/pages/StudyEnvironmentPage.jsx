import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import Chat from '../components/Chat';
import MotivationTips from '../components/MotivationTips';
import VideoCall from '../components/VideoCall';
import SessionForm from '../components/SessionForm';
import TimerSession from '../components/TimerSession';
import '../styles/StudyEnvironmentPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL;

function StudyEnvironmentPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const partnerId = localStorage.getItem('partnerId');
  const partnerName = localStorage.getItem('partnerName');
  const userId = localStorage.getItem('userId');

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showVideo, setShowVideo] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [socketReady, setSocketReady] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);

  // ✅ NEW: controls whether the SessionForm modal is open
  const [showSessionForm, setShowSessionForm] = useState(false);

  const [incomingCallOffer, setIncomingCallOffer] = useState(null);
  const socketRef = useRef(null);

  const [activeSession, setActiveSession] = useState(() => {
    try {
      const saved = sessionStorage.getItem('activeSession');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) return;
    socketRef.current = io(API_URL, { auth: { token } });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('joinRoom', roomId);
      socketRef.current.emit('join-study-room', userId);
      socketRef.current.emit('check-online', partnerId);
      setSocketReady(true);
    });

    socketRef.current.on('user-status', ({ userId: checkedId, isOnline }) => {
      if (String(checkedId) === String(partnerId)) setIsPartnerOnline(isOnline);
    });

    socketRef.current.on('user-online', (id) => {
      if (String(id) === String(partnerId)) setIsPartnerOnline(true);
    });

    socketRef.current.on('user-offline', (id) => {
      if (String(id) === String(partnerId)) setIsPartnerOnline(false);
    });

    socketRef.current.on('incomingCall', ({ offer }) => {
      setIncomingCallOffer(offer);
      setShowVideo(true);
    });

    socketRef.current.on('disconnect', () => setSocketReady(false));

    return () => {
      socketRef.current.emit('leave-study-room', userId);
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [roomId, token]);

  useEffect(() => {
    if (activeSession) return;
    const timer = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => {
    const skillsToTeach = JSON.parse(localStorage.getItem('skillsToTeach') || '[]');
    const skillsToLearn = JSON.parse(localStorage.getItem('skillsToLearn') || '[]');
    if (!partnerId || (!skillsToTeach.length && !skillsToLearn.length)) {
      alert('You must match or have at least one skill in common.');
      navigate('/match');
    }
  }, []);

  const fixCloudinaryUrl = (url) => url.replace('/image/upload/', '/raw/upload/');

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/files/${roomId}`, config);
      setUploadedFiles(res.data);
    } catch (err) { console.error('Error fetching files:', err); }
  };

  useEffect(() => {
    if (!token) return;
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [roomId, token]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('userId', userId);
    try {
      await axios.post(`${API_URL}/api/upload`, formData, { headers: { Authorization: `Bearer ${token}` } });
      fetchFiles();
      e.target.value = null;
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await axios.delete(`${API_URL}/api/files/${fileId}`, config);
      fetchFiles();
    } catch { alert('Failed to delete file'); }
  };

  const handleDownload = async (url, filename) => {
    try {
      const fixedUrl = fixCloudinaryUrl(url);
      const response = await fetch(fixedUrl);
      if (!response.ok) throw new Error('Failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch { alert('Download failed.'); }
  };

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  // ✅ UPDATED: close modal then start session
  const handleSessionStart = (sessionData) => {
    setShowSessionForm(false);
    setActiveSession(sessionData);
  };

  const handleSessionEnd = () => {
    setActiveSession(null);
    sessionStorage.removeItem('activeSession');
  };

  const handleVideoClose = () => {
    setShowVideo(false);
    setIncomingCallOffer(null);
  };

  return (
    <div className="sep-root">
      <header className="sep-header">
        <div className="sep-header-left">
          <button className="sep-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="sep-partner-info">
            <div className="sep-avatar">{getInitials(partnerName)}</div>
            <div>
              <div className="sep-partner-name">{partnerName || 'Partner'}</div>
              <div className="sep-partner-status">
                {isPartnerOnline && <span className="sep-online-dot" />}
                {activeSession ? 'Session Active' : isPartnerOnline ? 'In Study Room' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
        <div className="sep-header-center">
          {!activeSession && <div className="sep-timer"><span>⏱</span> {formatTime(sessionTime)}</div>}
        </div>
        <div className="sep-header-right">
          <button className={`sep-video-btn ${showVideo ? 'active' : ''}`} onClick={() => setShowVideo(v => !v)}>
            <span></span>{showVideo ? 'End Call' : 'Start Call'}
          </button>
        </div>
      </header>

      <div className="sep-mobile-tabs">
        {['skills', 'chat', 'resources'].map(tab => (
          <button key={tab} className={`sep-tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'skills' && 'Session'}{tab === 'chat' && 'Chat'}{tab === 'resources' && 'Files'}
          </button>
        ))}
      </div>

      <main className="sep-grid">
        {/* ── LEFT PANEL ── */}
        <aside className={`sep-panel sep-panel-left ${activeTab === 'skills' ? 'mobile-active' : ''}`}>

          {/* SESSION CARD: button → modal → timer */}
          <div className="sep-card sep-session-card">
            {activeSession ? (
              // Timer running after session started
              <TimerSession session={activeSession} onEnd={handleSessionEnd} />
            ) : (
              // "Create Session" button when idle
              <div className="sep-create-session-wrap">
                <span className="sep-create-session-label">Study Session</span>
                <button
                  className="sep-create-session-btn"
                  onClick={() => setShowSessionForm(true)}
                >
                  <span className="sep-create-session-btn-icon">＋</span>
                  Create Session
                </button>
              </div>
            )}
          </div>

          {/* MOTIVATION — always visible */}
          <div className="sep-card sep-tips-card">
            <div className="sep-card-header">
              <span className="sep-card-icon"></span>
              <h3></h3>
            </div>
            <MotivationTips />
          </div>

        </aside>

        {/* ── CENTER: CHAT ── */}
        <section className={`sep-panel sep-panel-center ${activeTab === 'chat' ? 'mobile-active' : ''}`}>
          <div className="sep-card sep-chat-card">
            {socketReady && <Chat roomId={roomId} socket={socketRef.current} />}
          </div>
        </section>

        {/* ── RIGHT: FILES ── */}
        <aside className={`sep-panel sep-panel-right ${activeTab === 'resources' ? 'mobile-active' : ''}`}>
          <div className="sep-card sep-files-card">
            <div className="sep-card-header">
              <span className="sep-card-icon"></span>
              <h3>Shared Resources</h3>
              <span className="sep-file-count">{uploadedFiles.length}</span>
            </div>
            <label className="sep-upload-zone">
              <input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={uploading} />
              <div className="sep-upload-content">
                {uploading ? (
                  <><div className="sep-upload-spinner" /><span>Uploading…</span></>
                ) : (
                  <>
                    <div className="sep-upload-icon"></div>
                    <span className="sep-upload-label">Drop PDF here or click</span>
                    <span className="sep-upload-hint">Max 10MB</span>
                  </>
                )}
              </div>
            </label>
            <div className="sep-file-list">
              {uploadedFiles.length === 0 ? (
                <div className="sep-empty-files">
                  <div className="sep-empty-icon">📭</div>
                  <p>No files yet</p>
                  <small>Upload a PDF to share with your partner</small>
                </div>
              ) : (
                uploadedFiles.map((file) => (
                  <div key={file.id} className="sep-file-item">
                    <div className="sep-file-icon"></div>
                    <div className="sep-file-info">
                      <div className="sep-file-name" title={file.file_name}>{file.file_name}</div>
                      <div className="sep-file-uploader">by {file.uploader_name}</div>
                    </div>
                    <div className="sep-file-actions">
                      <button className="sep-file-btn sep-file-btn-dl" onClick={() => handleDownload(file.file_url, file.file_name)}>⬇️</button>
                      <button className="sep-file-btn sep-file-btn-del" onClick={() => handleDeleteFile(file.id)}>🗑</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* ── SESSION FORM MODAL ── */}
      {showSessionForm && (
        <div className="sep-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSessionForm(false)}>
          <div className="sep-modal-box">
            <button className="sep-modal-close" onClick={() => setShowSessionForm(false)}>✕</button>
            <SessionForm onStart={handleSessionStart} />
          </div>
        </div>
      )}

      {/* ── VIDEO CALL ── */}
      {showVideo && socketReady && (
        <VideoCall
          roomId={roomId}
          partnerName={partnerName}
          socket={socketRef.current}
          onClose={handleVideoClose}
          incomingOffer={incomingCallOffer}
        />
      )}
    </div>
  );
}

export default StudyEnvironmentPage;