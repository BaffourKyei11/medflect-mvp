import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
export type Role = 'admin'|'clinician'|'patient'|'auditor';
export interface JwtPayload{ sub:string; role:Role; }
export const requireAuth=(req:Request,res:Response,next:NextFunction)=>{
  const hdr=req.headers.authorization||''; const token=hdr.startsWith('Bearer ')?hdr.slice(7):'';
  if(!token) return res.status(401).json({error:'Unauthorized'});
  try{ const payload=jwt.verify(token,config.jwtSecret) as JwtPayload; (req as any).user={id:payload.sub,role:payload.role}; next(); }
  catch{ return res.status(401).json({error:'Invalid token'}); }
};
