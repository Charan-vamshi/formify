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

// Protect owner and admin pages
app.get('/owner.html', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
});

app.get('/admin.html', (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
});

app.use(express.static('public'));

app.use(session({
  secret: 'formify-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  (req, res, next) => {
    const formId = req.query.formId;
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: formId
    })(req, res, next);
  }
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    const email = req.user.emails[0].value;
    const formId = req.query.state;
    
    if (formId) {
      return res.redirect(`https://formify-y9mb.onrender.com/form.html?id=${formId}&email=${email}`);
    }
    
    const { rows } = await pool.query('SELECT * FROM Users WHERE Email = $1', [email]);
    
    if (rows.length === 0) {
      return res.send('<script>alert("Access denied. Contact owner."); window.location.href="/";</script>');
    }
    
    if (rows[0].role === 'Owner') {
      res.redirect('https://formify-y9mb.onrender.com/owner.html?email=' + email);
    } else {
      res.redirect('https://formify-y9mb.onrender.com/admin.html?email=' + email);
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