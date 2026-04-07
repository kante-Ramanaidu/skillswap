import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  if (req.user.id != userId) return res.status(403).json({ message: 'Unauthorized access' });

  try {
    const result = await pool.query('SELECT * FROM progress WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { skill, type, completed } = req.body;

  if (!skill || !type) return res.status(400).json({ message: 'Missing fields' });

  try {
    const existing = await pool.query(
      'SELECT * FROM progress WHERE user_id = $1 AND skill = $2 AND type = $3',
      [userId, skill, type]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE progress SET completed = $1 WHERE user_id = $2 AND skill = $3 AND type = $4',
        [completed, userId, skill, type]
      );
    } else {
      await pool.query(
        'INSERT INTO progress (user_id, skill, type, completed) VALUES ($1, $2, $3, $4)',
        [userId, skill, type, completed]
      );
    }

    res.json({ message: 'Progress saved' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to save progress' });
  }
});

export default router;