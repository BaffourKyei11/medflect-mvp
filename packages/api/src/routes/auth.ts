import { Router } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getPrisma } from '../services/db.js';

const JWT: Secret = (process.env.JWT_SECRET || 'dev') as Secret;
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '2h') as import('jsonwebtoken').SignOptions['expiresIn'];
const DEV_AUTH = process.env.DEV_AUTH === 'true';
export const authRouter = Router();

// POST /api/auth/register { email, password, name? }
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    if (DEV_AUTH) {
      const role: any = 'clinician';
      const token = jwt.sign({ sub: email, role } as any, JWT as Secret, { expiresIn: EXPIRES_IN } as import('jsonwebtoken').SignOptions);
      return res.json({ token, user: { id: email, email, name: name || undefined, role } });
    }
    const prisma = getPrisma();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const rounds = Number(process.env.BCRYPT_ROUNDS || 12);
    const hash = await bcrypt.hash(password, rounds);
    const user = await prisma.user.create({ data: { email, name: name || null, password: hash } });
    const role = user.role as any;
    const token = jwt.sign({ sub: user.id, role } as any, JWT as Secret, { expiresIn: EXPIRES_IN } as import('jsonwebtoken').SignOptions);
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name || undefined, role } });
  } catch (e:any) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login { email, password }
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    if (DEV_AUTH) {
      const role: any = 'clinician';
      const token = jwt.sign({ sub: email, role } as any, JWT as Secret, { expiresIn: EXPIRES_IN } as import('jsonwebtoken').SignOptions);
      return res.json({ token, user: { id: email, email, name: undefined, role } });
    }
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const role = user.role as any;
    const token = jwt.sign({ sub: user.id, role } as any, JWT as Secret, { expiresIn: EXPIRES_IN } as import('jsonwebtoken').SignOptions);
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name || undefined, role } });
  } catch (e:any) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me -> returns current user based on Authorization
authRouter.get('/me', async (req, res) => {
  try {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header || Array.isArray(header)) return res.status(401).json({ error: 'Missing Authorization header' });
    const [scheme, token] = (header as string).split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid Authorization header' });
    const payload = jwt.verify(token, JWT) as { sub: string };
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, email: user.email, name: user.name || undefined, role: user.role });
  } catch (e:any) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// POST /api/auth/logout (stateless; front-end clears token)
authRouter.post('/logout', (_req, res) => {
  return res.json({ ok: true });
});
