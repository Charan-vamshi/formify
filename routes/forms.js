import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { adminEmail, formTitle, formStructure, requireWhitelist } = req.body;
    
    const { rows: admin } = await pool.query('SELECT * FROM Users WHERE Email = $1 AND Role = $2', [adminEmail, 'Admin']);
    if (admin.length === 0) {
      return res.status(403).json({ error: 'Only admins can create forms' });
    }

    const { rows: result } = await pool.query(
      'INSERT INTO Forms (AdminID, FormTitle, FormStructure, RequireWhitelist) VALUES ($1, $2, $3, $4) RETURNING FormID',
      [admin[0].userid, formTitle, JSON.stringify(formStructure), requireWhitelist !== false]
    );

    res.json({ message: 'Form created', formId: result[0].formid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/my-forms', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    
    const { rows: admin } = await pool.query('SELECT UserID FROM Users WHERE Email = $1', [adminEmail]);
    if (admin.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { rows: forms } = await pool.query('SELECT * FROM Forms WHERE AdminID = $1', [admin[0].userid]);
    res.json({ forms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/go-live', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    const { rows: admin } = await pool.query('SELECT UserID FROM Users WHERE Email = $1', [adminEmail]);
    const { rows: form } = await pool.query('SELECT * FROM Forms WHERE FormID = $1 AND AdminID = $2', [formId, admin[0].userid]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('UPDATE Forms SET IsLive = TRUE WHERE FormID = $1', [formId]);
    res.json({ message: 'Form is now live!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/delete', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    const { rows: admin } = await pool.query('SELECT UserID FROM Users WHERE Email = $1', [adminEmail]);
    const { rows: form } = await pool.query('SELECT * FROM Forms WHERE FormID = $1 AND AdminID = $2', [formId, admin[0].userid]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM Forms WHERE FormID = $1', [formId]);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/get-form', async (req, res) => {
  try {
    const { formId } = req.body;
    const { rows: form } = await pool.query('SELECT * FROM Forms WHERE FormID = $1', [formId]);
    
    if (form.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json(form[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;