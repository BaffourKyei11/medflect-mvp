import React, { useMemo, useState } from 'react';
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { summarizeViaApiChat } from '../../services/ai.ts';
import { track } from '../../services/analytics.ts';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const systemPrompt: ChatMessage = {
  role: 'system',
  content:
    'You are Medflect AI, an explainable clinical assistant for Ghanaian hospitals. Be concise, cite key vitals/labs if provided, avoid PHI exposure, and remind that clinicians must verify. Do not provide diagnosis without adequate context. '
};

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([systemPrompt, {
    role: 'assistant',
    content: 'Hi! I am Medflect AI. Ask about clinical summaries, consent/audit, FHIR integration, or offline sync.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewed, setReviewed] = useState<Record<number, boolean>>({});

  const visibleMessages = useMemo(() => messages.filter(m => m.role !== 'system'), [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const next = [...messages, { role: 'user' as const, content: input.trim() }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const apiResp = await summarizeViaApiChat({
        messages: next.map(m => ({ role: m.role, content: m.content }))
      });
      const content = apiResp?.summary || 'Sorry, I could not generate a response.';
      setMessages(cur => [...cur, { role: 'assistant', content }]);
      track('chat_send', { ok: true, via: 'api' });
    } catch (apiErr: any) {
      const msg = apiErr?.response?.data?.error || apiErr?.message || 'Network or AI service error. Please try again.';
      setMessages(cur => [...cur, { role: 'assistant', content: String(msg) }]);
      track('chat_send', { ok: false, via: 'api' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Floating action button */}
      <button
        aria-label={open ? 'Close Medflect chat' : 'Open Medflect chat'}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-sky-600 p-4 text-white shadow-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2"
        onClick={() => { setOpen(v => { const nv = !v; if (nv) track('chat_open'); return nv; }); }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[92vw] max-w-sm rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 p-3 dark:border-slate-700">
            <div className="font-semibold text-slate-800 dark:text-slate-100">Medflect Assistant</div>
            <button className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Not for diagnosis. Provide adequate context. Clinicians must review before use in care.
          </div>
          <div className="max-h-80 overflow-y-auto p-3 space-y-3">
            {visibleMessages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100'}`}>
                  {m.content}
                </div>
                {m.role === 'assistant' && (
                  <div className="mt-1">
                    <button
                      onClick={() => { setReviewed(r => ({ ...r, [idx]: !r[idx] })); track('chat_reviewed', { idx, reviewed: !reviewed[idx] }); }}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${reviewed[idx] ? 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/30' : 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700'}`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> {reviewed[idx] ? 'Reviewed' : 'Mark reviewed'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about Medflect..."
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-800"
            />
            <button onClick={send} className="btn btn-primary disabled:opacity-60" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
