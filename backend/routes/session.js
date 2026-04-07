import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ POST /api/sessions — save completed session
router.post('/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, subject, concept, duration, completedAt } = req.body;

    if (!subject || !concept || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await pool.query(
      `INSERT INTO session_history (user_id, type, subject, concept, duration, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, type, subject, concept, duration, completedAt]
    );

    res.status(201).json({ message: 'Session saved successfully' });

  } catch (err) {
    console.error('Save session error:', err.message);
    res.status(500).json({ message: 'Failed to save session' });
  }
});

// ✅ GET /api/sessions — fetch session history
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT type, subject, concept, duration, completed_at
       FROM session_history
       WHERE user_id = $1
       ORDER BY completed_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Fetch sessions error:', err.message);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

export default router;