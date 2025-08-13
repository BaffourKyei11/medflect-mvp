const blockchain = require('../services/blockchain');

exports.getAuditLogs = async (req, res) => {
  try {
    // Optionally support pagination in the future
    const logs = await blockchain.getAuditTrail(); // get all logs
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Missing log id' });
    }
    const log = await blockchain.getAuditLogById(id);
    return res.json({ success: true, log });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
