# Vote App 🗳️

A full-stack real-time voting application with user authentication, scheduled voting periods, and live result visualization.

## Features ✨

- **회원 관리**: Register, login, logout with JWT authentication
- **투표 생성**: Create polls with multiple options, start/end times, anonymous/public voting
- **실시간 투표**: One vote per user per poll, live result updates
- **시각화**: Progress bars and charts showing real-time voting results
- **상태 관리**: Upcoming, active, and ended vote status with automatic transitions

## Tech Stack 🛠️

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React (Create React App)
- CSS-in-JS styling
- Real-time updates (polling every 30s)

## Setup & Installation 🚀

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Git

### Environment Variables
Create `.env` file in the `backend` directory:

```env
MONGO_URI=mongodb://localhost:27017/vote-app
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

### Installation Steps

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd vote-app
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

4. **Start MongoDB** (if running locally)

5. **Run the application:**

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

The frontend proxy is configured to route `/api/*` requests to the backend server during development.

## API Endpoints 📡

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Votes
- `GET /api/votes` - Get all votes (public)
- `POST /api/votes` - Create new vote (auth required)
- `GET /api/votes/:id` - Get specific vote details
- `POST /api/votes/:id/vote` - Submit vote (auth required, one per user)

## Key Features Implementation 🔧

### 투표 참여 (Voting Participation)
- **One vote per topic**: Backend validates user hasn't voted before
- **Real-time updates**: Frontend polls every 30 seconds for active votes
- **Status validation**: Only allows voting during active period

### 실시간 결과 (Real-time Results)
- **Live counting**: Vote counts update immediately after submission
- **Progress visualization**: Animated progress bars with percentages
- **Status indicators**: Visual badges for upcoming/active/ended states

### 인증 시스템 (Authentication System)
- **JWT tokens**: Stored in localStorage, sent in Authorization header
- **Protected routes**: Vote creation and submission require authentication
- **Session management**: Login/logout with automatic UI updates

## Project Structure 📁

```
vote-app/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/authMiddleware.js  # JWT validation
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   └── server.js            # Express app entry
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app
│   └── package.json        # Frontend dependencies
└── README.md
```

## Development Notes 📝

- **Backend runs on port 5000** by default
- **Frontend development server on port 3000**
- **Database**: MongoDB with collections for users, votes
- **Authentication**: JWT tokens with 30-day expiration
- **Real-time**: Client-side polling (can be upgraded to WebSockets)

## Troubleshooting 🔧

**Common Issues:**
1. **MongoDB connection**: Ensure MongoDB is running and `MONGO_URI` is correct
2. **JWT errors**: Check `JWT_SECRET` is set in backend/.env
3. **CORS issues**: Backend includes CORS middleware for development
4. **Port conflicts**: Change PORT in .env if 5000 is occupied

**Debug Steps:**
1. Check backend console for MongoDB connection logs
2. Verify frontend can reach `/api/votes` endpoint
3. Check browser Network tab for API call failures
4. Ensure both servers are running simultaneously
