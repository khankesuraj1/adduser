const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      profile_image TEXT,
      created_at TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS followers (
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) console.error('Error creating followers table:', err);
  });
}

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to get followers count
function getFollowersCount(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM followers WHERE following_id = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
}

// Helper function to get following count
function getFollowingCount(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
}

// Helper function to get following list
function getFollowingList(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT following_id FROM followers WHERE follower_id = ?', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => row.following_id));
    });
  });
}

// Helper function to get followers list
function getFollowersList(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT follower_id FROM followers WHERE following_id = ?', [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(row => row.follower_id));
    });
  });
}

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'User Management API - Express + SQLite' });
});

// Create user
app.post('/api/users', (req, res) => {
  const { name, email, phone, date_of_birth, profile_image } = req.body;
  const id = uuidv4();
  const created_at = new Date().toISOString();

  db.run(
    'INSERT INTO users (id, name, email, phone, date_of_birth, profile_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, email, phone, date_of_birth, profile_image || null, created_at],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ detail: 'Email already exists' });
        }
        return res.status(500).json({ detail: 'Error creating user' });
      }
      res.status(201).json({
        id,
        name,
        email,
        phone,
        date_of_birth,
        profile_image,
        created_at
      });
    }
  );
});

// Get all users
app.get('/api/users', async (req, res) => {
  db.all('SELECT * FROM users', async (err, users) => {
    if (err) {
      return res.status(500).json({ detail: 'Error fetching users' });
    }

    try {
      const usersWithDetails = await Promise.all(
        users.map(async (user) => {
          const followersCount = await getFollowersCount(user.id);
          const followingCount = await getFollowingCount(user.id);
          const following = await getFollowingList(user.id);
          const followers = await getFollowersList(user.id);

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            date_of_birth: user.date_of_birth,
            profile_image: user.profile_image,
            age: calculateAge(user.date_of_birth),
            followers_count: followersCount,
            following_count: followingCount,
            following,
            followers
          };
        })
      );

      res.json(usersWithDetails);
    } catch (error) {
      res.status(500).json({ detail: 'Error processing users data' });
    }
  });
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM users WHERE id = ?', [id], async (err, user) => {
    if (err) {
      return res.status(500).json({ detail: 'Error fetching user' });
    }
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    try {
      const followersCount = await getFollowersCount(user.id);
      const followingCount = await getFollowingCount(user.id);
      const following = await getFollowingList(user.id);
      const followers = await getFollowersList(user.id);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        profile_image: user.profile_image,
        age: calculateAge(user.date_of_birth),
        followers_count: followersCount,
        following_count: followingCount,
        following,
        followers
      });
    } catch (error) {
      res.status(500).json({ detail: 'Error processing user data' });
    }
  });
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, date_of_birth, profile_image, following } = req.body;

  // First check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ detail: 'Error fetching user' });
    }
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (date_of_birth !== undefined) {
      updates.push('date_of_birth = ?');
      values.push(date_of_birth);
    }
    if (profile_image !== undefined) {
      updates.push('profile_image = ?');
      values.push(profile_image);
    }

    if (updates.length > 0) {
      values.push(id);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

      db.run(query, values, async (err) => {
        if (err) {
          return res.status(500).json({ detail: 'Error updating user' });
        }

        // Get updated user
        db.get('SELECT * FROM users WHERE id = ?', [id], async (err, updatedUser) => {
          if (err) {
            return res.status(500).json({ detail: 'Error fetching updated user' });
          }

          const followersCount = await getFollowersCount(updatedUser.id);
          const followingCount = await getFollowingCount(updatedUser.id);
          const followingList = await getFollowingList(updatedUser.id);
          const followersList = await getFollowersList(updatedUser.id);

          res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            date_of_birth: updatedUser.date_of_birth,
            profile_image: updatedUser.profile_image,
            age: calculateAge(updatedUser.date_of_birth),
            followers_count: followersCount,
            following_count: followingCount,
            following: followingList,
            followers: followersList
          });
        });
      });
    } else {
      // No updates, just return current user
      getFollowersCount(user.id).then(followersCount => {
        getFollowingCount(user.id).then(followingCount => {
          getFollowingList(user.id).then(followingList => {
            getFollowersList(user.id).then(followersList => {
              res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                date_of_birth: user.date_of_birth,
                profile_image: user.profile_image,
                age: calculateAge(user.date_of_birth),
                followers_count: followersCount,
                following_count: followingCount,
                following: followingList,
                followers: followersList
              });
            });
          });
        });
      });
    }
  });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ detail: 'Error deleting user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ detail: 'User not found' });
    }

    // Delete follower relationships
    db.run('DELETE FROM followers WHERE follower_id = ? OR following_id = ?', [id, id], (err) => {
      if (err) {
        console.error('Error cleaning up follower relationships:', err);
      }
    });

    res.json({ message: 'User deleted successfully' });
  });
});

// Follow user
app.post('/api/users/:user_id/follow/:target_user_id', (req, res) => {
  const { user_id, target_user_id } = req.params;

  if (user_id === target_user_id) {
    return res.status(400).json({ detail: 'Cannot follow yourself' });
  }

  // Check if both users exist
  db.get('SELECT id FROM users WHERE id = ?', [user_id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    db.get('SELECT id FROM users WHERE id = ?', [target_user_id], (err, targetUser) => {
      if (err || !targetUser) {
        return res.status(404).json({ detail: 'Target user not found' });
      }

      // Check if already following
      db.get('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', [user_id, target_user_id], (err, existing) => {
        if (existing) {
          return res.status(400).json({ detail: 'Already following this user' });
        }

        const created_at = new Date().toISOString();
        db.run(
          'INSERT INTO followers (follower_id, following_id, created_at) VALUES (?, ?, ?)',
          [user_id, target_user_id, created_at],
          (err) => {
            if (err) {
              return res.status(500).json({ detail: 'Error following user' });
            }
            res.json({ message: 'Successfully followed user' });
          }
        );
      });
    });
  });
});

// Unfollow user
app.post('/api/users/:user_id/unfollow/:target_user_id', (req, res) => {
  const { user_id, target_user_id } = req.params;

  db.run(
    'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
    [user_id, target_user_id],
    function(err) {
      if (err) {
        return res.status(500).json({ detail: 'Error unfollowing user' });
      }
      res.json({ message: 'Successfully unfollowed user' });
    }
  );
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});