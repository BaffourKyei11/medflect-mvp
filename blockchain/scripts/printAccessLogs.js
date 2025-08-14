#!/usr/bin/env node
/**
 * Print recent AccessLog events from local/remote chain using ethers v6.
 * Tries to load ethers from the API's node_modules to avoid extra installs.
 *
 * Usage:
 *   node blockchain/scripts/printAccessLogs.js [--from <blocks>] [--rpc <url>] [--address <0x..>]
 *
 * Defaults:
 *   --from 2000
 *   --rpc  $EVM_RPC_URL || $BESU_RPC_URL || http://127.0.0.1:8545
 *   --address read from blockchain/build/AccessLog.json
 */

const fs = require('fs');
const path = require('path');

function loadEthers() {
  try { return require('ethers'); } catch {}
  try { return require(path.resolve(__dirname, '..', '..', 'packages', 'api', 'node_modules', 'ethers')); } catch {}
  try { return require(path.resolve(__dirname, '..', '..', 'node_modules', 'ethers')); } catch {}
  console.error('[printAccessLogs] Could not load ethers. Run npm install in the repo, or in packages/api.');
  process.exit(1);
}

const { ethers } = loadEthers();

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

const args = process.argv.slice(2);
function argval(flag, def) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const root = path.resolve(__dirname, '..', '..');
const buildDir = path.join(root, 'build');
const accessPath = path.join(buildDir, 'AccessLog.json');
const access = readJson(accessPath) || {};

const defaultRpc = process.env.EVM_RPC_URL || process.env.BESU_RPC_URL || 'http://127.0.0.1:8545';
const rpc = argval('--rpc', defaultRpc);
const fromBlocks = parseInt(argval('--from', '2000'), 10);
const address = argval('--address', access.address);
const abi = access.abi;

if (!address || !abi) {
  console.error('[printAccessLogs] Missing AccessLog address/abi. Deploy contracts first (blockchain/scripts/deploy.js).');
  process.exit(1);
}

(async () => {
  const provider = new ethers.JsonRpcProvider(rpc);
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - fromBlocks);

  const contract = new ethers.Contract(address, abi, provider);
  // Try to find event by common names
  const eventNames = ['AccessLogged', 'LogAccess', 'AuditRecorded'];
  let filter = null;
  for (const name of eventNames) {
    try {
      // If event exists, this builds a filter
      filter = contract.filters[name]();
      break;
    } catch {}
  }
  if (!filter) {
    // fallback to all events
    filter = {};
  }

  const logs = await contract.queryFilter(filter, fromBlock, latest);
  console.log(`Found ${logs.length} events for ${address} from block ${fromBlock} to ${latest}`);
  for (const log of logs) {
    const { blockNumber, transactionHash, args, eventName } = log;
    console.log({ blockNumber, tx: transactionHash, event: eventName, args });
  }
})();
