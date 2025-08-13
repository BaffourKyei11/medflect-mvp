const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ ok: true, route: 'sync' });
});

router.post('/manual', async (req, res) => {
  res.json({ started: true, synced: 0, errors: 0 });
});

module.exports = router;
