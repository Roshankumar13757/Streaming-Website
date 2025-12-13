import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { commentAPI } from '../../services/api';
import './Comments.css';

const Comments = ({ videoId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments(videoId);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await commentAPI.addComment(videoId, { text: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleAddReply = async (parentId) => {
    if (!replyText.trim() || !user) return;

    try {
      await commentAPI.addComment(videoId, {
        text: replyText,
        parentComment: parentId,
      });
      setReplyText('');
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentAPI.deleteComment(commentId);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;

    try {
      await commentAPI.likeComment(commentId);
      fetchComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="comments">
      <h2 className="comments-title">Comments ({comments.length})</h2>

      {user ? (
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="comment-input"
            rows="3"
          />
          <button type="submit" className="comment-submit-btn">
            Comment
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          Please <a href="/login">login</a> to comment
        </div>
      )}

      {loading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">
                  {comment.userId?.username || 'Unknown'}
                </span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
              <div className="comment-actions">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  className="comment-like-btn"
                  disabled={!user}
                >
                  👍 {comment.likes || 0}
                </button>
                {user && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    className="comment-reply-btn"
                  >
                    Reply
                  </button>
                )}
                {user && comment.userId?._id === user.id && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="comment-delete-btn"
                  >
                    Delete
                  </button>
                )}
              </div>

              {replyingTo === comment._id && (
                <div className="reply-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="comment-input"
                    rows="2"
                  />
                  <div className="reply-actions">
                    <button
                      onClick={() => handleAddReply(comment._id)}
                      className="comment-submit-btn"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="comment-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="reply-item">
                      <div className="comment-header">
                        <span className="comment-author">
                          {reply.userId?.username || 'Unknown'}
                        </span>
                        <span className="comment-date">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="comment-text">{reply.text}</p>
                      <div className="comment-actions">
                        <button
                          onClick={() => handleLikeComment(reply._id)}
                          className="comment-like-btn"
                          disabled={!user}
                        >
                          👍 {reply.likes || 0}
                        </button>
                        {user && reply.userId?._id === user.id && (
                          <button
                            onClick={() => handleDeleteComment(reply._id)}
                            className="comment-delete-btn"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;

