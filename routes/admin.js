import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/add-admin', async (req, res) => {
  try {
    const { ownerEmail, newAdminEmail } = req.body;
    
    const { rows: owner } = await pool.query('SELECT * FROM Users WHERE Email = $1 AND Role = $2', [ownerEmail, 'Owner']);
    if (owner.length === 0) {
      return res.status(403).json({ error: 'Only owner can add admins' });
    }

    await pool.query('INSERT INTO Users (Email, Role) VALUES ($1, $2)', [newAdminEmail, 'Admin']);
    res.json({ message: 'Admin added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/all-admins', async (req, res) => {
  try {
    const { ownerEmail } = req.body;
    
    const { rows: owner } = await pool.query('SELECT * FROM Users WHERE Email = $1 AND Role = $2', [ownerEmail, 'Owner']);
    if (owner.length === 0) {
      return res.status(403).json({ error: 'Only owner can view admins' });
    }

    const { rows: admins } = await pool.query('SELECT * FROM Users WHERE Role = $1', ['Admin']);
    res.json({ admins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/remove-admin', async (req, res) => {
  try {
    const { ownerEmail, adminEmail } = req.body;
    
    const { rows: owner } = await pool.query('SELECT * FROM Users WHERE Email = $1 AND Role = $2', [ownerEmail, 'Owner']);
    if (owner.length === 0) {
      return res.status(403).json({ error: 'Only owner can remove admins' });
    }

    await pool.query('DELETE FROM Users WHERE Email = $1 AND Role = $2', [adminEmail, 'Admin']);
    res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;