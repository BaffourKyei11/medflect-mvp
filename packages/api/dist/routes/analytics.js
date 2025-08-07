import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
export const analyticsRouter = Router();
analyticsRouter.post('/', async (req, res, next) => {
    try {
        const evt = req.body || {};
        const line = JSON.stringify({ ...evt, _ts: new Date().toISOString() }) + '\n';
        const dir = path.resolve(process.cwd(), 'data');
        const file = path.join(dir, 'analytics.log');
        try {
            await fs.mkdir(dir, { recursive: true });
        }
        catch { }
        await fs.appendFile(file, line, 'utf8');
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
