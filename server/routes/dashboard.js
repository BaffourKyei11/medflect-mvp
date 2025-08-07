const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ ok: true, route: 'dashboard' });
});

router.get('/stats', (req, res) => {
  res.json({ patients: 0, encounters: 0, uptime: process.uptime() });
});

module.exports = router;
