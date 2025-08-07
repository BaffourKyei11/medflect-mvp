import axios from 'axios';
import { api } from './api.ts';
import { getToken } from './session.ts';

const groqBase = (import.meta as any).env.VITE_GROQ_BASE || 'http://91.108.112.45:4000';

export const summarizeViaApi = async (payload: { patientId: string; context: any }) => {
  const { data } = await api.post('/ai/summarize', payload);
  return data as { summary: string; citations?: any[] };
};

export const summarizeViaLiteLLM = async (payload: { messages: any[]; model?: string }) => {
  const token = getToken();
  const { data } = await axios.post(`${groqBase}/chat/completions`, payload, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return data;
};
