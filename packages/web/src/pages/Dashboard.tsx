import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle2, FileText, Flag } from 'lucide-react';
import axios from 'axios';
import { Modal } from '../modules/ui/Modal';
import { Skeleton } from '../modules/ui/Skeleton';

const API = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3001';

type PatientRow = { id: string; name: string; age: number; sex: 'male'|'female'|'other'; conditions: string[] };

const DEMO_PATIENTS: PatientRow[] = [
  { id: 'p1', name: 'Ama Mensah', age: 34, sex: 'female', conditions: ['Malaria', 'Anemia'] },
  { id: 'p2', name: 'Kojo Owusu', age: 51, sex: 'male', conditions: ['Hypertension'] },
  { id: 'p3', name: 'Efua Sarpong', age: 42, sex: 'female', conditions: ['Diabetes Mellitus Type 2'] },
];

export function Dashboard(){
  const [token,setToken]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [selected,setSelected]=useState<PatientRow|null>(null);
  const [summary,setSummary]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{(async()=>{
    try { const {data}=await axios.post(`${API}/auth/login`,{username:'demo'}); setToken(data.token);} catch(e:any){ setError(e?.message||'Login failed'); }
    finally{ setLoading(false); }
  })()},[]);

  const rows = useMemo(()=>DEMO_PATIENTS,[]);

  const createPatient = async ()=>{
    if(!token) return;
    setBusy(true); setError('');
    try {
      const {data}=await axios.post(`${API}/fhir/Patient`,{resourceType:'Patient',name:[{text:selected?.name||'Unknown'}]}, {headers:{Authorization:`Bearer ${token}`}});
      const pid = data.id; setSummary(`FHIR Patient ${pid} created successfully.`);
    } catch(e:any){ setError(e?.message||'Failed'); } finally { setBusy(false); }
  };

  const generateSummary = async ()=>{
    if(!token || !selected) return;
    setBusy(true); setError(''); setSummary('');
    try {
      const {data}=await axios.post(`${API}/ai/summary/${selected.id}`,{}, {headers:{Authorization:`Bearer ${token}`}});
      setSummary(data.summary);
    } catch(e:any){ setError(e?.message||'Failed'); } finally { setBusy(false); }
  };

  if(loading){
    return (
      <div className="card">
        <Skeleton className="h-8 w-40"/>
        <div className="mt-4 grid gap-2">
          <Skeleton/><Skeleton/><Skeleton/>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Patient Dashboard</h2>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Patient</th>
                <th className="py-2">Age</th>
                <th className="py-2">Sex</th>
                <th className="py-2">Conditions</th>
                <th className="py-2"/>
              </tr>
            </thead>
            <tbody>
              {rows.map(p=> (
                <tr key={p.id} className={`border-t border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40 ${selected?.id===p.id?'bg-slate-50 dark:bg-slate-700/50':''}`}>
                  <td className="py-2">
                    <Link to={`/patient/${p.id}`} onClick={()=>setSelected(p)} className="inline-flex items-center gap-2">
                      <UserCircle2 className="text-slate-400"/> {p.name}
                    </Link>
                  </td>
                  <td className="py-2">{p.age}</td>
                  <td className="py-2 capitalize">{p.sex}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {p.conditions.map(c=> <span key={c} className="badge">{c}</span>)}
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button className="btn btn-primary" onClick={()=>{setSelected(p); generateSummary();}} disabled={busy}><FileText size={16}/> AI Summary</button>
                      <button className="btn" onClick={()=>setSelected(p)}><Flag size={16}/> Flag</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!summary} onClose={()=>setSummary('')}>
        <h3 className="mb-2 text-lg font-semibold">AI Summary</h3>
        <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">{summary}</pre>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={()=>setSummary('')}>Close</button>
          <button className="btn btn-primary" onClick={createPatient}>Save as DocumentReference</button>
        </div>
      </Modal>
    </div>
  );
}
