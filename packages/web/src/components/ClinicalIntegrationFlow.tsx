import React, { useMemo, useState } from 'react';
import { Input } from '../components/forms/Input.tsx';
import { Button } from '../components/forms/Button.tsx';
import { LoadingSkeleton } from '../components/LoadingSkeleton.tsx';
import { getFHIR, saveNote } from '../services/fhir.ts';
import { summarizeForPatient, getAiStatus } from '../services/ai.ts';
import { upsertConsent } from '../services/consent.ts';
import { track } from '../services/analytics.ts';

export default function ClinicalIntegrationFlow(){
  const [patientId, setPatientId] = useState('example');
  const [loadingCtx, setLoadingCtx] = useState(false);
  const [ctxError, setCtxError] = useState<string|undefined>();
  const [context, setContext] = useState<any | null>(null);

  const [aiInfo, setAiInfo] = useState<{ mock: boolean; model?: string|null } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  const [genError, setGenError] = useState<string|undefined>();
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string|undefined>();
  const [maskPHI, setMaskPHI] = useState(true);

  React.useEffect(()=>{ (async()=>{ try{ setAiInfo(await getAiStatus()); } catch{} })(); },[]);

  // Autosave per patientId (localStorage)
  React.useEffect(()=>{
    try {
      const draft = localStorage.getItem(`draft:${patientId}`);
      if (draft && !summary) setSummary(draft);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[patientId]);

  React.useEffect(()=>{
    const id = setTimeout(()=>{
      try { if (patientId) localStorage.setItem(`draft:${patientId}`, summary || ''); } catch{}
    }, 400);
    return ()=>clearTimeout(id);
  },[summary, patientId]);

  const onLoadContext = async () => {
    setLoadingCtx(true); setCtxError(undefined); setContext(null);
    try {
      const patient = await getFHIR(`/Patient/${patientId}`);
      setContext({ patient });
      track('fhir_loaded', { patientId });
    } catch (e: any) {
      setCtxError(e?.message || 'Failed to load patient context');
    } finally {
      setLoadingCtx(false);
    }
  };

  const onGenerateSummary = async () => {
    setGenerating(true); setGenError(undefined);
    try {
      if (!patientId) throw new Error('Enter a patient ID first');
      const res = await summarizeForPatient(patientId);
      const text = (res as any)?.summary || '';
      setSummary(text);
      track('summary_generated', { patientId, model: aiInfo?.model || null });
    } catch (e: any) {
      setGenError(e?.message || 'Failed to generate summary');
    } finally {
      setGenerating(false);
    }
  };

  const onApproveAndSave = async () => {
    setSaving(true); setSaveMsg(undefined);
    try {
      const r1 = await saveNote(patientId, summary);
      const r2 = await upsertConsent({ patientId, action: 'summary_approved', ts: new Date().toISOString() });
      const queued = (r1 as any)?.queued || (r2 as any)?.queued;
      setSaveMsg(queued ? 'Saved (queued for sync)' : 'Saved successfully');
      track('summary_approved', { patientId, queued: !!queued });
    } catch (e: any) {
      setSaveMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const disabled = useMemo(()=>!patientId || saving || generating, [patientId, saving, generating]);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Clinical Integration Flow</h2>
      <p className="mt-1 text-sm text-slate-500">FHIR context → LLM summary → clinician approval → background sync → consent/audit. {aiInfo && (<span className="ml-1">AI: {aiInfo.mock? 'Mock':'Live'}</span>)}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm">Patient ID
            <Input className="mt-1 w-full" value={patientId} onChange={(e)=>setPatientId(e.target.value)} placeholder="e.g., 12345" />
          </label>
          <Button onClick={onLoadContext} disabled={!patientId || loadingCtx} variant="ghost">
            {loadingCtx? 'Loading context...' : 'Load patient context (FHIR)'}
          </Button>
          {ctxError && <div className="text-sm text-red-600" role="alert" aria-live="assertive">{ctxError}</div>}
          {loadingCtx && <LoadingSkeleton lines={3} />}
          {context && (
            <div className="rounded-md border border-slate-200 p-3 text-xs dark:border-slate-700">
              <div className="mb-1 font-medium">Context preview</div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap">{JSON.stringify(context, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={onGenerateSummary} disabled={disabled || !context} variant="primary">
            {generating? 'Generating…' : 'Generate Summary (LLM)'}
          </Button>
          {genError && <div className="text-sm text-red-600" role="alert" aria-live="assertive">{genError}</div>}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Summary (editable)</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={()=>setMaskPHI(v=>!v)} aria-pressed={maskPHI} aria-label={maskPHI? 'Unmask PHI':'Mask PHI'}>
                {maskPHI? 'Unmask PHI' : 'Mask PHI'}
              </Button>
              <Button variant="ghost" onClick={()=>setSummary('')}>Clear</Button>
            </div>
          </div>
          <div className={`relative mt-1`}>
            {maskPHI && (
              <div className="pointer-events-none absolute inset-0 z-10 rounded-md bg-slate-50/40 backdrop-blur-sm dark:bg-slate-800/30" aria-hidden="true"></div>
            )}
            <textarea
              className="w-full min-h-48 resize-vertical rounded-md border border-slate-300 p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700"
              aria-label="AI generated clinical summary"
              value={summary}
              onChange={(e)=>setSummary(e.target.value)}
              placeholder="AI-generated summary will appear here"
            />
            {maskPHI && (
              <div className="pointer-events-none absolute bottom-2 right-2 z-20 rounded bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white">Masked</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onApproveAndSave} disabled={disabled || !summary} variant="primary">
              {saving? 'Saving…' : 'Approve & Save'}
            </Button>
            {saveMsg && <span className="text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">{saveMsg}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
