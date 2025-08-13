// generate.js
// Entrypoint for regenerating Medflect system tasks using groq-tools
const { runTool } = require('groq-sdk');

async function regenerateAll() {
  await runTool('scaffold-backend');
  await runTool('fhir-endpoints');
  await runTool('jwt-auth-middleware');
  await runTool('fhir-validation-middleware');
  await runTool('patientlist-ui');
  await runTool('patientdetail-ui');
  await runTool('login-auth-ui');
  await runTool('fhir-service');
  await runTool('ui-wiring');
  await runTool('docs-ci');
  await runTool('auto-sync-hook');
  await runTool('ai-generate-summary');
  await runTool('ai-context-suggestions');
  await runTool('ai-add-provenance');
  await runTool('ai-robust-llm-call');
  await runTool('ai-save-to-fhir');
}

// Run all tasks if called directly
if (require.main === module) {
  regenerateAll().then(() => {
    console.log('All Medflect tasks regenerated.');
  });
}
