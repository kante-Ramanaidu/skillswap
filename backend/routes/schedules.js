import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  const userId = req.user.id;
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

router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { roomId, friendId, skill, description, scheduled_time, role } = req.body;

  const teacherId = role === 'teacher' ? userId : friendId;
  const learnerId = role === 'teacher' ? friendId : userId;

  try {
    await pool.query(
      `INSERT INTO sessions (room_id, teacher_id, learner_id, skill, description, scheduled_time, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, false)`,
      [roomId, teacherId, learnerId, skill, description, scheduled_time]
    );
    res.status(201).json({ message: 'Session created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create session' });
  }
});

router.post('/mark-complete/:sessionId', authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  try {
    const sessionRes = await pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (sessionRes.rows.length === 0) return res.status(404).json({ message: 'Session not found' });

    const session = sessionRes.rows[0];
    if (userId !== session.teacher_id && userId !== session.learner_id)
      return res.status(403).json({ message: 'Unauthorized' });

    await pool.query('UPDATE sessions SET is_completed = true WHERE id = $1', [sessionId]);
    res.json({ message: 'Session marked as completed' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to mark session as completed' });
  }
});


export default router;