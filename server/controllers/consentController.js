const blockchain = require('../services/blockchain');

exports.grantConsent = async (req, res) => {
  try {
    const { patientAddress, providerAddress, dataType, expiryDays } = req.body;
    if (!patientAddress || !providerAddress || !dataType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await blockchain.grantConsent(patientAddress, providerAddress, dataType, expiryDays);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.body;
    if (!consentId) {
      return res.status(400).json({ error: 'Missing consentId' });
    }
    const result = await blockchain.revokeConsent(consentId);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.checkConsent = async (req, res) => {
  try {
    const { patientId, userId } = req.params;
    const { dataType } = req.query;
    if (!patientId || !userId || !dataType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await blockchain.checkConsent(patientId, userId, dataType);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getConsentLog = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res.status(400).json({ error: 'Missing patientId' });
    }
    const logs = await blockchain.getAuditTrail(patientId);
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
