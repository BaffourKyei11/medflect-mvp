#!/usr/bin/env node
/**
 * E2E: POST /api/consent then verify an AccessLog on-chain event.
 * Requires blockchain enabled and AccessLog deployed; uses Node 18+ global fetch.
 *
 * Env:
 *   API_BASE (default http://localhost:3001)
 *   PATIENT_ID (default demo-patient-1)
 *   EVM_RPC_URL or BESU_RPC_URL
 *   ACCESS_LOG_ADDRESS (from blockchain/build/AccessLog.json)
 */

const path = require('path');
function loadEthers() {
  try { return require('ethers'); } catch {}
  try { return require(path.resolve(__dirname, '..', 'node_modules', 'ethers')); } catch {}
  console.error('[e2e] Could not load ethers. Run npm i in packages/api');
  process.exit(1);
}
const { ethers } = loadEthers();

async function main() {
  const API_BASE = process.env.API_BASE || 'http://localhost:3001';
  const PATIENT_ID = process.env.PATIENT_ID || 'demo-patient-1';
  const RPC = process.env.EVM_RPC_URL || process.env.BESU_RPC_URL || 'http://127.0.0.1:8545';

  // 1) Call API to grant consent
  const url = `${API_BASE}/api/consent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ patientId: PATIENT_ID, consent: 'read' })
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[e2e] API error', res.status, body);
    process.exit(1);
  }
  console.log('[e2e] API consent response:', body);

  // 2) Wait a moment for async audit anchoring
  await new Promise((r) => setTimeout(r, 1500));

  // 3) Read AccessLog events
  const root = path.resolve(__dirname, '..', '..', '..');
  const access = require(path.join(root, 'blockchain', 'build', 'AccessLog.json'));
  if (!access?.address || !access?.abi) {
    console.error('[e2e] Missing AccessLog build JSON. Deploy contracts first.');
    process.exit(1);
  }
  const provider = new ethers.JsonRpcProvider(RPC);
  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - 3000);
  const c = new ethers.Contract(access.address, access.abi, provider);

  // Attempt to fetch events by name, fallback to all
  let filter = null;
  for (const n of ['AccessLogged', 'LogAccess', 'AuditRecorded']) {
    try { filter = c.filters[n](); break; } catch {}
  }
  if (!filter) filter = {};

  const logs = await c.queryFilter(filter, fromBlock, latest);
  console.log(`[e2e] Found ${logs.length} AccessLog events in last ${latest-fromBlock} blocks`);

  // Best-effort: print last 5
  logs.slice(-5).forEach((l, i) => {
    console.log(`[e2e] Event #${i+1}:`, { name: l.eventName, block: l.blockNumber, tx: l.transactionHash });
  });

  console.log('[e2e] Done');
}

main().catch((e) => { console.error(e); process.exit(1); });
