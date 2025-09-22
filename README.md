# 🎯 Live Polling System

A real-time polling application built with **React (Vite)** on the frontend and **Node.js + Socket.IO** on the backend.  
It allows a teacher to create polls, ask questions, and see results in real-time while students can join, vote, and view correctness feedback.

---

## ✨ Features

- 👩‍🏫 **Teacher Role**
  - Create new polls with multiple questions.
  - Mark the correct answer for each question.
  - Start/stop questions with a countdown timer.
  - View live results (percentages, counts).
  - Manage participants (kick out students).
  - Built-in chat with students.

- 👨‍🎓 **Student Role**
  - Join with a name (auto-rejoin supported).
  - See questions in real-time as the teacher starts them.
  - Submit answers (one per question).
  - Instantly view whether their choice was correct/wrong.
  - View live poll results and final outcome.
  - Chat with the teacher and other students.

- 🔄 **Real-Time Updates**
  - Powered by **Socket.IO** for instant sync.
  - Automatic roster updates.
  - Live voting results and chat.

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Context API for state management
- Axios for REST calls
- Socket.IO client
- Plain CSS styling

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB (optional, for persistence – app can run in-memory too)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/live-polling-system.git
cd live-polling-system


2. Install Dependencies

Frontend:

cd frontend/live-poll-frontend

# React core
npm install react react-dom

# Build tool
npm install vite @vitejs/plugin-react

# Networking
npm install axios

# WebSocket client
npm install socket.io-client

# Linting & types (optional but in package.json)
npm install --save-dev eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals
npm install --save-dev @types/react @types/react-dom


Backend:

cd backend

# Core framework
npm install express

# WebSocket communication
npm install socket.io socket.io-client

# MongoDB & ODM
npm install mongoose mongodb

# Middleware
npm install cors dotenv

# Dev tools
npm install --save-dev nodemon


3. Setup Environment Variables

Create a .env file in frontend/live-poll-frontend:

VITE_BACKEND_URL=http://localhost:(PORT)

Create a .env file in backend:

PORT=4000
FRONTEND_URL=http://localhost:(PORT)
MONGO_URI=mongodb+srv://(db_name):(db_password)@livepollcluster.dq00stp.mongodb.net/livepoll?retryWrites=true&w=majority&appName=LivePollCluster


4. Run the App

Backend:

cd backend
npm start


Frontend:

cd frontend/live-poll-frontend
npm run dev


Then open your browser at:

http://localhost:5173



📌 Notes

If deploying (e.g., Render, Vercel, Netlify), make sure to set VITE_BACKEND_URL in frontend .env to the deployed backend URL.

Cold starts on free-tier hosting may cause a 10–15s delay on first request.

🤝 Contributing

Pull requests are welcome!
If you’d like to suggest a feature or report a bug, open an issue.