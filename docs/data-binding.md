# Data Binding Strategy (FHIR + Couchbase)

- Backend: Express + Couchbase via `packages/api/src/services/db.ts`; FHIR routes in `packages/api/src/routes/fhir.ts`.
- Validation: AJV against FHIR JSON Schemas for `Patient`, `Encounter`, `Observation`, `Consent`.
- RBAC: JWT role/facility claims enforced in `middleware/auth.ts`; Sync Gateway channels per patient/role.
- Web Client:
  - Services: `packages/web/src/services/{fhir,patients,consent,analytics,ai}.ts`.
  - Policy: stale-while-revalidate; IndexedDB cache; offline write queue; optimistic UI.
  - Mapping: form schemas ↔ FHIR types; deterministic IDs to reduce conflicts.
- Mobile Client:
  - `packages/mobile/services/fhir.ts` (mirror web contract).
  - Local cache (MMKV/SQLite) + write queue; handle conflicts via versioning.
- Security: Minimize fields for mobile; audit all mutations; consent checks before reads when required.
