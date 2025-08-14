import type { PatientContext } from './context.js';

export type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'developer'; content: string };

export function buildMessages(ctx: PatientContext): ChatMessage[] {
  const sys: ChatMessage = {
    role: 'system',
    content: `You are a clinical documentation AI assisting clinicians in Ghana.
Responsibilities:
- Generate concise, accurate clinical summaries based on provided FHIR resources.
- Highlight concerning findings, care gaps, and recommended next steps.
- Include uncertainty notes and “Do Not Overstep” cautions.
- Always produce strict JSON matching the schema provided by the developer message.
`};

  const dev: ChatMessage = {
    role: 'developer',
    content: `Output must be strict JSON matching:
{
  "summary": string,
  "problems": string[],
  "risks": string[],
  "next_steps": string[],
  "missing_data": string[],
  "references": {
    "model": string,
    "model_version": string,
    "inputs": { "fhir_bundle_ids": string[], "lab_refs": string[], "note_refs": string[] }
  }
}
If information is absent, explicitly leave arrays empty. Never invent facts.`
  };

  const user: ChatMessage = {
    role: 'user',
    content: `Patient context\n` +
      `Demographics: ${json(ctx.demographics)}\n` +
      `Conditions: ${json(ctx.conditions)}\n` +
      `Medications: ${json(ctx.medications)}\n` +
      `Allergies: ${json(ctx.allergies)}\n` +
      `Vitals/Observations: ${json(ctx.observations)}\n` +
      `Labs: ${json(ctx.labs)}\n` +
      `Encounters: ${json(ctx.encounters)}\n` +
      `Notes: ${json(ctx.notes)}\n` +
      `Produce an evidence-grounded clinical summary using the JSON schema.`
  };

  return [sys, dev, user];
}

function json(v: any): string { try { return JSON.stringify(v ?? null).slice(0, 10000); } catch { return 'null'; } }
