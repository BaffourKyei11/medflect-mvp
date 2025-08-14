// Proxy to single source of truth config to avoid duplicate maintenance
const cfg = require('./tailwind.config.js');
module.exports = cfg && cfg.default ? cfg.default : cfg;
