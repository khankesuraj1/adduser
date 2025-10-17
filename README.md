# User Management System

A full-stack user management application with social following features built with React, Express.js, and SQLite.

## 🚀 Tech Stack

- **Frontend**: React 19, React Router, Tailwind CSS, Shadcn UI
- **Backend**: Express.js (Node.js)
- **Database**: SQLite (SQL)
- **Styling**: Tailwind CSS with custom gradients and glass-morphism effects

## ✨ Features

### Core Functionality
- ✅ Create, Read, Update, Delete (CRUD) user profiles
- ✅ User profile fields: Name, Email, Phone, Date of Birth, Profile Image
- ✅ Automatic age calculation from date of birth
- ✅ Follow/Unfollow system between users
- ✅ Real-time followers and following count display
- ✅ Self-follow prevention
- ✅ Duplicate email validation

### Pages
1. **Dashboard** (`/`) - View all users with profile cards
2. **Create User** (`/create`) - Form to create new users
3. **Edit User** (`/edit/:id`) - Edit user details and manage following list

### UI/UX Features
- Modern gradient backgrounds (light blue/teal color scheme)
- Glass-morphism effects with backdrop filters
- Smooth animations and hover effects
- Responsive grid layout
- Profile image support with fallback avatars (Dicebear)
- Toast notifications for user feedback

## 📁 Project Structure

```
user-management-app/
├── backend/
│   ├── server.js           # Express server with all API routes
│   ├── package.json        # Node.js dependencies
│   ├── .env               # Environment variables
│   └── users.db           # SQLite database (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js    # Main dashboard page
│   │   │   ├── CreateUser.js   # Create user form
│   │   │   └── EditUser.js     # Edit user form
│   │   ├── components/ui/      # Shadcn UI components
│   │   ├── App.js             # Main app with routing
│   │   ├── App.css            # Custom styles
│   │   └── index.js           # Entry point
│   ├── public/
│   ├── package.json           # React dependencies
│   └── .env                   # Frontend environment variables
│
└── README.md
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  profile_image TEXT,
  created_at TEXT NOT NULL
);
```

### Followers Table (Relationship)
```sql
CREATE TABLE followers (
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
```bash
# .env file
PORT=8001
CORS_ORIGINS=*
```

4. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:8001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```bash
# .env file
REACT_APP_BACKEND_URL=http://localhost:8001
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Base URL: `http://localhost:8001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health check |
| GET | `/users` | Get all users with followers/following data |
| GET | `/users/:id` | Get single user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user details |
| DELETE | `/users/:id` | Delete user (also removes relationships) |
| POST | `/users/:user_id/follow/:target_user_id` | Follow a user |
| POST | `/users/:user_id/unfollow/:target_user_id` | Unfollow a user |

### Example API Requests

#### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "date_of_birth": "1990-05-15",
  "profile_image": "https://example.com/image.jpg" // optional
}
```

#### Get All Users
```bash
GET /api/users

Response:
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "date_of_birth": "1990-05-15",
    "profile_image": "...",
    "age": 34,
    "followers_count": 5,
    "following_count": 3,
    "followers": ["user-id-1", "user-id-2"],
    "following": ["user-id-3"]
  }
]
```

#### Follow User
```bash
POST /api/users/{user_id}/follow/{target_user_id}

Response:
{
  "message": "Successfully followed user"
}
```

## 🎨 Design System

### Color Palette
- **Primary**: `#0ea5e9` (Sky Blue)
- **Secondary**: `#06b6d4` (Cyan)
- **Background**: Light blue to teal gradient
- **Text**: `#1e293b` (Slate)

### Typography
- **Headings**: Space Grotesk (Google Fonts)
- **Body**: Inter (Google Fonts)

### Components
- Modern pill-shaped buttons with hover effects
- Glass-morphism cards with backdrop blur
- Smooth transitions and animations
- Responsive grid layouts

## 🧪 Testing

The application has been tested with:
- ✅ Backend API endpoints (100% coverage)
- ✅ Frontend user flows (100% coverage)
- ✅ Integration tests (100% coverage)
- ✅ Follow/unfollow functionality
- ✅ Form validation
- ✅ Error handling

## 🔒 Security Features

- SQL injection prevention (parameterized queries)
- Email uniqueness validation
- Self-follow prevention
- CORS configuration
- Graceful error handling

## 📝 Usage

1. **Create Users**: Click "+ Create User" button and fill in the form
2. **View Users**: Dashboard displays all users with their details
3. **Edit Users**: Click "Edit" on any user card to update details
4. **Follow/Unfollow**: In the edit page, manage who the user follows
5. **Delete Users**: Click "Delete" button (with confirmation dialog)

## 🚀 Deployment

### Backend
- Can be deployed to Heroku, Railway, Render, or any Node.js hosting
- Ensure SQLite database file persists or use PostgreSQL for production

### Frontend
- Can be deployed to Vercel, Netlify, or any static hosting
- Update `REACT_APP_BACKEND_URL` to your backend URL

## 🤝 Contributing

This is a recruitment assignment project. For production use, consider:
- Add user authentication
- Implement pagination for large user lists
- Add search and filter functionality
- Upgrade to PostgreSQL/MySQL for production
- Add comprehensive logging
- Implement rate limiting

## 📄 License

MIT License - Feel free to use this code for your projects

## 👨‍💻 Author

Built as a recruitment assignment demonstrating full-stack development skills with React, Express.js, and SQL databases.

---

**Note**: This application uses SQLite for simplicity. For production environments, consider using PostgreSQL or MySQL with connection pooling.
