import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Upload whitelist (CSV data as array of emails)
router.post('/upload', async (req, res) => {
  try {
    const { formId, emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required' });
    }

    // Insert all emails for this form
    const values = emails.map(email => [formId, email]);
    await pool.query('INSERT IGNORE INTO Whitelists (FormID, StudentEmail) VALUES ?', [values]);

    res.json({ message: 'Whitelist uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if student is whitelisted
router.post('/check', async (req, res) => {
  try {
    const { formId, studentEmail } = req.body;
    
    const [rows] = await pool.query(
      'SELECT * FROM Whitelists WHERE FormID = ? AND StudentEmail = ?',
      [formId, studentEmail]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'You are not registered with this Gmail. Please contact the one who shared this form.' });
    }

    res.json({ message: 'Access granted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;