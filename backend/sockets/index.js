import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const setupSockets = (io) => {

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
    });

    socket.on('sendMessage', async ({ roomId, message }) => {
      const senderId = socket.user.id;
      if (!message?.trim()) return;

      try {
        const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [senderId]);
        const senderName = userRes.rows[0]?.name || `User ${senderId}`;

        const result = await pool.query(
          `INSERT INTO messages (room_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
          [roomId, senderId, message.trim()]
        );

        io.to(roomId).emit('receiveMessage', {
          ...result.rows[0],
          senderId,
          sender_name: senderName,
        });

      } catch (err) {
        console.error('Message error:', err.message); // ✅ keep only real errors
      }
    });

    // 📹 VIDEO CALL SIGNALING
    socket.on('callUser', ({ roomId, offer }) => {
      socket.to(roomId).emit('incomingCall', { offer, callerId: socket.user.id });
    });

    socket.on('answerCall', ({ roomId, answer }) => {
      socket.to(roomId).emit('callAnswered', { answer });
    });

    socket.on('iceCandidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('iceCandidate', { candidate });
    });

    socket.on('endCall', ({ roomId }) => {
      socket.to(roomId).emit('callEnded');
    });

    socket.on('rejectCall', ({ roomId }) => {
      socket.to(roomId).emit('callRejected');
    });

    socket.on('disconnect', () => {
      console.error(`Socket disconnected: ${socket.id}`); // ✅ keep for error tracking
    });
  });
};

export default setupSockets;