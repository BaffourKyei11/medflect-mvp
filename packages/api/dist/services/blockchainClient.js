import crypto from 'crypto';
import { ethers } from 'ethers';
import fs from 'fs/promises';
import path from 'path';
// In-memory fallback consent state
const memoryConsent = new Map();
let provider = null;
let wallet = null;
let accessLog = null;
let consentToken = null;
let initialized = false;
let patientAddrMap = null;
function getEnvBool(name, def = false) {
    const v = process.env[name];
    if (v === undefined)
        return def;
    return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}
async function loadPatientAddressMap() {
    if (patientAddrMap)
        return patientAddrMap;
    const custom = process.env.PATIENT_ADDRESS_MAP;
    const candidates = [
        custom,
        path.resolve(process.cwd(), 'blockchain', 'build', 'patient-addresses.json'),
        path.resolve(process.cwd(), '..', '..', 'blockchain', 'build', 'patient-addresses.json')
    ].filter(Boolean);
    for (const p of candidates) {
        try {
            const raw = await fs.readFile(p, 'utf8');
            const obj = JSON.parse(raw);
            if (obj && typeof obj === 'object') {
                patientAddrMap = obj;
                console.log('[Blockchain] Loaded patient address map from', p);
                return patientAddrMap;
            }
        }
        catch {
            // ignore and try next
        }
    }
    patientAddrMap = {};
    return patientAddrMap;
}
function hmacSha256Hex(key, payload) {
    return crypto.createHmac('sha256', key).update(payload).digest('hex');
}
async function initIfNeeded() {
    if (initialized)
        return;
    initialized = true;
    if (getEnvBool('DISABLE_BLOCKCHAIN', true)) {
        console.log('[Blockchain] Disabled via DISABLE_BLOCKCHAIN');
        return;
    }
    const rpcUrl = process.env.EVM_RPC_URL || process.env.BESU_RPC_URL;
    const pk = process.env.EVM_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const accessLogAddress = process.env.ACCESS_LOG_ADDRESS;
    const consentTokenAddress = process.env.CONSENT_TOKEN_ADDRESS;
    if (!rpcUrl || !pk) {
        console.warn('[Blockchain] Missing EVM_RPC_URL/PRIVATE_KEY; running in fallback mode');
        return;
    }
    try {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        wallet = new ethers.Wallet(pk, provider);
        // Lazy read ABIs from blockchain/build if available, else minimal interfaces
        let accessLogAbi;
        let consentTokenAbi;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            accessLogAbi = require('../../../blockchain/build/AccessLog.json').abi;
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            consentTokenAbi = require('../../../blockchain/build/ConsentToken.json').abi;
        }
        catch {
            accessLogAbi = [
                { "inputs": [
                        { "internalType": "uint256", "name": "consentId", "type": "uint256" },
                        { "internalType": "bytes32", "name": "actionHash", "type": "bytes32" },
                        { "internalType": "string", "name": "actionType", "type": "string" }
                    ], "name": "logAccess", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }
            ];
            consentTokenAbi = [
                { "inputs": [
                        { "internalType": "string[]", "name": "fhirResources", "type": "string[]" },
                        { "internalType": "string[]", "name": "purposes", "type": "string[]" }
                    ], "name": "grantConsent", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" },
                { "inputs": [
                        { "internalType": "uint256", "name": "consentId", "type": "uint256" }
                    ], "name": "revokeConsent", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
            ];
        }
        if (accessLogAddress) {
            accessLog = new ethers.Contract(accessLogAddress, accessLogAbi, wallet);
            console.log('[Blockchain] AccessLog connected at', accessLogAddress);
        }
        if (consentTokenAddress) {
            consentToken = new ethers.Contract(consentTokenAddress, consentTokenAbi, wallet);
            console.log('[Blockchain] ConsentToken connected at', consentTokenAddress);
        }
    }
    catch (e) {
        console.warn('[Blockchain] Init error; falling back to memory. Reason:', e.message);
        provider = null;
        wallet = null;
        accessLog = null;
        consentToken = null;
    }
}
async function recordAuditHashInternal(obj, consentId = 0, actionType = 'event') {
    await initIfNeeded();
    const salt = process.env.BLOCKCHAIN_SALT || 'medflect-dev-salt';
    const payload = JSON.stringify(obj);
    const hex = hmacSha256Hex(salt, payload);
    if (!accessLog || getEnvBool('DISABLE_BLOCKCHAIN', true)) {
        // fallback: no-op, just return the hash
        return { hashHex: hex, txHash: undefined };
    }
    try {
        const hash32 = '0x' + hex;
        const tx = await accessLog.logAccess(consentId, hash32, actionType);
        const rec = await tx.wait();
        return { hashHex: hex, txHash: rec?.hash };
    }
    catch (e) {
        console.warn('[Blockchain] recordAuditHash failed:', e.message);
        return { hashHex: hex, txHash: undefined };
    }
}
export const blockchainClient = {
    /** In dev, we maintain consent state in-memory. On-chain consent requires contract changes (admin/role-based grant). */
    async grantConsent(patientId, category) {
        const s = memoryConsent.get(patientId) || new Set();
        s.add(category);
        memoryConsent.set(patientId, s);
        // Emit an audit event on-chain if enabled
        await recordAuditHashInternal({ event: 'consent_grant', patientId, category }, 0, 'consent_grant');
        // Optional: also mint consent on-chain if ConsentToken connected and patient address is known
        try {
            await initIfNeeded();
            if (consentToken && !getEnvBool('DISABLE_BLOCKCHAIN', true)) {
                const map = await loadPatientAddressMap();
                const addr = map[patientId];
                if (addr && ethers.isAddress(addr)) {
                    const tx = await consentToken.grantConsentFor(addr, [category], ['treatment']);
                    await tx.wait();
                    console.log('[Blockchain] grantConsentFor minted on-chain for', patientId, '->', addr);
                }
                else {
                    // No mapping; skip on-chain mint
                }
            }
        }
        catch (e) {
            console.warn('[Blockchain] grantConsentFor failed; continuing in-memory. Reason:', e.message);
        }
        return true;
    },
    async revokeConsent(patientId, category) {
        const s = memoryConsent.get(patientId) || new Set();
        s.delete(category);
        memoryConsent.set(patientId, s);
        await recordAuditHashInternal({ event: 'consent_revoke', patientId, category }, 0, 'consent_revoke');
        // Note: on-chain revoke would require tracking consentId per patient/category.
        // We anchor the revoke event hash only for now.
        return true;
    },
    async checkConsent(patientId, category) {
        return memoryConsent.get(patientId)?.has(category) ?? false;
    },
    async recordAuditHash(obj, consentId = 0, actionType = 'event') {
        return recordAuditHashInternal(obj, consentId, actionType);
    }
};
