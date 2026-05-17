import express from 'express';
import pool from '../config/db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/friend-request', authMiddleware, async (req, res) => {
  const senderId = req.user.id;
  const { receiverId } = req.body;

  try {
    if (senderId === receiverId) return res.status(400).json({ message: 'Cannot send request to yourself' });

    const check = await pool.query(
      `SELECT * FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2`, [senderId, receiverId]
    );
    if (check.rows.length > 0) return res.status(400).json({ message: 'Request already sent.' });

    const friendCheck = await pool.query(
      `SELECT * FROM friends WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
      [senderId, receiverId]
    );
    if (friendCheck.rows.length > 0) return res.status(400).json({ message: 'Already friends.' });

    await pool.query(
      `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')`,
      [senderId, receiverId]
    );

    res.json({ message: 'Friend request sent!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/friend-requests', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT fr.id, fr.sender_id, u.name AS sender_name
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       WHERE fr.receiver_id = $1 AND fr.status = 'pending'`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load requests' });
  }
});

router.post('/friend-request/accept', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { requestId } = req.body;

  try {
    const requestRes = await pool.query('SELECT * FROM friend_requests WHERE id = $1', [requestId]);
    if (requestRes.rows.length === 0) return res.status(404).json({ message: 'Request not found' });

    const request = requestRes.rows[0];
    if (request.receiver_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await pool.query('UPDATE friend_requests SET status = $1 WHERE id = $2', ['accepted', requestId]);
    await pool.query('INSERT INTO friends (user1_id, user2_id) VALUES ($1, $2)', [request.sender_id, request.receiver_id]);

    res.json({ message: 'Friend request accepted.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error accepting request' });
  }
});

router.get('/friends', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name FROM users u
       WHERE u.id IN (
         SELECT user1_id FROM friends WHERE user2_id = $1
         UNION
         SELECT user2_id FROM friends WHERE user1_id = $1
       )`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch friends' });
  }
});

router.get('/is-friend/:otherUserId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;
  try {
    const check = await pool.query(
      `SELECT * FROM friends WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)`,
      [userId, otherUserId]
    );
    res.json({ isFriend: check.rows.length > 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sent-friend-requests', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT receiver_id FROM friend_requests WHERE sender_id = $1 AND status = 'pending'`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

router.post('/friend-request/decline', authMiddleware, async (req, res) => {
  const { requestId } = req.body;
  try {
    await pool.query('DELETE FROM friend_requests WHERE id = $1', [requestId]);
    res.json({ message: 'Request declined' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to decline request' });
  }
});

export default router;