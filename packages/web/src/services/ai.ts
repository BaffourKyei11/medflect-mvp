import axios from 'axios';
import { api } from './api.ts';
// Note: Do not forward app session tokens to external LLM. Use a dedicated API key instead.

const groqBase = (import.meta as any).env.VITE_GROQ_BASE || 'http://91.108.112.45:4000';
const groqKey = (import.meta as any).env.VITE_GROQ_API_KEY as string | undefined;

export const summarizeViaApi = async (payload: { patientId: string; context: any }) => {
  const { data } = await api.post('/ai/summarize', payload);
  return data as { summary: string; citations?: any[] };
};

export const summarizeViaApiChat = async (payload: { messages: Array<{ role: string; content: string }>; model?: string }) => {
  const { data } = await api.post('/ai/summarize', payload);
  return data as { summary: string; provenance?: any };
};

export const summarizeViaLiteLLM = async (payload: { messages: any[]; model?: string }) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (groqKey && groqKey.trim() !== '') headers.Authorization = `Bearer ${groqKey}`;
  const { data } = await axios.post(`${groqBase}/v1/chat/completions`, payload, { headers });
  return data;
};

export type AiStatus = { mock: boolean; model?: string | null; baseURL?: string | null };
export const getAiStatus = async (): Promise<AiStatus> => {
  try {
    const { data } = await api.get('/ai/status');
    return data as AiStatus;
  } catch (e) {
    // Gracefully degrade; treat as live unknown
    return { mock: false, model: null, baseURL: null };
  }
};
