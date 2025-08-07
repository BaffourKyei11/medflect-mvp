const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ ok: true, route: 'patients' });
});

// Minimal list endpoint
router.get('/', (req, res) => {
  res.json({ patients: [] });
});

// Minimal detail endpoint
router.get('/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'Test Patient' });
});

module.exports = router;
