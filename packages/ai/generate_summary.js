// Groq Prompt: AI Discharge Summary Generator
// Tool: generate_summary
// Description: Generates structured discharge summary from FHIR Patient, Observation, Encounter
const groq = require('groq-sdk');
const { robust_llm_call } = require('./robust_llm_call');

async function generateSummary(patient, observation, encounter) {
  const prompt = `You are a clinical discharge summary generator. Given the following FHIR resources, output a JSON with:
- Chief Complaint (FHIR: Encounter.reasonCode)
- History (FHIR: Patient.extension, Encounter.period)
- Findings (FHIR: Observation.code, Observation.value[x])
- Plan (FHIR: Encounter.hospitalization, Observation.interpretation)
Annotate each field with FHIR path references. Include model, version, timestamp, references.`;
  const input = { patient, observation, encounter };
  return await robust_llm_call({ prompt, input });
}

groq.createTool({
  name: 'generate_summary',
  description: 'Generate structured discharge summary from FHIR Patient/Observation/Encounter',
  entry: __filename
});

module.exports = { generateSummary };
