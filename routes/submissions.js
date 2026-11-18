import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    const { formId, studentEmail, responseData } = req.body;
    
    const { rows: form } = await pool.query('SELECT IsLive, RequireWhitelist, ExpiresAt FROM Forms WHERE FormID = $1', [formId]);
    if (form.length === 0 || !form[0].islive) {
      return res.status(400).json({ error: 'Form is not live' });
    }

    if (form[0].expiresat && new Date() > new Date(form[0].expiresat)) {
      return res.status(403).json({ error: 'This form has expired and is no longer accepting submissions.' });
    }

    if (form[0].requirewhitelist) {
      const { rows: whitelist } = await pool.query(
        'SELECT * FROM Whitelists WHERE FormID = $1 AND StudentEmail = $2',
        [formId, studentEmail]
      );
      if (whitelist.length === 0) {
        return res.status(403).json({ error: 'You are not registered with this Gmail.' });
      }
    }

    const { rows: existing } = await pool.query(
      'SELECT * FROM Submissions WHERE FormID = $1 AND StudentEmail = $2',
      [formId, studentEmail]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already submitted this form.' });
    }

    await pool.query(
      'INSERT INTO Submissions (FormID, StudentEmail, ResponseData) VALUES ($1, $2, $3)',
      [formId, studentEmail, JSON.stringify(responseData)]
    );

    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/check-submitted', async (req, res) => {
  try {
    const { formId, studentEmail } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM Submissions WHERE FormID = $1 AND StudentEmail = $2',
      [formId, studentEmail]
    );
    res.json({ submitted: rows.length > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/get-submissions', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    const { rows: admin } = await pool.query('SELECT UserID FROM Users WHERE Email = $1', [adminEmail]);
    const { rows: form } = await pool.query('SELECT * FROM Forms WHERE FormID = $1 AND AdminID = $2', [formId, admin[0].userid]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows: submissions } = await pool.query('SELECT * FROM Submissions WHERE FormID = $1', [formId]);
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/get-count', async (req, res) => {
  try {
    const { formId, adminEmail } = req.body;
    
    const { rows: admin } = await pool.query('SELECT UserID FROM Users WHERE Email = $1', [adminEmail]);
    const { rows: form } = await pool.query('SELECT * FROM Forms WHERE FormID = $1 AND AdminID = $2', [formId, admin[0].userid]);
    
    if (form.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { rows: result } = await pool.query('SELECT COUNT(*) as count FROM Submissions WHERE FormID = $1', [formId]);
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload-file', async (req, res) => {
  try {
    const { fileName, fileType, fileData, formId } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'File name and data are required' });
    }

    const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
    const buffer = Buffer.from(base64Content, 'base64');

    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'File exceeds maximum limit of 2MB' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const bucket = process.env.SUPABASE_BUCKET || 'form-attachments';

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniquePath = `form_${formId || 'gen'}_${Date.now()}_${sanitizedName}`;

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${uniquePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': fileType || 'application/octet-stream',
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      return res.status(500).json({ error: 'Storage upload failed: ' + errText });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${uniquePath}`;
    res.json({ url: publicUrl, fileName: sanitizedName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;