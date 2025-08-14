import axios from 'axios';
let cbState = 'CLOSED';
let failureCount = 0;
let lastOpenedAt = 0;
const FAILURE_THRESHOLD = Number(process.env.CB_FAILURE_THRESHOLD || 5);
const RESET_TIMEOUT_MS = Number(process.env.CB_RESET_MS || 30000);
const AI_TIMEOUT_MS = Number(process.env.AI_UPSTREAM_TIMEOUT_MS || 20000);
function canAttempt() {
    if (cbState === 'OPEN') {
        const sinceOpen = Date.now() - lastOpenedAt;
        if (sinceOpen >= RESET_TIMEOUT_MS) {
            cbState = 'HALF_OPEN';
            return true;
        }
        return false;
    }
    return true;
}
function recordSuccess() {
    failureCount = 0;
    cbState = 'CLOSED';
}
function recordFailure() {
    failureCount += 1;
    if (failureCount >= FAILURE_THRESHOLD) {
        cbState = 'OPEN';
        lastOpenedAt = Date.now();
        console.warn('[CB] Opened after failures=', failureCount);
    }
    else if (cbState === 'HALF_OPEN') {
        cbState = 'OPEN';
        lastOpenedAt = Date.now();
        console.warn('[CB] Half-open trial failed. Re-opening.');
    }
}
export async function generateSummary(patientId) {
    if (process.env.MOCK_AI === 'true')
        return { summary: `Discharge summary for ${patientId}.`, provenance: { model: 'mock-llm', version: 'v1', timestamp: new Date().toISOString(), dataRefs: [] } };
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.GROQ_BASE_URL || process.env.OPENAI_BASE_URL || 'http://91.108.112.45:4000';
    if (!apiKey || !baseURL)
        throw new Error('AI not configured');
    if (!canAttempt())
        throw new Error('AI service temporarily unavailable (circuit open)');
    try {
        const r = await axios.post(`${baseURL}/v1/chat/completions`, { model: process.env.GROQ_MODEL || 'groq/deepseek-r1-distill-llama-70b', messages: [{ role: 'user', content: `Generate discharge summary for ${patientId}` }] }, { headers: { Authorization: `Bearer ${apiKey}` }, timeout: AI_TIMEOUT_MS });
        recordSuccess();
        const text = r.data?.choices?.[0]?.message?.content ?? 'No content';
        return { summary: text, provenance: { model: process.env.GROQ_MODEL, version: 'api', timestamp: new Date().toISOString(), dataRefs: [] } };
    }
    catch (err) {
        recordFailure();
        throw err;
    }
}
export async function generateChatCompletion(payload) {
    if (process.env.MOCK_AI === 'true') {
        const combined = payload.messages.map(m => `${m.role}: ${m.content}`).join('\n');
        return { summary: `Mock response. Input:\n${combined}`, provenance: { model: 'mock-llm', version: 'v1', timestamp: new Date().toISOString(), dataRefs: [] } };
    }
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.GROQ_BASE_URL || process.env.OPENAI_BASE_URL || 'http://91.108.112.45:4000';
    if (!apiKey || !baseURL) {
        console.warn('AI config missing:', { hasKey: !!apiKey, hasBase: !!baseURL });
        throw new Error('AI not configured');
    }
    // Ignore client-provided model in live mode to avoid unauthorized model errors
    const model = process.env.GROQ_MODEL || 'groq/deepseek-r1-distill-llama-70b';
    try {
        const url = `${baseURL}/v1/chat/completions`;
        console.log('AI upstream request ->', url, 'model:', model);
        if (!canAttempt())
            throw new Error('AI service temporarily unavailable (circuit open)');
        const r = await axios.post(url, { model, messages: payload.messages }, { headers: { Authorization: `Bearer ${apiKey}`, 'x-api-key': apiKey, 'Content-Type': 'application/json' }, timeout: AI_TIMEOUT_MS });
        recordSuccess();
        const text = r.data?.choices?.[0]?.message?.content ?? 'No content';
        return { summary: text, provenance: { model, version: 'api', timestamp: new Date().toISOString(), dataRefs: [] } };
    }
    catch (err) {
        recordFailure();
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.warn('AI upstream error', { status, data: typeof data === 'string' ? data.slice(0, 200) : data });
        throw err;
    }
}
