# Scalability Roadmap

- Module Architecture
  - New modules under `packages/{module}` with API routes, web routes, mobile screens, shared types.
  - Examples: `telemedicine`, `payments`.
- Extensibility
  - Domain events → audit + blockchain; feature flags in config; shared tokens + i18n.
- Compliance-by-Design
  - Audit all writes; consent enforced; configurable retention.
