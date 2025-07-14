// src/pages/StudyEnvironmentPage.jsx
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StudyEnvironment from './StudyEnvironment';
import Chat from './Chat';
import MotivationTips from '../components/MotivationTips';
import './StudyEnvironmentPage.css';

function StudyEnvironmentPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const senderId = localStorage.getItem('userId');
  const partnerId = localStorage.getItem('partnerId');
  const partnerName = localStorage.getItem('partnerName');
  const skillsToTeach = JSON.parse(localStorage.getItem('skillsToTeach') || '[]');
  const skillsToLearn = JSON.parse(localStorage.getItem('skillsToLearn') || '[]');

  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    if (!partnerId || (!skillsToTeach.length && !skillsToLearn.length)) {
      alert("You must match or have at least one skill in common.");
      navigate('/match');
    }
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/files/${roomId}`);
      setUploadedFiles(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [roomId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('userId', senderId);

    try {
      await axios.post('http://localhost:5000/api/upload', formData);
      fetchFiles();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('File upload failed');
    }
  };

  const handleDeleteFile = async (fileId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`);
      fetchFiles();
    } catch (err) {
      alert("Failed to delete file");
      console.error(err);
    }
  };

  return (
    <div className="study-grid-wrapper">
      <div className="study-left-col">
        <div className="session-card">
          <h2 className="study-heading">
            Studying with: <span>{partnerName || "Unknown"}</span>
          </h2>
          <StudyEnvironment skillsToTeach={skillsToTeach} skillsToLearn={skillsToLearn} />
        </div>

        <div className="file-upload-card">
          <h3>📂 Shared Resources</h3>
          <label className="file-drop-area">
            <div className="upload-message">
              <strong>📤 Drag & drop or click to upload</strong>
              <small>(PDF only, max 10MB)</small>
              <button className="upload-btn">Choose PDF</button>
            </div>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
            />
          </label>

          <div className="file-list">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="file-item-row">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-item"
                >
                  <span className="file-name">{file.uploader_name} - {file.file_name}</span>
                </a>
                <button
                  className="delete-file-btn"
                  onClick={() => handleDeleteFile(file.id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="study-right-col">
        <div className="chat-card">
          <Chat roomId={roomId} />
          <MotivationTips />
        </div>
      </div>
    </div>
  );
}

export default StudyEnvironmentPage;
