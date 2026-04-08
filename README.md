# SkillSwap 🔄

A real-time peer-to-peer skill exchange platform where users can teach what they know and learn what they don't — together.

---

🚩 Problem Statement
In today's world, millions of learners want to gain new skills — but they face two major challenges:

High cost of courses and mentorships — Quality learning resources are expensive and out of reach for many students and self-learners.
Lack of access to trusted mentors — Even motivated learners struggle to find the right people to guide them.

At the same time, there are countless people who have real knowledge and a genuine willingness to teach — but there is no proper platform that connects them in a meaningful, structured way.
SkillSwap solves this. It is a platform where users can exchange their skills with each other using real-time features — no money involved, just knowledge shared between people who want to teach and learn together.

---

## 🌐 Live Demo

- **Frontend:** https://skillswap-frontend-iuwr.onrender.com
- **Backend:** https://skillswap-backend-pbn7.onrender.com

---

## 📌 Features

- 🔐 JWT-based Authentication (Signup / Login)
- 🤝 Skill-based User Matching
- 💬 Real-time Chat (Socket.IO)
- 📹 Video Calling (WebRTC)
- 📁 File Sharing (Cloudinary)
- 👫 Friend Requests & Friends List
- 📅 Schedule Study Sessions
- ⏱️ Study Timer with Session History
- 📈 Progress Tracking
- 👤 Profile Management

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Axios
- Socket.IO Client
- WebRTC

### Backend
- Node.js + Express
- Socket.IO
- PostgreSQL (pg)
- JWT (jsonwebtoken)
- Bcrypt
- Cloudinary
- Multer
- Dotenv

---

## 📁 Project Structure

```
skillswap/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── match.js
│   │   ├── chat.js
│   │   ├── files.js
│   │   ├── friends.js
│   │   ├── progress.js
│   │   ├── schedules.js
│   │   ├── profile.js
│   │   └── session.js
│   ├── sockets/
│   │   └── index.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        └── styles/
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/kante-Ramanaidu/skillswap
cd skillswap
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 3. Setup Database

Run these SQL queries in your PostgreSQL database:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  skills_to_teach TEXT[],
  skills_to_learn TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE friend_requests (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE friends (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255),
  teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  learner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR(255),
  description TEXT,
  scheduled_time TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE session_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100),
  subject VARCHAR(255),
  concept VARCHAR(255),
  duration INTEGER,
  completed_at TIMESTAMP
);

CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR(255),
  type VARCHAR(100),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Run Backend
```bash
node server.js
```

### 5. Setup Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```
VITE_API_URL=http://localhost:5000
```

### 6. Run Frontend
```bash
npm run dev
```

---

## 🚀 Deployment

### Backend (Render Web Service)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment Variables:** `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `CLIENT_URL`

### Frontend (Render Static Site)
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

---

## 🔑 Environment Variables

### Backend
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL |

---

## 👨‍💻 Author

**Kante Ramanaidu**
- GitHub: [@kante-Ramanaidu](https://github.com/kante-Ramanaidu)

---

