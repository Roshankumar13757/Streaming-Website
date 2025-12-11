import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Comments from '../components/Comments/Comments';
import './VideoPage.css';

const VideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideoById(id);
      setVideo(response.data.video);
    } catch (error) {
      console.error('Error fetching video:', error);
      if (error.response?.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await videoAPI.likeVideo(id);
      setVideo((prev) => ({
        ...prev,
        likes: (prev.likes || 0) + 1,
      }));
      setLiked(true);
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    try {
      await videoAPI.deleteVideo(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  if (loading) {
    return <div className="video-page-loading">Loading video...</div>;
  }

  if (!video) {
    return <div className="video-page-error">Video not found</div>;
  }

  const isOwner = user && video.uploadedBy?._id === user.id;

  return (
    <div className="video-page">
      <div className="video-page-container">
        <div className="video-player-section">
          <div className="video-wrapper">
            <video
              controls
              className="video-player"
              src={videoAPI.streamVideo(id)}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="video-details">
            <h1 className="video-title">{video.title}</h1>
            <div className="video-meta-info">
              <span>{video.views || 0} views</span>
              <span>•</span>
              <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
              <span>•</span>
              <span className="video-category-badge">{video.category}</span>
            </div>

            <div className="video-actions">
              <button
                onClick={handleLike}
                className={`like-btn ${liked ? 'liked' : ''}`}
                disabled={!user}
              >
                👍 {video.likes || 0}
              </button>
              {isOwner && (
                <button onClick={handleDelete} className="delete-btn">
                  Delete Video
                </button>
              )}
            </div>

            {video.description && (
              <div className="video-description">
                <h3>Description</h3>
                <p>{video.description}</p>
              </div>
            )}

            <div className="video-uploader">
              <h3>Uploaded by</h3>
              <p>{video.uploadedBy?.username || 'Unknown'}</p>
            </div>
          </div>
        </div>

        <div className="comments-section">
          <Comments videoId={id} />
        </div>
      </div>
    </div>
  );
};

export default VideoPage;

