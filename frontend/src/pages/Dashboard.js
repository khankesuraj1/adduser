import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await axios.delete(`${API}/users/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 data-testid="dashboard-title">User Management</h1>
        <div className="header-actions">
          <Link to="/create" className="btn btn-primary" data-testid="create-user-btn">
            + Create User
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <h2>No Users Yet</h2>
          <p>Create your first user to get started!</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Create User
          </Link>
        </div>
      ) : (
        <div className="users-grid" data-testid="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card" data-testid={`user-card-${user.id}`}>
              <img
                src={user.profile_image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name}
                alt={user.name}
                className="user-avatar"
                data-testid={`user-avatar-${user.id}`}
              />
              <h2 className="user-name" data-testid={`user-name-${user.id}`}>{user.name}</h2>
              
              <div className="user-info">
                <div className="user-info-item" data-testid={`user-email-${user.id}`}>
                  <span>📧</span>
                  <span>{user.email}</span>
                </div>
                <div className="user-info-item" data-testid={`user-phone-${user.id}`}>
                  <span>📱</span>
                  <span>{user.phone}</span>
                </div>
                <div className="user-info-item" data-testid={`user-age-${user.id}`}>
                  <span>🎂</span>
                  <span>{user.age} years old</span>
                </div>
              </div>

              <div className="user-stats">
                <div className="stat">
                  <div className="stat-value" data-testid={`user-followers-${user.id}`}>{user.followers_count}</div>
                  <div className="stat-label">Followers</div>
                </div>
                <div className="stat">
                  <div className="stat-value" data-testid={`user-following-${user.id}`}>{user.following_count}</div>
                  <div className="stat-label">Following</div>
                </div>
              </div>

              <div className="card-actions">
                <Link
                  to={`/edit/${user.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  data-testid={`edit-user-btn-${user.id}`}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  className="btn btn-danger btn-sm"
                  style={{ flex: 1 }}
                  data-testid={`delete-user-btn-${user.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;