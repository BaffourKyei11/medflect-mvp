import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { summarizeViaApi, summarizeViaLiteLLM } from '../services/ai.ts';
import { saveNote } from '../services/fhir.ts';

export default function AISummary(){
  const { id: patientId = '' } = useParams();
  const [text,setText]=useState('');
  const [busy,setBusy]=useState(false);
  const [banner,setBanner]=useState<string | null>(null);
  const [error,setError]=useState('');
  const [saveMsg,setSaveMsg]=useState('');

  const run = async ()=>{
    setBusy(true); setError(''); setBanner(null); setText('');
    try{
      const res = await summarizeViaApi({ patientId, context: { hints: [] } });
      setText(res.summary);
    }catch(err:any){
      // fallback to LiteLLM
      setBanner('Using fallback AI endpoint');
      try{
        const payload = { model:'gpt-4o-mini', messages:[{ role:'system', content:'You are a clinical summarizer.' }, { role:'user', content:`Summarize patient ${patientId}.` }]};
        const data = await summarizeViaLiteLLM(payload);
        const summary = data?.choices?.[0]?.message?.content || JSON.stringify(data);
        setText(summary);
      }catch(e:any){ setError(e?.message||'Fallback failed'); }
    } finally { setBusy(false); }
  };

  const save = async ()=>{
    if(!text) return;
    try {
      setSaveMsg('');
      const res: any = await saveNote(patientId, text);
      const queued = res && (res.queued === true);
      setSaveMsg(queued ? 'Saved (queued)' : 'Saved');
    } catch(e:any){ setSaveMsg(e?.message||'Save failed'); }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">AI Clinical Summary</h2>
      {banner && <div className="mt-2 rounded bg-sky-50 p-2 text-sm text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">{banner}</div>}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary" onClick={run} disabled={busy}>{busy?'Generating...':'Generate'}</button>
        <button className="btn" onClick={save} disabled={!text}>Save to Notes</button>
      </div>
      {saveMsg && <div className="mt-2 text-sm text-sky-600">{saveMsg}</div>}
      <textarea className="mt-3 h-64 w-full rounded border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={text} onChange={e=>setText(e.target.value)} placeholder="Summary will appear here..."/>
    </div>
  );
}
