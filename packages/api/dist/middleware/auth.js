import jwt from 'jsonwebtoken';
import { config } from '../config.js';
export const requireAuth = (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        req.user = { id: payload.sub, role: payload.role };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
};
