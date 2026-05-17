import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pool from '../config/db.js';

const router = express.Router();

// ✅ Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

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
      `INSERT INTO users (name, email, password, phone, skills_to_teach, skills_to_learn, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, name, email`,
      [name, email, hashedPassword, phone, skillsToTeach, skillsToLearn]
    );

    const user = result.rows[0];

    // ✅ Generate email verification token
    const verifyToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ✅ Send verification email
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Verify your SkillSwap email',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f0f1a;color:#e2e8f0;border-radius:16px;">
          <h2 style="background:linear-gradient(90deg,#4fffcb,#00d4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">
            Welcome to SkillSwap, ${user.name}! 👋
          </h2>
          <p style="color:#94a3b8;margin-bottom:24px;">
            You're one step away. Click the button below to verify your email address and activate your account.
          </p>
          <a href="${verifyLink}"
            style="display:inline-block;background:linear-gradient(90deg,#00e6b4,#00b4d8);color:#0f172a;padding:12px 28px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
            Verify My Email
          </a>
          <p style="color:#475569;font-size:13px;margin-top:24px;">
            This link expires in 24 hours. If you didn't sign up, you can ignore this email.
          </p>
        </div>
      `
    });

    res.status(201).json({
      message: 'Signup successful! Please check your email to verify your account.'
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
});

// ✅ VERIFY EMAIL
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await pool.query(
      'UPDATE users SET is_verified = TRUE WHERE id = $1',
      [decoded.id]
    );

    res.json({ message: 'Email verified successfully! You can now log in.' });

  } catch (err) {
    console.error('Verify error:', err.message);
    res.status(400).json({ message: 'Invalid or expired verification link.' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );
    const user = result.rows[0];

    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Block unverified users
    if (!user.is_verified)
      return res.status(403).json({ message: 'Please verify your email before logging in.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

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

export default router;