import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export type Role = 'admin'|'clinician'|'patient'|'auditor';
export interface JwtPayload{ sub:string; role:Role; }
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header || Array.isArray(header)) return res.status(401).json({ error: 'Missing Authorization header' });
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid Authorization header' });
    const secret = process.env.JWT_SECRET || 'dev';
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as any).user = payload;
    next();
  } catch (e:any) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
