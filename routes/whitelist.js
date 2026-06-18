import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/upload', async (req, res) => {
  try {
    const { formId, emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required' });
    }

    for (const email of emails) {
      await pool.query(
        'INSERT INTO Whitelists (FormID, StudentEmail) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [formId, email]
      );
    }

    res.json({ message: 'Whitelist uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload-blacklist', async (req, res) => {
  try {
    const { formId, emails } = req.body;
    
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array is required' });
    }

    for (const email of emails) {
      await pool.query(
        'INSERT INTO Blacklists (FormID, StudentEmail) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [formId, email]
      );
    }

    res.json({ message: 'Blacklist uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/check', async (req, res) => {
  try {
    const { formId, studentEmail } = req.body;
    
    const { rows: form } = await pool.query('SELECT RequireWhitelist FROM Forms WHERE FormID = $1', [formId]);
    
    if (form.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const { rows: blacklist } = await pool.query(
      'SELECT * FROM Blacklists WHERE FormID = $1 AND StudentEmail = $2',
      [formId, studentEmail]
    );

    if (blacklist.length > 0) {
      return res.status(403).json({ error: 'Access denied. You are not eligible for this form.' });
    }
    
    if (!form[0].requirewhitelist) {
      return res.json({ message: 'Access granted' });
    }
    
    const { rows: whitelist } = await pool.query(
      'SELECT * FROM Whitelists WHERE FormID = $1 AND StudentEmail = $2',
      [formId, studentEmail]
    );

    if (whitelist.length === 0) {
      return res.status(403).json({ error: 'You are not registered with this Gmail. Please contact the one who shared this form.' });
    }

    res.json({ message: 'Access granted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;