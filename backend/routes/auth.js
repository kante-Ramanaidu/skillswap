import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import '../config/passport.js';
import pool from '../config/db.js';

const router = express.Router();

// ✅ SIGNUP
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, phone, skillsToTeach, skillsToLearn } = req.body;

    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: 'All fields are required' });

    if (typeof skillsToTeach === 'string')
      skillsToTeach = skillsToTeach.split(',').map(s => s.trim());
    if (typeof skillsToLearn === 'string')
      skillsToLearn = skillsToLearn.split(',').map(s => s.trim());

    if (!skillsToTeach || skillsToTeach.length === 0)
      return res.status(400).json({ message: 'Please add at least one skill to teach' });
    if (!skillsToLearn || skillsToLearn.length === 0)
      return res.status(400).json({ message: 'Please add at least one skill to learn' });

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    if (existingUser.rows.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone, skills_to_teach, skills_to_learn, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
       RETURNING id, name, email`,
      [name, email, hashedPassword, phone, skillsToTeach, skillsToLearn]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Signup successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.password)
      return res.status(400).json({ message: 'This account uses Google Sign In. Please use that instead.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ✅ GOOGLE OAuth — Step 1: redirect to Google
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false  // ✅ no session needed — we use JWT
  })
);

// ✅ GOOGLE OAuth — Step 2: callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false  // ✅ no session needed — we use JWT
  }),
  async (req, res) => {
    try {
      const user = req.user;
      const needsProfile = !user.phone || !user.skills_to_teach || user.skills_to_teach.length === 0;
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      if (needsProfile) {
        return res.redirect(
          `${process.env.CLIENT_URL}/complete-profile?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`
        );
      }

      res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);

    } catch (err) {
      console.error('Google callback error:', err.message);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);

// ✅ COMPLETE PROFILE — for new Google users
router.post('/complete-profile', async (req, res) => {
  try {
    let { token, phone, skillsToTeach, skillsToLearn } = req.body;

    if (!token || !phone)
      return res.status(400).json({ message: 'All fields are required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof skillsToTeach === 'string')
      skillsToTeach = skillsToTeach.split(',').map(s => s.trim());
    if (typeof skillsToLearn === 'string')
      skillsToLearn = skillsToLearn.split(',').map(s => s.trim());

    await pool.query(
      `UPDATE users SET phone = $1, skills_to_teach = $2, skills_to_learn = $3 WHERE id = $4`,
      [phone, skillsToTeach, skillsToLearn, decoded.id]
    );

    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Profile completed!', token: newToken, user });

  } catch (err) {
    console.error('Complete profile error:', err.message);
    res.status(500).json({ message: 'Failed to complete profile.' });
  }
});

export default router;