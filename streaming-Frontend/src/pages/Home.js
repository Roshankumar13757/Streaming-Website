import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchVideos();
  }, [category, sortBy, search]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = {
        category: category !== 'All' ? category : undefined,
        sortBy: sortBy === 'newest' ? undefined : sortBy,
        search: search || undefined,
      };
      const response = await videoAPI.getVideos(params);
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos();
  };

  const categories = ['All', 'Gaming', 'Music', 'Education', 'Entertainment', 'Sports', 'Technology', 'Other'];

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-header">
          <h1>Discover Videos</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="filter-select">
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="newest">Newest</option>
              <option value="views">Most Viewed</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="no-videos">No videos found. Be the first to upload!</div>
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
                  <div className="video-duration">{video.duration || '0:00'}</div>
                </div>
                <div className="video-info">
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-meta">
                    {video.uploadedBy?.username || 'Unknown'} • {video.views || 0} views • {new Date(video.uploadDate).toLocaleDateString()}
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
  );
};

export default Home;

