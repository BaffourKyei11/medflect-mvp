# Role-Based UI Flows

## Clinician (Web PWA)
- Login → Dashboard
- Dashboard →
  - Risk Flags/KPIs
  - Bed Occupancy
  - Workflow/Tasks
  - AI Summaries
  - Patients List → Patient Detail → Patient Profile
  - Consent → Consent Audit → Audit Trail
- Offline: show banners, allow queued actions, retry on reconnect

## Admin (Web PWA)
- Login → Dashboard (Admin tiles)
- Views →
  - Analytics/KPIs
  - Consent Log
  - Audit Trail
  - System Health
- User/Role management (RBAC)

## Patient/Caregiver (Mobile)
- Login → Home
- Tabs →
  - Visit Summaries (Encounters + Observations) → Detail
  - Messages/Chat
  - Alerts/Reminders
- Profile → Demographics, Consent status

## Flows (Sequences)
- First Launch: Auth → Profile hydrate → Cache essentials
- Offline: Read from cache → Queue writes → Background sync
- Conflict: Detect version diff → Non-blocking banner → Resolution UI
