import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const userRes = await pool.query(
      'SELECT skills_to_teach, skills_to_learn FROM users WHERE id = $1', [userId]
    );

    if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = userRes.rows[0];

    const matchRes = await pool.query(
      `SELECT id, name, phone, skills_to_teach, skills_to_learn
       FROM users
       WHERE id != $1
         AND skills_to_teach && $2::text[]
         AND skills_to_learn && $3::text[]`,
      [userId, user.skills_to_learn, user.skills_to_teach]
    );

    res.json({ matchedUsers: matchRes.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;