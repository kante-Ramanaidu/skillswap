import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, phone, skillsToTeach, skillsToLearn } = req.body;

    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: 'All fields are required' });

    if (typeof skillsToTeach === 'string') skillsToTeach = skillsToTeach.split(',').map(s => s.trim());
    if (typeof skillsToLearn === 'string') skillsToLearn = skillsToLearn.split(',').map(s => s.trim());

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, skills_to_teach, skills_to_learn, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, name, email`,
      [name, email, hashedPassword, phone, skillsToTeach, skillsToLearn]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'Signup successful', token, user });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;