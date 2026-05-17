import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const studyRoomUsers = new Map();

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
        console.error('Message error:', err.message);
      }
    });

    // 🟢 STUDY ROOM PRESENCE
    socket.on('join-study-room', (userId) => {
      studyRoomUsers.set(String(userId), socket.id);
      io.emit('user-online', String(userId));
    });

    socket.on('leave-study-room', (userId) => {
      studyRoomUsers.delete(String(userId));
      io.emit('user-offline', String(userId));
    });

    // 🟢 CHECK IF USER IS ALREADY ONLINE
    socket.on('check-online', (userIdToCheck) => {
      const isOnline = studyRoomUsers.has(String(userIdToCheck));
      socket.emit('user-status', { userId: String(userIdToCheck), isOnline });
    });

    // 📹 VIDEO CALL SIGNALING
   socket.on('callUser', ({ roomId, offer }) => {
  // ADD THIS
  const room = io.sockets.adapter.rooms.get(roomId);
  // console.log(`👥 Users in room ${roomId}:`, room ? [...room] : 'EMPTY ROOM'); // ADD THIS
  socket.to(roomId).emit('incomingCall', { offer, callerId: socket.user.id });
});


  
    socket.on('answerCall', ({ roomId, answer }) => {
      socket.to(roomId).emit('callAnswered', { answer });
    });

    socket.on('iceCandidate', ({ roomId, candidate }) => {
      // ✅ Guard: only forward valid candidates
      if (candidate) {
        socket.to(roomId).emit('iceCandidate', { candidate });
      }
    });
   


socket.on('renegotiateOffer', ({ roomId, offer }) => {
  socket.to(roomId).emit('renegotiateOffer', { offer });
});

// When the other peer responds with an answer
socket.on('renegotiateAnswer', ({ roomId, answer }) => {
  socket.to(roomId).emit('renegotiateAnswer', { answer });
});

    socket.on('endCall', ({ roomId }) => {
      socket.to(roomId).emit('callEnded');
    });

    socket.on('rejectCall', ({ roomId }) => {
      socket.to(roomId).emit('callRejected');
    });

    socket.on('disconnect', () => {
      const userId = socket.user?.id;
      if (userId && studyRoomUsers.get(String(userId)) === socket.id) {
        studyRoomUsers.delete(String(userId));
        io.emit('user-offline', String(userId));
      }
      
    });
  });
};

export default setupSockets;