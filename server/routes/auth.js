const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Simple health/ping
router.get('/ping', (req, res) => {
  res.json({ ok: true, route: 'auth' });
});

// Minimal login for local testing
router.post('/login', (req, res) => {
  const { username } = req.body || {};
  const user = {
    id: 'demo-user',
    role: 'doctor',
    username: username || 'demo'
  };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '2h' });
  res.json({ token, user });
});

// Current user info (requires upstream auth middleware in future)
router.get('/me', (req, res) => {
  res.json({ user: null });
});

module.exports = router;
