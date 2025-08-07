// Groq Prompt: Save to FHIR DocumentReference
// Tool: save_to_fhir
// Description: Saves content + provenance to FHIR DocumentReference
const fetch = require('node-fetch');
const base64 = input => Buffer.from(input).toString('base64');
require('dotenv').config();

const FHIR_URL = process.env.FHIR_BACKEND_URL || 'http://localhost:3000/fhir';

async function saveToFhir({ content, provenance }) {
  const docRef = {
    resourceType: 'DocumentReference',
    type: { text: 'DischargeSummary' },
    content: [{ attachment: { contentType: 'application/json', data: base64(JSON.stringify(content)) } }],
    extension: [{ url: 'provenance', valueString: JSON.stringify(provenance) }],
    status: 'current',
    date: new Date().toISOString()
  };
  const res = await fetch(`${FHIR_URL}/DocumentReference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/fhir+json' },
    body: JSON.stringify(docRef)
  });
  return await res.json();
}

const groq = require('groq-sdk');
groq.createTool({
  name: 'save_to_fhir',
  description: 'Save content and provenance to FHIR DocumentReference',
  entry: __filename
});

module.exports = { saveToFhir };
