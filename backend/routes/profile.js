import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, skills_to_teach, skills_to_learn FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { field, value } = req.body;

  const allowedFields = ['name', 'email', 'phone', 'skills_to_teach', 'skills_to_learn'];
  if (!allowedFields.includes(field)) return res.status(400).json({ message: 'Invalid field name' });

  try {
    let formattedValue = value;
    if (field === 'skills_to_teach' || field === 'skills_to_learn') {
      formattedValue = Array.isArray(value)
        ? value
        : value.split(',').map(s => s.trim()).filter(Boolean);
    }

    const result = await pool.query(
      `UPDATE users SET ${field} = $1 WHERE id = $2
       RETURNING id, name, email, phone, skills_to_teach, skills_to_learn`,
      [formattedValue, userId]
    );
    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

router.get('/user/:id/phone', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT phone FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ phone: result.rows[0].phone });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;