import axios from 'axios';
export async function generateSummary(patientId) {
    if (process.env.MOCK_AI === 'true')
        return { summary: `Discharge summary for ${patientId}.`, provenance: { model: 'mock-llm', version: 'v1', timestamp: new Date().toISOString(), dataRefs: [] } };
    const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.GROQ_BASE_URL || process.env.OPENAI_BASE_URL;
    if (!apiKey || !baseURL)
        throw new Error('AI not configured');
    const r = await axios.post(`${baseURL}/v1/chat/completions`, { model: process.env.GROQ_MODEL || 'llama3-8b-8192', messages: [{ role: 'user', content: `Generate discharge summary for ${patientId}` }] }, { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 20000 });
    const text = r.data?.choices?.[0]?.message?.content ?? 'No content';
    return { summary: text, provenance: { model: process.env.GROQ_MODEL, version: 'api', timestamp: new Date().toISOString(), dataRefs: [] } };
}
