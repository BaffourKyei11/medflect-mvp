// Proxy to single source of truth (ESM) config to avoid duplication
const cfg = require('./postcss.config.js');
module.exports = cfg && cfg.default ? cfg.default : cfg;
