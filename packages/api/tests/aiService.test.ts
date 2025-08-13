import { generateSummary } from '../src/services/aiService';
test('ai summary (mock)', async () => { process.env.MOCK_AI='true'; const r=await generateSummary('pat1'); expect(r.summary).toBeTruthy(); });
