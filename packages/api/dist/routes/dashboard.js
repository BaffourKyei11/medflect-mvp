import { Router } from 'express';
export const dashboardRouter = Router();
dashboardRouter.get('/', async (_req, res) => {
    // TODO: replace with real KPIs from DB/FHIR sources
    const kpis = [
        { label: 'Avg. wait time', value: -12 },
        { label: 'Docs saved/day', value: 40 },
        { label: 'Readmit risk flags', value: 3 }
    ];
    res.json({ kpis, alerts: ['LLM latency < 200ms', 'All sync workers healthy'] });
});
