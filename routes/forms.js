import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Create a new form
router.post('/create', async (req, res) => {
  try {
    const { adminEmail, formTitle, formStructure, requireWhitelist } = req.body;
    
    // Verify admin
    const [admin] = await pool.query('SELECT * FROM Users WHERE Email = ? AND Role = ?', [adminEmail, 'Admin']);
    if (admin.length === 0) {
      return res.status(403).json({ error: 'Only admins can create forms' });
    }

    // Create form
    const [result] = await pool.query(
      'INSERT INTO Forms (AdminID, FormTitle, FormStructure, RequireWhitelist) VALUES (?, ?, ?, ?)',
      [admin[0].UserID, formTitle, JSON.stringify(formStructure), requireWhitelist !== false]
    );

    res.json({ message: 'Form created', formId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin's forms
router.post('/my-forms', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    
    const [admin] = await pool.query('SELECT UserID FROM Users WHERE Email = ?', [adminEmail]);
    if (admin.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [forms] = await pool.query('SELECT * FROM Forms WHERE AdminID = ?', [admin[0].UserID]);
    res.json({ forms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Make form live
router.post('/go-live', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    // Verify admin owns this form
    const [admin] = await pool.query('SELECT UserID FROM Users WHERE Email = ?', [adminEmail]);
    const [form] = await pool.query('SELECT * FROM Forms WHERE FormID = ? AND AdminID = ?', [formId, admin[0].UserID]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('UPDATE Forms SET IsLive = TRUE WHERE FormID = ?', [formId]);
    res.json({ message: 'Form is now live!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete form
router.post('/delete', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    // Verify admin owns this form
    const [admin] = await pool.query('SELECT UserID FROM Users WHERE Email = ?', [adminEmail]);
    const [form] = await pool.query('SELECT * FROM Forms WHERE FormID = ? AND AdminID = ?', [formId, admin[0].UserID]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM Forms WHERE FormID = ?', [formId]);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get form by ID (for students)
router.post('/get-form', async (req, res) => {
  try {
    const { formId } = req.body;
    const [form] = await pool.query('SELECT * FROM Forms WHERE FormID = ?', [formId]);
    
    if (form.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;