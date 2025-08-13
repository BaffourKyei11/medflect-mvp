// groq-tools.js
// Register Medflect system generation tasks as Groq tools for rapid regeneration
const { registerTool } = require('groq-sdk');

registerTool({
  name: 'scaffold-backend',
  description: 'Scaffold Express FHIR backend with Firebase integration',
  entry: './src',
});

registerTool({
  name: 'fhir-endpoints',
  description: 'Create FHIR endpoint stubs for Patient/Observation',
  entry: './src/routes/fhir.js',
});


registerTool({
  name: 'jwt-auth-middleware',
  description: 'Implement JWT authentication and role-based middleware',
  entry: './src/middleware/auth.js',
});

registerTool({
  name: 'fhir-validation-middleware',
  description: 'Add Joi-based FHIR validation middleware',
  entry: './src/middleware/validate.js',
});

registerTool({
  name: 'patientlist-ui',
  description: 'Generate PatientList UI for web and mobile',
  entry: ['./packages/web/components/PatientList.jsx', './packages/mobile/components/PatientList.tsx'],
});

registerTool({
  name: 'patientdetail-ui',
  description: 'Generate PatientDetail and vitals form for web/mobile',
  entry: ['./packages/web/components/PatientDetail.jsx', './packages/mobile/components/PatientDetail.tsx'],
});

registerTool({
  name: 'login-auth-ui',
  description: 'Implement login flow and auth context for web/mobile',
  entry: ['./packages/web/components/Login.jsx', './packages/web/components/useAuth.js', './packages/mobile/components/Login.tsx', './packages/mobile/components/useAuth.ts'],
});

registerTool({
  name: 'fhir-service',
  description: 'Create Firebase Firestore FHIR service module',
  entry: './services/fhirService.js',
});

registerTool({
  name: 'ui-wiring',
  description: 'Wire PatientList/PatientDetail to fhirService',
  entry: [
    './packages/web/components/PatientList.jsx',
    './packages/web/components/PatientDetail.jsx',
    './packages/mobile/components/PatientList.tsx',
    './packages/mobile/components/PatientDetail.tsx',
  ],
});

registerTool({
  name: 'docs-ci',
  description: 'Docs and CI: setup.md and GitHub Actions',
  entry: ['./docs/setup.md', './.github/workflows/ci.yml'],
});

// --- Offline Sync & AI Agent Modules ---
// Removed Couchbase/PouchDB-specific client sync module
registerTool({
  name: 'auto-sync-hook',
  description: 'Auto background sync React hook',
  entry: './packages/useAutoSync.js',
});
// Removed PouchDB-specific offline sync and conflict tooling
registerTool({
  name: 'ai-generate-summary',
  description: 'AI discharge summary generator',
  entry: './packages/ai/generate_summary.js',
});
registerTool({
  name: 'ai-context-suggestions',
  description: 'AI clinical suggestions tool',
  entry: './packages/ai/context_suggestions.js',
});
registerTool({
  name: 'ai-add-provenance',
  description: 'AI provenance metadata wrapper',
  entry: './packages/ai/add_provenance.js',
});
registerTool({
  name: 'ai-robust-llm-call',
  description: 'Resilient LLM call handler',
  entry: './packages/ai/robust_llm_call.js',
});
registerTool({
  name: 'ai-save-to-fhir',
  description: 'Save to FHIR DocumentReference tool',
  entry: './packages/ai/save_to_fhir.js',
});
