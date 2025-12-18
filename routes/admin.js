import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Owner adds a new Admin
router.post('/add-admin', async (req, res) => {
  try {
    const { ownerEmail, newAdminEmail } = req.body;
    
    // Verify owner
    const [owner] = await pool.query('SELECT * FROM Users WHERE Email = ? AND Role = ?', [ownerEmail, 'Owner']);
    if (owner.length === 0) {
      return res.status(403).json({ error: 'Only owner can add admins' });
    }

    // Add new admin
    await pool.query('INSERT INTO Users (Email, Role) VALUES (?, ?)', [newAdminEmail, 'Admin']);
    res.json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all admins (Owner only)
router.post('/all-admins', async (req, res) => {
  try {
    const { ownerEmail } = req.body;
    
    // Verify owner
    const [owner] = await pool.query('SELECT * FROM Users WHERE Email = ? AND Role = ?', [ownerEmail, 'Owner']);
    if (owner.length === 0) {
      return res.status(403).json({ error: 'Only owner can view admins' });
    }

    // Get all admins
    const [admins] = await pool.query('SELECT * FROM Users WHERE Role = ?', ['Admin']);
    res.json({ admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;