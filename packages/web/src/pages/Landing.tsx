import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ShieldCheck, Cpu, Network, DatabaseZap, MessageSquare, Activity, FileText, Zap } from 'lucide-react';
import { getDashboard } from '../services/dashboard.ts';
import { track } from '../services/analytics.ts';

export default function Landing() {
  const [kpis, setKpis] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    track('landing_view');
    (async () => {
      try {
        const data = await getDashboard();
        if (data?.kpis) setKpis(data.kpis);
      } catch (e) {
        // ignore; show defaults
      }
    })();
  }, []);
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-900/30" />
        <div className="relative container mx-auto max-w-6xl px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs text-sky-700 shadow-sm dark:border-sky-800/50 dark:bg-slate-800 dark:text-sky-300">
                <Zap className="h-3.5 w-3.5" /> Groq-accelerated clinical AI
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Medflect AI — Smart, Explainable Care for Ghana and Africa
              </h1>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Transform hospitals into smart care hubs. On‑prem AI agents summarize records, assist clinical
                reasoning, and message patients — governed by consent on blockchain and interoperable via HL7 FHIR.
                Works offline, syncs when connected.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/dashboard" onClick={() => track('cta_click', { id: 'explore_dashboard' })} className="btn btn-primary">Explore Dashboard</Link>
                <Link to="/login" onClick={() => track('cta_click', { id: 'sign_in' })} className="btn border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                  Sign in
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2"><Brain className="h-4 w-4" /> On‑prem LLM agents</div>
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Consent + audit on‑chain</div>
                <div className="flex items-center gap-2"><Network className="h-4 w-4" /> FHIR + MCP integrated</div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <img src="/hero-medflect.png" alt="Medflect clinical dashboard" className="w-full rounded-lg" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
                <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                  {(kpis.length ? kpis : [
                    { label: 'Avg. wait time', value: -12 },
                    { label: 'Docs saved/day', value: 40 },
                    { label: 'Readmit risk flags', value: 3 }
                  ]).slice(0,3).map((k, i) => (
                    <div key={i} className="card">
                      <div className="font-semibold">{k.label}</div>
                      <div className={i===2 ? 'text-rose-600' : 'text-sky-600 dark:text-sky-400'}>
                        {typeof k.value === 'number' ? (i===0 ? `${k.value}%` : `${k.value}`) : String(k.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">Platform pillars</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-300">A unified stack built for real‑world African care settings.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Cpu className="h-5 w-5" />} title="Groq‑powered inference" desc="On‑prem LPU servers return answers in milliseconds, keeping PHI local and secure." />
          <Feature icon={<Network className="h-5 w-5" />} title="FHIR + MCP" desc="Standards‑based interoperability and live data grounding for every AI output." />
          <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Consent & audit" desc="Smart‑contract tokens enforce purpose‑based access with immutable on‑chain logs." />
          <Feature icon={<DatabaseZap className="h-5 w-5" />} title="Offline‑first sync" desc="Local-first storage with encrypted, resilient background sync for low connectivity." />
          <Feature icon={<FileText className="h-5 w-5" />} title="Clinical summaries" desc="Auto discharge notes, progress digests and handoff briefs editable by clinicians." />
          <Feature icon={<Activity className="h-5 w-5" />} title="No‑code workflows" desc="Drag‑and‑drop rules that trigger tasks, alerts and follow ups from lab signals." />
        </div>
      </section>

      {/* Technology */}
      <section className="bg-slate-50 dark:bg-slate-900/40">
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold">Technology architecture</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ul className="space-y-3 text-slate-600 dark:text-slate-300">
              <li>• On‑prem Groq LPU nodes for ultra‑low‑latency LLMs</li>
              <li>• HL7 FHIR resources for patients, labs, meds, encounters</li>
              <li>• Anthropic Model Context Protocol as secure data glue</li>
              <li>• Permissioned Ethereum for consent and audit trails</li>
              <li>• PWA: installable, offline‑first, responsive</li>
            </ul>
            <div className="card">
              <h3 className="font-semibold">Integration flow</h3>
              <ol className="mt-2 list-decimal pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li>Load patient context (FHIR)</li>
                <li>Tap “Generate Summary” (LLM + MCP grounding)</li>
                <li>Clinician edits and approves</li>
                <li>Local save and background sync</li>
                <li>Consent and actions logged on‑chain</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold">Roadmap</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <RoadmapCard stage="MVP & Pilot" detail="Deploy at 37 Military Hospital; measure workflow and quality impact." />
          <RoadmapCard stage="Nationwide" detail="Scale to major Ghana hospitals; align with Ministry of Health strategy." />
          <RoadmapCard stage="Regional" detail="Expand to Nigeria, Kenya, South Africa; add localization." />
          <RoadmapCard stage="Scale" detail="Multi‑tenant cloud, certifications, continuous model improvement." />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky-600">
        <div className="container mx-auto max-w-6xl px-4 py-12 text-white">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-semibold">Ready to pilot Medflect?</h3>
              <p className="opacity-90">Bring explainable, standards‑based AI to your wards in weeks.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/login" onClick={() => track('cta_click', { id: 'request_access' })} className="btn bg-white text-sky-700 hover:bg-slate-100">Request access</Link>
              <Link to="/dashboard" onClick={() => track('cta_click', { id: 'see_demo' })} className="btn border border-white text-white hover:bg-sky-700">See demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Patient messaging banner */}
      <section className="container mx-auto max-w-6xl px-4 py-12">
        <div className="card flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-sky-600" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Patients can receive visit summaries, reminders and education via mobile/SMS — with consent enforced by smart contracts.
          </p>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}

function RoadmapCard({ stage, detail }: { stage: string; detail: string }) {
  return (
    <div className="card">
      <div className="text-slate-900 dark:text-white font-semibold">{stage}</div>
      <div className="mt-1 text-slate-600 dark:text-slate-300">{detail}</div>
    </div>
  );
}
