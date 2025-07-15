import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://skillswap-frontend-iuwr.onrender.com', // you can change this to your deployed frontend later
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const { Pool } = pkg;

// ✅ ENABLE SSL FOR RENDER POSTGRES
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});




// ✅ Updated Signup route with phone support
app.post('/api/auth/signup', async (req, res) => {
  try {
    let { name, email, password, phone, skillsToTeach, skillsToLearn } = req.body;

    if (typeof skillsToTeach === 'string') skillsToTeach = skillsToTeach.split(',').map(s => s.trim());
    if (typeof skillsToLearn === 'string') skillsToLearn = skillsToLearn.split(',').map(s => s.trim());

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, skills_to_teach, skills_to_learn, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [name, email, hashedPassword, phone, skillsToTeach, skillsToLearn]
    );

    res.status(201).json({ message: 'User registered', user: { id: result.rows[0].id } });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Signup failed' });
  }
});


// ✅ Login route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Match route
app.post('/api/match', async (req, res) => {
  const { userId } = req.body;

  try {
    // Get the current user's skills
    const userRes = await pool.query(
      'SELECT skills_to_teach, skills_to_learn FROM users WHERE id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRes.rows[0];
    const skillsToTeach = user.skills_to_teach;
    const skillsToLearn = user.skills_to_learn;

    // Match logic: if EITHER condition is true
    const matchQuery = `
      SELECT id, name, phone, skills_to_teach, skills_to_learn
      FROM users
      WHERE id != $1
        AND (
          skills_to_teach && $2::text[]  -- they teach something I want to learn
          OR
          skills_to_learn && $3::text[]  -- they want to learn something I can teach
        )
    `;

    const matchRes = await pool.query(matchQuery, [userId, skillsToLearn, skillsToTeach]);

    res.json({ matchedUsers: matchRes.rows });

  } catch (err) {
    console.error('Error matching users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// ✅ Get chat history
// ✅ Chat routes and real-time messaging
app.get('/api/chat/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, u.name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE room_id = $1
       ORDER BY timestamp ASC`,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch chat error:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// ✅ Real-time chat using Socket.IO
io.on('connection', (socket) => {
  console.log('✅ Socket connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    console.log(`👥 ${socket.id} joined room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on('sendMessage', async ({ roomId, senderId, message }) => {
    console.log(`📨 Message received from user ${senderId} in ${roomId}: ${message}`);
    try {
      const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [senderId]);
      const senderName = userRes.rows[0]?.name || `User ${senderId}`;

      await pool.query(
        `INSERT INTO messages (room_id, sender_id, content)
         VALUES ($1, $2, $3)`,
        [roomId, senderId, message]
      );

      io.to(roomId).emit('receiveMessage', {
        roomId,
        senderId,
        senderName,
        message,
        timestamp: new Date()
      });

      console.log(`📤 Broadcasted message to room: ${roomId}`);
    } catch (err) {
      console.error('Message error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// ✅ Get progress for a user
app.get('/api/progress/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM progress WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch progress error:', err.message);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// ✅ Update or insert progress
app.post('/api/progress', async (req, res) => {
  const { userId, skill, type, completed } = req.body;

  if (!userId || !skill || !type) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const existing = await pool.query(
      'SELECT * FROM progress WHERE user_id = $1 AND skill = $2 AND type = $3',
      [userId, skill, type]
    );

    if (existing.rows.length > 0) {
      // Update
      await pool.query(
        'UPDATE progress SET completed = $1 WHERE user_id = $2 AND skill = $3 AND type = $4',
        [completed, userId, skill, type]
      );
    } else {
      // Insert
      await pool.query(
        'INSERT INTO progress (user_id, skill, type, completed) VALUES ($1, $2, $3, $4)',
        [userId, skill, type, completed]
      );
    }

    res.json({ message: 'Progress saved' });
  } catch (err) {
    console.error('Progress save error:', err.message);
    res.status(500).json({ message: 'Failed to save progress' });
  }
});

const UPLOAD_DIR = './uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// ✅ Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ Upload route (handles DB insert)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { roomId, userId } = req.body;

  if (!req.file || !roomId || !userId) {
    return res.status(400).json({ message: 'Missing file, roomId or userId' });
  }

  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  const fileName = req.file.originalname;

  try {
    await pool.query(
      `INSERT INTO files (room_id, uploaded_by, file_url, file_name)
       VALUES ($1, $2, $3, $4)`,
      [roomId, userId, fileUrl, fileName]
    );

    res.status(200).json({ message: 'File uploaded', fileUrl, fileName });
  } catch (err) {
    console.error('File upload DB error:', err.message);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// ✅ Get files by room ID
app.get('/api/files/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const result = await pool.query(
      `SELECT f.*, u.name AS uploader_name
       FROM files f
       JOIN users u ON f.uploaded_by = u.id
       WHERE room_id = $1
       ORDER BY uploaded_at DESC`,
      [roomId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Fetch files error:', err.message);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

// ✅ Send Friend Request
app.post('/api/friend-request', async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const check = await pool.query(
      'SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );
    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Request already sent.' });
    }

    await pool.query(
      'INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, $3)',
      [senderId, receiverId, 'pending']
    );

    res.json({ message: 'Friend request sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get Incoming Friend Requests
app.get('/api/friend-requests/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT fr.*, u.name AS sender_name FROM friend_requests fr JOIN users u ON fr.sender_id = u.id WHERE fr.receiver_id = $1 AND status = $2',
      [userId, 'pending']
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load requests' });
  }
});

// ✅ Accept Friend Request
app.post('/api/friend-request/accept', async (req, res) => {
  const { requestId } = req.body;

  try {
    const requestRes = await pool.query('SELECT * FROM friend_requests WHERE id = $1', [requestId]);
    const { sender_id, receiver_id } = requestRes.rows[0];

    await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', requestId]);
    await pool.query('INSERT INTO friends (user1_id, user2_id) VALUES ($1, $2)', [sender_id, receiver_id]);

    res.json({ message: 'Friend request accepted.' });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting friend request' });
  }
});

// ✅ Get Confirmed Friends of a User
app.get('/api/friends/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name FROM users u
       WHERE u.id IN (
         SELECT user1_id FROM friends WHERE user2_id = $1
         UNION
         SELECT user2_id FROM friends WHERE user1_id = $1
       )`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch friends' });
  }
});

// ✅ Check if Two Users Are Friends
app.get('/api/is-friend/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const check = await pool.query(
      `SELECT * FROM friends 
       WHERE (user1_id = $1 AND user2_id = $2) 
          OR (user1_id = $2 AND user2_id = $1)`,
      [user1, user2]
    );

    if (check.rows.length > 0) {
      res.json({ isFriend: true });
    } else {
      res.json({ isFriend: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get Sent Friend Requests (Pending)
app.get('/api/sent-friend-requests/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM friend_requests
       WHERE sender_id = $1 AND status = 'pending'`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending requests' });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { roomId, teacherId, learnerId, skill, description, scheduled_time } = req.body;
  try {
    await pool.query(
      `INSERT INTO sessions (room_id, teacher_id, learner_id, skill, description, scheduled_time, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [roomId, teacherId, learnerId, skill, description, scheduled_time]
    );
    res.status(201).json({ message: 'Session scheduled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating schedule' });
  }
});

app.get('/api/schedules/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.*, u1.name AS teacher_name, u2.name AS learner_name
       FROM sessions s
       JOIN users u1 ON s.teacher_id = u1.id
       JOIN users u2 ON s.learner_id = u2.id
       WHERE s.teacher_id = $1 OR s.learner_id = $1
       ORDER BY scheduled_time ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
});
app.post('/api/mark-complete/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    await pool.query(
      'UPDATE sessions SET is_completed = true WHERE id = $1',
      [sessionId]
    );
    res.json({ message: 'Session marked as completed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark session as completed' });
  }
});



app.get('/api/user/:id/phone', async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ phone: result.rows[0].phone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Save session to history
app.post('/api/sessions', async (req, res) => {
  const { userId, type, subject, concept, duration, completedAt } = req.body;
  try {
    await pool.query(
      'INSERT INTO session_history (user_id, type, subject, concept, duration, completed_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, type, subject, concept, duration, completedAt]
    );
    res.status(201).json({ message: 'Session saved successfully' });
  } catch (err) {
    console.error('Failed to save session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// Get all sessions for a user
app.get('/api/sessions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT type, subject, concept, duration, completed_at FROM session_history WHERE user_id = $1 ORDER BY completed_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// ✅ GET profile by userId
// Example route in Express
app.get('/api/profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// ✅ PATCH: update name / email / phone / skills individually
app.patch('/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  const { field, value } = req.body;

  // Validate field names to avoid SQL injection
  const allowedFields = ['name', 'email', 'phone', 'skills_to_teach', 'skills_to_learn'];
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ message: 'Invalid field name' });
  }

  try {
    const updateQuery = `
      UPDATE users
      SET ${field} = $1
      WHERE id = $2
      RETURNING id, name, email, phone, skills_to_teach, skills_to_learn
    `;

    const formattedValue = (field.includes('skills') && !Array.isArray(value))
      ? [value] // if sending one skill only
      : value;

    const result = await pool.query(updateQuery, [formattedValue, userId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});
// ✅ DELETE uploaded file by fileId


app.delete('/api/files/:fileId', async (req, res) => {
  const { fileId } = req.params;

  try {
    const fileRes = await pool.query('SELECT file_url FROM files WHERE id = $1', [fileId]);

    if (fileRes.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const relativePath = fileRes.rows[0].file_url.replace('http://localhost:5000/', '');
    const filePath = path.join(__dirname, relativePath);

    await pool.query('DELETE FROM files WHERE id = $1', [fileId]);

    // Delete file from disk
    fs.unlink(filePath, (err) => {
      if (err) console.error('⚠️ Failed to delete file from disk:', err);
    });

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('❌ File deletion failed:', err);
    res.status(500).json({ message: 'File deletion failed' });
  }
});


// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
