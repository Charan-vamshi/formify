import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import pool from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import formRoutes from './routes/forms.js';
import whitelistRoutes from './routes/whitelist.js';
import submissionRoutes from './routes/submissions.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'formify-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth routes
app.get('/auth/google',
  (req, res, next) => {
    const formId = req.query.formId;
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: formId // Pass formId through state
    })(req, res, next);
  }
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    const email = req.user.emails[0].value;
    const formId = req.query.state; // Get formId from state parameter
    
    // If accessing a student form
    if (formId) {
      return res.redirect(`/form.html?id=${formId}&email=${email}`);
    }
    
    // Check if user exists for admin/owner login
    const [rows] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    
    if (rows.length === 0) {
      return res.send('<script>alert("Access denied. Contact owner."); window.location.href="/";</script>');
    }
    
    // Redirect based on role
    if (rows[0].Role === 'Owner') {
      res.redirect('/owner.html?email=' + email);
    } else {
      res.redirect('/admin.html?email=' + email);
    }
  }
);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/whitelist', whitelistRoutes);
app.use('/api/submissions', submissionRoutes);

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});