import { Router } from 'express'; import jwt from 'jsonwebtoken';
const JWT=process.env.JWT_SECRET||'dev'; export const authRouter=Router();
authRouter.post('/login',(req,res)=>{ const {username}=req.body||{}; const role=username==='admin'?'admin':'clinician'; const token=jwt.sign({sub:username||'demo',role},JWT,{expiresIn:'2h'}); res.json({token,user:{id:username||'demo',role}}); });
