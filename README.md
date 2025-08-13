## 🛠️ Troubleshooting (Vercel)

- Error: "Function Runtimes must have a valid version"
  - Ensure `packages/web/vercel.json` has only SPA routes (no `builds` array)
  - Ensure there is no `packages/web/api/` directory in the frontend
  - Set `engines.node` in `packages/web/package.json` to ">=18"
  - Force re-deploy with: `npx vercel deploy --prod --cwd ./packages/web -f`

# Medflect AI - Smart Healthcare Platform

## 🏥 Transforming Healthcare in Ghana and Beyond

Medflect AI is a revolutionary healthcare platform that combines AI-powered clinical assistance with blockchain-based consent management to transform hospitals into smart care hubs. Built specifically for the African healthcare context with offline-first capabilities.

## 🌟 Key Features

- **AI-Powered Clinical Summaries**: Groq-accelerated LLMs generate instant patient summaries
- **Blockchain Consent Management**: Secure, auditable patient data access control
- **Offline-First Architecture**: Works seamlessly in low-connectivity environments
- **HL7 FHIR Compliance**: Interoperable with existing healthcare systems
- **Multi-Role Interface**: Tailored experiences for doctors, nurses, and patients
- **Real-time Sync**: Seamless data synchronization when connectivity is available

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │    │   Node.js API   │    │   Groq AI       │
│   Frontend      │◄──►│   Backend       │◄──►│   Inference     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌───────────────────────────────┐    ┌─────────────────┐
│   Firebase Firestore          │    │   Ethereum      │
│   (offline cache via SDK)     │    │   Blockchain    │
└───────────────────────────────┘    └─────────────────┘
```

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
   ```bash
   npm run dev
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
├── packages/web/           # Vite React PWA Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
├── server/                # Node.js Backend
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   └── utils/             # Server utilities
├── contracts/             # Smart contracts
├── docs/                  # Documentation
└── tests/                 # Test files
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development
# Serve built web UI from the API in production
SERVE_WEB_DIST=true

# Database
DATABASE_URL=https://<your-firebase-project-id>.firebaseio.com

# Groq AI
GROQ_API_KEY=your_groq_api_key
GROQ_API_ENDPOINT=http://91.108.112.45:4000
GROQ_MODEL=llama3-8b-8192

# Blockchain
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_key
CONTRACT_ADDRESS=your_contract_address
PRIVATE_KEY=your_private_key

# JWT
JWT_SECRET=your_jwt_secret

# FHIR
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
```

## 🏥 User Roles

### 👨‍⚕️ Doctors
- AI-powered clinical summaries
- Patient data visualization
- Clinical decision support
- Mobile-optimized interface

### 👩‍⚕️ Nurses
- Streamlined patient workflows
- Vital signs monitoring
- Task management
- Quick patient lookups

### 👤 Patients
- Secure health portal
- Appointment management
- Educational materials
- Consent management

### 🏢 Administrators
- Hospital-wide dashboards
- Performance analytics
- Workflow customization
- User management

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
     - `GROQ_MODEL=llama3-8b-8192`
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
- There is no separate `web` service; the API serves static assets in production.

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

**Medflect AI** - Amplifying human caregivers, ensuring every patient's voice is heard. 🇬🇭 
