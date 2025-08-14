#!/usr/bin/env node
/**
 * Set or unset an operator on the ConsentToken contract.
 *
 * Usage:
 *   node blockchain/scripts/setOperator.js --address 0xAPIWALLET --enable true
 *
 * Env:
 *   EVM_RPC_URL or BESU_RPC_URL
 *   EVM_PRIVATE_KEY (of admin account that deployed ConsentToken)
 *   CONSENT_TOKEN_ADDRESS (deployed address)
 */
const path = require('path');
function loadEthers() {
  try { return require('ethers'); } catch {}
  try { return require(path.resolve(__dirname, '..', '..', 'packages', 'api', 'node_modules', 'ethers')); } catch {}
  console.error('[setOperator] Could not load ethers. Run npm i.');
  process.exit(1);
}
const { ethers } = loadEthers();

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  return def;
}

async function main() {
  const rpc = process.env.EVM_RPC_URL || process.env.BESU_RPC_URL || 'http://127.0.0.1:8545';
  const pk = process.env.EVM_PRIVATE_KEY;
  const addr = process.env.CONSENT_TOKEN_ADDRESS;
  const operator = arg('address');
  const enable = String(arg('enable', 'true')).toLowerCase() !== 'false';
  if (!pk) throw new Error('EVM_PRIVATE_KEY required');
  if (!addr) throw new Error('CONSENT_TOKEN_ADDRESS required');
  if (!operator) throw new Error('--address <operatorAddress> required');

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const build = require(path.resolve(__dirname, '..', 'build', 'ConsentToken.json'));
  const c = new ethers.Contract(addr, build.abi, wallet);
  console.log(`[setOperator] Setting operator ${operator} -> ${enable} on ${addr}`);
  const tx = await c.setOperator(operator, enable);
  const rec = await tx.wait();
  console.log('[setOperator] tx', rec.hash);
}

main().catch((e) => { console.error(e); process.exit(1); });
