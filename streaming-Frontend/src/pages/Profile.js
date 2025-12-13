import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, videoAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const fetchUserVideos = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await videoAPI.getUserVideos(user.id);
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching user videos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      username: user.username || '',
      email: user.email || '',
    });
    fetchUserVideos();
  }, [user, navigate, fetchUserVideos]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(formData);
      await checkAuth();
      setEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <h2>Account Information</h2>
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="profile-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        username: user.username || '',
                        email: user.email || '',
                      });
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Username:</span>
                  <span className="info-value">{user.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <button onClick={() => setEditing(true)} className="edit-btn">
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          <div className="videos-section">
            <h2>My Videos ({videos.length})</h2>
            {loading ? (
              <div className="loading">Loading videos...</div>
            ) : videos.length === 0 ? (
              <div className="no-videos">
                <p>You haven't uploaded any videos yet.</p>
                <Link to="/upload" className="upload-link">Upload Your First Video</Link>
              </div>
            ) : (
              <div className="videos-grid">
                {videos.map((video) => (
                  <Link key={video._id} to={`/video/${video._id}`} className="video-card">
                    <div className="video-thumbnail">
                      {video.thumbnail ? (
                        <img src={`http://localhost:5000/uploads/${video.thumbnail}`} alt={video.title} />
                      ) : (
                        <div className="video-placeholder">▶</div>
                      )}
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <p className="video-meta">
                        {video.views || 0} views • {new Date(video.uploadDate).toLocaleDateString()}
                      </p>
                      <div className="video-stats">
                        <span>👍 {video.likes || 0}</span>
                        <span className="video-category">{video.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

