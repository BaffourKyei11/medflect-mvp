const consent = new Map<string, Set<string>>();
export const blockchainClient = {
  async grantConsent(pid:string, cat:string){ const s=consent.get(pid)||new Set<string>(); s.add(cat); consent.set(pid,s); return true; },
  async revokeConsent(pid:string, cat:string){ const s=consent.get(pid)||new Set<string>(); s.delete(cat); consent.set(pid,s); return true; },
  async checkConsent(pid:string, cat:string){ return consent.get(pid)?.has(cat)??false; }
};
