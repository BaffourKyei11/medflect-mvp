import { Router } from 'express'; import { blockchainClient } from '../services/blockchainClient.js';
export const consentRouter=Router();
consentRouter.post('/grant',async (req,res,next)=>{ try{ const {patientId,dataCategory}=req.body||{}; res.json({ok:await blockchainClient.grantConsent(patientId,dataCategory)});}catch(e){next(e);} });
consentRouter.post('/revoke',async (req,res,next)=>{ try{ const {patientId,dataCategory}=req.body||{}; res.json({ok:await blockchainClient.revokeConsent(patientId,dataCategory)});}catch(e){next(e);} });
