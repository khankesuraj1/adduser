import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    profile_image: ''
  });
  const [allUsers, setAllUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchAllUsers();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API}/users/${id}`);
      const user = response.data;
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        profile_image: user.profile_image || ''
      });
      setFollowing(user.following || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user data');
      navigate('/');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setAllUsers(response.data.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.put(`${API}/users/${id}`, {
        ...formData,
        following: following
      });
      toast.success('User updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.detail || 'Failed to update user');
      setSubmitting(false);
    }
  };

  const toggleFollow = async (targetUserId) => {
    try {
      if (following.includes(targetUserId)) {
        await axios.post(`${API}/users/${id}/unfollow/${targetUserId}`);
        setFollowing(following.filter(fid => fid !== targetUserId));
        toast.success('Unfollowed successfully');
      } else {
        await axios.post(`${API}/users/${id}/follow/${targetUserId}`);
        setFollowing([...following, targetUserId]);
        toast.success('Followed successfully');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(error.response?.data?.detail || 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 data-testid="edit-user-title">Edit User</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} data-testid="edit-user-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              data-testid="input-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              data-testid="input-email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              data-testid="input-phone"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth *</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              data-testid="input-dob"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_image">Profile Image URL (Optional)</label>
            <input
              type="url"
              id="profile_image"
              name="profile_image"
              value={formData.profile_image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              data-testid="input-profile-image"
            />
          </div>

          <div className="following-list">
            <h3 data-testid="following-section-title">Manage Following</h3>
            {allUsers.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>No other users available</p>
            ) : (
              allUsers.map((user) => (
                <div key={user.id} className="following-item" data-testid={`following-item-${user.id}`}>
                  <span>{user.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleFollow(user.id)}
                    className={`btn btn-sm ${following.includes(user.id) ? 'btn-secondary' : 'btn-primary'}`}
                    data-testid={`toggle-follow-btn-${user.id}`}
                  >
                    {following.includes(user.id) ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
              data-testid="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              data-testid="submit-btn"
            >
              {submitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;