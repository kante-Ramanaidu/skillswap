import express from 'express';
import multer from 'multer';
import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const { roomId, userId } = req.body;

  if (!req.file) return res.status(400).json({ message: 'File missing' });
  if (!roomId || !userId) return res.status(400).json({ message: 'Missing roomId or userId' });
  if (!req.file.buffer || req.file.buffer.length === 0)
    return res.status(400).json({ message: 'Empty file buffer' });

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'skillswap_resources' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    await pool.query(
      `INSERT INTO files (room_id, uploaded_by, file_url, file_name) VALUES ($1, $2, $3, $4)`,
      [roomId, userId, result.secure_url, req.file.originalname]
    );

    res.json({ message: 'File uploaded successfully', fileUrl: result.secure_url });

  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.get('/files/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const parts = roomId.split('_');
    const reversedRoomId = `${parts[1]}_${parts[0]}`;

    const result = await pool.query(
      `SELECT f.*, u.name AS uploader_name
       FROM files f
       JOIN users u ON f.uploaded_by = u.id
       WHERE f.room_id = $1 OR f.room_id = $2
       ORDER BY f.uploaded_at DESC`,
      [roomId, reversedRoomId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('❌ Fetch files error:', err.message);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
});

router.delete('/files/:fileId', async (req, res) => {
  const { fileId } = req.params;

  try {
    const fileRes = await pool.query('SELECT file_url FROM files WHERE id = $1', [fileId]);
    if (fileRes.rows.length === 0) return res.status(404).json({ message: 'File not found' });

    const fileUrl = fileRes.rows[0].file_url;
    const publicId = fileUrl.split('/upload/')[1].split('.')[0];

    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    await pool.query('DELETE FROM files WHERE id = $1', [fileId]);

    res.json({ message: 'Deleted successfully' });

  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;