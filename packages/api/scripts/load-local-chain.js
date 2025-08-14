#!/usr/bin/env node
/**
 * Reads blockchain/build/{AccessLog,ConsentToken}.json and prints env exports
 * for PowerShell and Bash to enable the API to talk to a local chain.
 *
 * Usage:
 *   node packages/api/scripts/load-local-chain.js
 *
 * Output:
 *   PowerShell:
 *     $env:DISABLE_BLOCKCHAIN='false'
 *     $env:EVM_RPC_URL='http://127.0.0.1:8545'
 *     $env:EVM_PRIVATE_KEY='0x...'
 *     $env:ACCESS_LOG_ADDRESS='0x...'
 *     $env:CONSENT_TOKEN_ADDRESS='0x...'
 *     $env:BLOCKCHAIN_SALT='...' # generate one
 *
 *   Bash:
 *     export DISABLE_BLOCKCHAIN=false
 *     export EVM_RPC_URL=http://127.0.0.1:8545
 *     export EVM_PRIVATE_KEY=0x...
 *     export ACCESS_LOG_ADDRESS=0x...
 *     export CONSENT_TOKEN_ADDRESS=0x...
 *     export BLOCKCHAIN_SALT=...
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const root = path.resolve(__dirname, '..', '..', '..');
const buildDir = path.join(root, 'blockchain', 'build');
const accessPath = path.join(buildDir, 'AccessLog.json');
const consentPath = path.join(buildDir, 'ConsentToken.json');
const access = readJson(accessPath);
const consent = readJson(consentPath);

if (!access || !consent) {
  console.error('[load-local-chain] Missing build JSON. Deploy contracts first:');
  console.error('  cd blockchain && node scripts/deploy.js');
  process.exit(1);
}

const accessAddress = access.address;
const consentAddress = consent.address;

const salt = crypto.randomBytes(32).toString('hex');

console.log('PowerShell (copy/paste):');
console.log(`$env:DISABLE_BLOCKCHAIN='false'`);
console.log(`$env:EVM_RPC_URL='http://127.0.0.1:8545'`);
console.log(`$env:EVM_PRIVATE_KEY='0x<your-dev-private-key>'`);
console.log(`$env:ACCESS_LOG_ADDRESS='${accessAddress}'`);
console.log(`$env:CONSENT_TOKEN_ADDRESS='${consentAddress}'`);
console.log(`$env:BLOCKCHAIN_SALT='${salt}'`);
console.log('');
console.log('Bash (copy/paste):');
console.log(`export DISABLE_BLOCKCHAIN=false`);
console.log(`export EVM_RPC_URL=http://127.0.0.1:8545`);
console.log(`export EVM_PRIVATE_KEY=0x<your-dev-private-key>`);
console.log(`export ACCESS_LOG_ADDRESS=${accessAddress}`);
console.log(`export CONSENT_TOKEN_ADDRESS=${consentAddress}`);
console.log(`export BLOCKCHAIN_SALT=${salt}`);
