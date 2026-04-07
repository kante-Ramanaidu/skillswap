import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes      from './routes/auth.js';
import matchRoutes     from './routes/match.js';
import chatRoutes      from './routes/chat.js';
import filesRoutes     from './routes/files.js';
import friendsRoutes   from './routes/friends.js';
import progressRoutes  from './routes/progress.js';
import schedulesRoutes from './routes/schedules.js';
import profileRoutes   from './routes/profile.js';
import sessionsRoutes  from './routes/session.js';

import setupSockets from './sockets/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app    = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

setupSockets(io);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/match',     matchRoutes);
app.use('/api/chat',      chatRoutes);
app.use('/api',           filesRoutes);
app.use('/api',           friendsRoutes);
app.use('/api/progress',  progressRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api',           sessionsRoutes);

// Serve React frontend (change 'dist' to 'build' if using Create React App)
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});