# Medflect AI – Turning Hospital Data into Decisions

 **Executive Summary**
Context: Ghana faces a 42% health workforce shortfall; across Africa there is ~1 doctor per 5,000 people. Data silos and paper records create delays and errors.
Vision: On-site, explainable LLM agents (Groq) that summarize patient records, assist clinical reasoning, and power patient messaging—while respecting patient consent via blockchain and interoperating via HL7 FHIR.
Mission: Amplify clinicians, protect patient autonomy, and increase care quality. Start with 37 Military Hospital and scale across Ghana/Africa.

## 🏥 The Problem: Hospital Data Is Underutilized

Hospitals accumulate vast amounts of operational and clinical data, yet this data often remains largely unexplored. Teams lack:
 
- Exploratory analysis to expose patterns and inefficiencies
- Automated insights that surface trends in real time
- Predictive analytics to forecast admissions, staffing, and readmissions
- Clear decision support to reduce guesswork and improve outcomes

## 💡 The Solution: Medflect AI

Medflect AI is a scalable infrastructure platform that converts raw hospital data into intelligible, actionable insights. It enables:

- Automated analysis to highlight key trends and anomalies
- On‑demand querying through dashboards and NLP‑style prompts
- Predictive capabilities to anticipate demand and risk
- Decision support and recommendations integrated into clinical workflow

Designed for Ghana and Africa, Medflect is offline‑first, standards‑based (HL7 FHIR), and governed by consent/audit on blockchain.

## 🌟 How Medflect Solves It

- **AI‑Powered Clinical Summaries**: Groq‑accelerated LLMs generate instant, editable patient summaries
- **Automated Insights & Dashboards**: Surface bottlenecks, risks, and throughput in real time
- **Predictive Signals**: Forecast readmission risk and resource demand
- **FHIR Interoperability**: Standards‑based data models for safe integration
- **Consent & Audit**: On‑chain governance of data access and provenance
- **Offline‑First**: Local‑first UX with background sync for variable connectivity

**Product Blueprint**
Smart AI Agents: Groq-accelerated LLMs ingest FHIR resources and hospital data (via MCP) to deliver:
Clinical Summaries (discharge, progress, handoff)
Clinical Support (diagnoses hints, med checks, care plans)
Patient Messaging (appointments, triage via app/SMS)
Consent & Audit Smart Contracts: Purpose-based access control; each data access/inference is hashed and written on chain for immutable audit.
Offline-First Sync: Local-first storage on devices/edge with secure background sync when connected.
No-Code Dashboards/Workflow Builder: Drag-and-drop rules, metrics (bed occupancy, wait times, readmissions), and role-specific UIs.
User Roles: Clinicians, Admins, Patients/Caregivers—with streamlined, role-focused interfaces.

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│ React + Vite PWA (packages/web)                                        │
│  • Service Worker (vite-plugin-pwa)                                    │
│  • IndexedDB cache (idb)                                               │
│  • Tailwind UI, offline-first UX                                       │
└───────────────▲───────────────────────────────────────────────────────┘
                │ HTTP(S)
                │
