import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pool from './db.js';

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email    = profile.emails[0].value;
    const name     = profile.displayName;
    const googleId = profile.id;

    // Check if user exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (!user.google_id) {
        await pool.query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [googleId, user.id]
        );
        user.google_id = googleId;
      }
      return done(null, user);
    }

    // New Google user
    const result = await pool.query(
      `INSERT INTO users (name, email, google_id, is_verified, created_at)
       VALUES ($1, $2, $3, TRUE, NOW())
       RETURNING *`,
      [name, email, googleId]
    );

    return done(null, result.rows[0]);
  } catch (err) {
    return done(err, null);
  }
}));

// ✅ Required even if not using sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

export default passport;