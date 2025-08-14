import type { Config } from 'tailwindcss';
// Proxy to single source of truth (JS) to avoid duplicates
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cfg = require('./tailwind.config.js');
export default (cfg?.default ?? cfg) as Config;
