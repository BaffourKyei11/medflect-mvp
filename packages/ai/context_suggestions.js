// Groq Prompt: AI Clinical Suggestions
// Tool: context_suggestions
// Description: Suggests differential diagnoses and drug alerts from summary and MedicationStatement
const groq = require('groq-sdk');
const { robust_llm_call } = require('./robust_llm_call');

async function contextSuggestions(summary, medicationStatement) {
  const prompt = `Given a clinical summary JSON and FHIR MedicationStatement, return:
- 3 differential diagnoses (with FHIR path refs)
- 2 drug interaction alerts (with FHIR path refs)`;
  const input = { summary, medicationStatement };
  return await robust_llm_call({ prompt, input });
}

groq.createTool({
  name: 'context_suggestions',
  description: 'Suggest differential diagnoses and drug alerts from summary and MedicationStatement',
  entry: __filename
});

module.exports = { contextSuggestions };
