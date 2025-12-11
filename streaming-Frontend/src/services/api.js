import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Video API
export const videoAPI = {
  getVideos: (params) => api.get('/videos', { params }),
  getVideoById: (id) => api.get(`/videos/${id}`),
  streamVideo: (id) => `${API_URL}/videos/${id}/stream`,
  uploadVideo: (formData) => api.post('/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  likeVideo: (id) => api.post(`/videos/${id}/like`),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
  getUserVideos: (userId) => api.get(`/videos/user/${userId}`),
};

// Comment API
export const commentAPI = {
  getComments: (videoId, params) => api.get(`/comments/video/${videoId}`, { params }),
  addComment: (videoId, data) => api.post(`/comments/video/${videoId}`, data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  likeComment: (id) => api.post(`/comments/${id}/like`),
};

export default api;

