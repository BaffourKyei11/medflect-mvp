const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ ok: true, route: 'blockchain' });
});

router.get('/status', (req, res) => {
  res.json({ connected: false });
});

module.exports = router;