┌───────────────┴──────────────────┐     ┌──────────────────────────────┐
│ Express API (packages/api)       │◄────┤ Firebase Admin (optional)    │
│  • Public AI routes:             │     │ • Auth, storage, events       │
│    - GET /api/ai/status          │     └──────────────────────────────┘
│    - POST /api/ai/summarize      │
│  • CORS/Helmet/Morgan            │
│  • GROQ_MODEL enforced via env   │
└───────────────┬──────────────────┘
                │ outbound
                │
        ┌───────▼────────┐     ┌──────────────────────────┐     ┌──────────────────────┐
        │ LiteLLM / Groq │◄────┤ FHIR + MCP Adapters      │────►│ HL7 FHIR Server(s)   │
        │ (http://91.108…)│     │ (data grounding layer)   │     │ (EHR/interop)        │
        └─────────────────┘     └──────────────────────────┘     └──────────────────────┘
                │
                │ on-chain audit/consent (optional)
                ▼
        ┌──────────────────────────────┐
        │ Ethereum (permissioned)      │
        │ • Consent tokens, audit log  │
        └──────────────────────────────┘
```

Key flows:
- Client calls API for AI functions; API enforces allowed `GROQ_MODEL` and forwards to LiteLLM/Groq.
- PWA provides offline UX via Service Worker and IndexedDB; API calls resume when connectivity returns.
- FHIR + MCP adapters ground AI outputs in clinical data (patients, labs, meds, encounters).
- Optional blockchain layer records consent and audit events.

**Technology Architecture**
Groq-Powered Inference: On-prem LPU servers for ultra-low-latency LLM inference. Keeps PHI local and fast.
FHIR-First Data: All clinical entities modeled as HL7 FHIR resources; RESTful APIs for interoperability.
Model Context Protocol (MCP): Securely connects LLM prompts to live hospital data sources and enables traceable writes.
Blockchain Layer: Permissioned Ethereum network; smart contracts encode consent and audit. Only hashes of sensitive actions are on-chain.
Offline-First Sync: Local DB (e.g., IndexedDB/SQLite) as primary; background, encrypted bi-directional sync; conflict resolution aligned to FHIR versioning.
Integration Flow: Clinician triggers “Generate Summary” → MCP fetches latest FHIR context → Groq LLM returns draft → Clinician edits → Saved locally → Sync to cloud → Audit hash written on-chain.


## 🧱 Scalable by Design

- **Stateless API tier**: All routes under `/api/*` are stateless, enabling horizontal scaling behind a load balancer.
- **Async AI workloads**: Long-running AI tasks can be queued (e.g., BullMQ/Redis) to apply backpressure, retries, and DLQs.
- **Resilient upstreams**: Circuit breakers, timeouts, and exponential backoff for LiteLLM/Groq and FHIR sources.
- **Edge-first delivery**: Static web is CDN-cacheable with content hashing; API responses support ETags and sensible TTLs.
- **Observability**: OpenTelemetry traces/metrics/logs across web→API→AI providers; SLOs on latency/error budgets.
- **Multi-tenant ready**: Clear boundaries for tenant isolation and data partitioning (facility/region) in the data layer.
- **Offline-first**: PWA reduces server load and improves resilience under variable connectivity.
- **Security & governance at scale**: Secrets management, PHI-safe logging, consent/audit event stream with optional on-chain anchoring.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Groq API key
- Ethereum wallet (for blockchain features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medflect-mvp
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development**
   - API (Express, port 3001)
     ```bash
     # In a PowerShell terminal
     $env:DISABLE_REDIS='true'
     $env:DISABLE_BLOCKCHAIN='true'
     $env:PORT='3001'
     $env:CORS_ORIGIN='*'
     $env:JWT_SECRET='dev-secret'
     $env:GROQ_BASE_URL='http://91.108.112.45:4000'
     npm run --prefix packages/api dev
     # Status: http://localhost:3001/api/ai/status
     # Health: http://localhost:3001/health
     ```
   - Web (Vite, port 5173)
     ```bash
     npm run --prefix packages/web dev
     # App: http://localhost:5173
     # Optionally set VITE_API_BASE=http://localhost:3001
     ```

### Blockchain Helpers

- Print env exports from deployed artifacts (PowerShell/Bash):
  ```bash
  npm run --prefix packages/api chain:env
  ```
- Print recent AccessLog events (defaults: last 2000 blocks, local RPC):
  ```bash
  npm run --prefix packages/api chain:logs
  ```

## 📽️ Demo

See `Demo/README.md` for step-by-step demo instructions and expected outcomes.

- Demo guide: `Demo/README.md`
- Screenshots folder: `Demo/screenshots/` (place images like `01-landing.png`, `02-theme-toggle.png`)

## 🔗 Live Deployment

- Frontend (Vercel): https://medflect-bdxaprni9-atenkas-projects.vercel.app
- Backend (API): Deploy via Render using `render.yaml` (instructions below), then set `VITE_API_BASE` on Vercel to the Render URL.

## 📁 Project Structure

```
medflect-mvp/
├── packages/web/            # Vite React PWA (frontend)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       └── utils/
├── packages/api/            # Express API (backend)
│   └── src/
│       ├── routes/
│       ├── middleware/
│       └── services/
├── blockchain/              # Ethers + contracts (if used)
└── packages/web/public/     # Static assets and PWA files
```

## 🔧 Configuration

### Environment Variables

```env
# API
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
SERVE_WEB_DIST=true

# Web
VITE_API_BASE=http://localhost:3001
VITE_GROQ_BASE=http://91.108.112.45:4000

# Groq / LiteLLM
GROQ_API_KEY=your_groq_api_key
GROQ_BASE_URL=http://91.108.112.45:4000
GROQ_MODEL=groq/deepseek-r1-distill-llama-70b

# Optional (Blockchain)
# EVM_RPC_URL=http://127.0.0.1:8545
# EVM_PRIVATE_KEY=0x...
# ACCESS_LOG_ADDRESS=0x...
# CONSENT_TOKEN_ADDRESS=0x...
# BLOCKCHAIN_SALT=hex-32-bytes
# DISABLE_BLOCKCHAIN=true
# JWT_SECRET=...
# FHIR_BASE_URL=...
```

### Groq model configuration

This project is configured to use the following Groq model via LiteLLM-compatible API:

```json
{
  "id": "groq/deepseek-r1-distill-llama-70b",
  "object": "model",
  "created": 1677610602,
  "owned_by": "openai"
}
```

- API status exposes this under `GET /api/ai/status` as `modelDetails` along with `model` and `baseURL`.
- Runtime selection is controlled with env vars: `GROQ_BASE_URL`, `GROQ_API_KEY`, `GROQ_MODEL`.

## 🏥 User Roles (User Stories)

### 👨‍⚕️ Doctors
- Generate and edit clinical summaries at the bedside
- View flagged risks and suggested orders grounded in FHIR
- Receive handoff briefs auto‑compiled from latest notes

### 👩‍⚕️ Nurses
- Triage queues with AI summaries of chief complaints
- Task prompts for vitals, meds, and discharge steps
- Works offline; syncs when connected

### 👤 Patients
- Receive visit summaries/reminders via mobile/SMS
- Grant or revoke consent for data sharing
- Access contextual education materials

### 🏢 Administrators
- Monitor wait times, throughput, readmit risk
- Audit access on‑chain; enforce purpose‑based consent
- Track ROI and quality indicators in dashboards

## 🔒 Security & Privacy

- **Blockchain Audit Trails**: Immutable logs of all data access
- **Patient Consent Tokens**: Granular permission control
- **End-to-End Encryption**: All data encrypted in transit and at rest
- **HIPAA/GDPR Compliance**: Built-in privacy protection
- **Offline Security**: Local data protection when offline

## 🌍 Offline-First Design

Medflect AI is designed to work seamlessly in Ghana's variable connectivity environments:

- **Local Cache**: Firebase Web SDK enables IndexedDB-backed persistence
- **Background Sync**: Automatic synchronization when connectivity returns
- **Conflict Handling**: Firestore last-write-wins; domain rules can be enforced server-side
- **Progressive Enhancement**: Core features work offline

## 🤖 AI Capabilities

### Clinical Summaries
- Automatic discharge summaries
- Progress note digests
- Handoff reports
- Medication reconciliation

### Clinical Support
- Diagnosis suggestions
- Medication interactions
- Care plan recommendations
- Risk assessment

### Patient Communication
- Automated appointment reminders
- Health education materials
- Symptom triage
- Follow-up scheduling

## 📊 Analytics & Reporting

- **Real-time Dashboards**: Hospital performance metrics
- **Patient Outcomes**: Clinical quality indicators
- **Operational Efficiency**: Staff productivity tracking
- **Financial Impact**: ROI and cost savings analysis

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker-compose up -d
```

## ☁️ Deployment

### Frontend (Vercel: static SPA)
- Location: `packages/web`
- Config: `packages/web/vercel.json` (static build with SPA routes)
- Command:
  ```bash
  npx vercel deploy --prod --cwd ./packages/web --scope atenkas-projects --yes -f
  ```

### Backend (Render: Docker)
- Blueprint: `render.yaml` (builds `packages/api` via Dockerfile)
- Steps:
  1) In Render Dashboard → New → Blueprint → connect repo
  2) Set env vars for the service `medflect-api`:
     - `PORT=3001`
     - `CORS_ORIGIN=https://<your-vercel-domain>`
     - `GROQ_BASE_URL=https://api.groq.com` (or your LiteLLM proxy)
     - `GROQ_API_KEY=...` (add securely)
     - `GROQ_MODEL=groq/deepseek-r1-distill-llama-70b`
  3) Deploy and copy the URL (e.g., `https://medflect-api.onrender.com`)
  4) On Vercel (web project) set env `VITE_API_BASE=https://medflect-api.onrender.com` and redeploy web

Notes:
- Web calls `${VITE_API_BASE}/api/*` when set; otherwise same-origin.
- Analytics and KPIs require the backend to be live.

The API container now serves the built frontend from `packages/web/dist` on port 3001.

- Access UI: http://localhost:3001/
- Health check: http://localhost:3001/api/health

Notes:
- The compose file builds from the root `Dockerfile` and sets `NODE_ENV=production` and `SERVE_WEB_DIST=true` for the API service.
- For small, single-container deployments, the API can serve static assets. **For scalable production**, prefer deploying the frontend as static assets behind a CDN and running the API as a separate, horizontally scalable service behind a load balancer.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testNamePattern="AI"
npm test -- --testNamePattern="Blockchain"
```

## 📈 Roadmap

### Phase 1: MVP (6-12 months)
- [x] Core platform development
- [x] 37 Military Hospital pilot
- [x] Basic AI integration
- [x] Blockchain consent system

### Phase 2: Expansion (Year 2)
- [ ] Nationwide rollout in Ghana
- [ ] Advanced AI features
- [ ] Multi-hospital coordination
- [ ] Mobile app optimization

### Phase 3: Regional (Years 3-4)
- [ ] Nigeria, Kenya, South Africa expansion
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Telehealth integration

### Phase 4: Global Scale (Years 5+)
- [ ] Global market entry
- [ ] Advanced AI models
- [ ] Comprehensive platform
- [ ] International partnerships

**Commercial Model (Summary)**
Pricing: SaaS license tiered by bed count + Results-as-a-Service performance component.
ROI: 5–10% cost reduction typical with AI; quick payback via efficiency and error reduction.
Funding: Mix of grants, development finance, and SaaS contracts; strategic partnerships (telcos, cloud).

**Impact**
Equity: Specialist-level support for rural clinics; measurable improvements in throughput, satisfaction.
Regulatory: Built-in audit and FHIR compliance; supports national digital health policy.
Operations: Reduced wait times and burnout; improved flow and safety.

**Notes on Groq, FHIR, MCP, Blockchain (Implementation Pointers)**
Groq: Provision on-prem LPU servers; expose local inference endpoints used by packages/server services. Ensure PHI never leaves premises.
FHIR: Adopt resource schemas across UI and API; leverage FHIR versioning for conflict resolution in offline sync.
MCP: Define MCP servers for EHR/LIS/PACS; log all prompt-context references.
Blockchain: Treat chain as governance/audit layer; store only hashes and permission tokens. Use permissioned validators (consortium).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.medflect.ai](https://docs.medflect.ai)
- **Community**: [community.medflect.ai](https://community.medflect.ai)
- **Email**: support@medflect.ai

## 🙏 Acknowledgments

- Ghana Health Service
- 37 Military Hospital
- Groq for AI infrastructure
- HL7 for FHIR standards
- Ethereum Foundation

---

**Medflect AI** - Empowering our healers, honoring every patient. 🇬🇭 
