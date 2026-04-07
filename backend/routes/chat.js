import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/:roomId', authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  try {
    const result = await pool.query(
      `SELECT m.*, u.name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.timestamp ASC`,
      [roomId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch messages error:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

export default router;