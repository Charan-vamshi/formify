import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Check if user can access the system
router.post('/check-access', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const [rows] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Access denied. Contact the owner.' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;