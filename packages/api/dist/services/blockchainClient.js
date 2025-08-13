const consent = new Map();
export const blockchainClient = {
    async grantConsent(pid, cat) { const s = consent.get(pid) || new Set(); s.add(cat); consent.set(pid, s); return true; },
    async revokeConsent(pid, cat) { const s = consent.get(pid) || new Set(); s.delete(cat); consent.set(pid, s); return true; },
    async checkConsent(pid, cat) { return consent.get(pid)?.has(cat) ?? false; }
};
