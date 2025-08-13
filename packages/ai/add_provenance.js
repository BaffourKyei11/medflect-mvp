// Groq Prompt: Provenance Metadata Wrapper
// Tool: add_provenance
// Description: Wraps AI output with provenance metadata
const groq = require('groq-sdk');

function addProvenance(content, model, fhirRefs, promptId) {
  return {
    content,
    provenance: {
      model,
      timestamp: new Date().toISOString(),
      fhirRefs,
      promptId
    }
  };
}

groq.createTool({
  name: 'add_provenance',
  description: 'Wraps AI output with provenance metadata',
  entry: __filename
});

module.exports = { addProvenance };
