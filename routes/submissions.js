import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Submit form response
router.post('/submit', async (req, res) => {
  try {
    const { formId, studentEmail, responseData } = req.body;
    
    // Get form details
    const [form] = await pool.query('SELECT IsLive, RequireWhitelist FROM Forms WHERE FormID = ?', [formId]);
    if (form.length === 0 || !form[0].IsLive) {
      return res.status(400).json({ error: 'Form is not live' });
    }

    // Check whitelist only if required
    if (form[0].RequireWhitelist) {
      const [whitelist] = await pool.query(
        'SELECT * FROM Whitelists WHERE FormID = ? AND StudentEmail = ?',
        [formId, studentEmail]
      );

      if (whitelist.length === 0) {
        return res.status(403).json({ error: 'You are not registered with this Gmail.' });
      }
    }

    // Check if already submitted
    const [existing] = await pool.query(
      'SELECT * FROM Submissions WHERE FormID = ? AND StudentEmail = ?',
      [formId, studentEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already submitted this form.' });
    }

    // Submit response
    await pool.query(
      'INSERT INTO Submissions (FormID, StudentEmail, ResponseData) VALUES (?, ?, ?)',
      [formId, studentEmail, JSON.stringify(responseData)]
    );

    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submissions for a form (Admin only)
router.post('/get-submissions', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    // Verify admin owns this form
    const [admin] = await pool.query('SELECT UserID FROM Users WHERE Email = ?', [adminEmail]);
    const [form] = await pool.query('SELECT * FROM Forms WHERE FormID = ? AND AdminID = ?', [formId, admin[0].UserID]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [submissions] = await pool.query('SELECT * FROM Submissions WHERE FormID = ?', [formId]);
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submission count
router.post('/get-count', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    // Verify admin owns this form
    const [admin] = await pool.query('SELECT UserID FROM Users WHERE Email = ?', [adminEmail]);
    const [form] = await pool.query('SELECT * FROM Forms WHERE FormID = ? AND AdminID = ?', [formId, admin[0].UserID]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [result] = await pool.query('SELECT COUNT(*) as count FROM Submissions WHERE FormID = ?', [formId]);
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;