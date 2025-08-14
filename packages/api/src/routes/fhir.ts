import { Router } from 'express';
import { createResource, getResource, updateResource } from '../services/fhirService.js';
import { blockchainClient } from '../services/blockchainClient.js';
import { recordAudit } from '../services/audit.js';

export const fhirRouter=Router();

const consentGuard=(cat:string)=>(async (req:any,res:any,next:any)=>{ 
  const id=req.params.id||req.query.patientId||''; 
  const ok=await blockchainClient.checkConsent(id,cat); 
  if(!ok && req.method==='GET') return res.status(403).json({error:'Consent required'}); 
  next(); 
});

fhirRouter.get('/:type/:id', consentGuard('clinical'), async (req,res,next)=>{
  const { type, id } = req.params as { type: string; id: string };
  try{
    const r = await getResource(type,id);
    const pid = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
    await recordAudit({ event:'fhir_read', action:'read', target:`${type}/${id}`, allowed:true, patientId: pid }, req);
    res.json(r);
  }catch(e){
    const err:any = e;
    await recordAudit({ event:'fhir_read', action:'read', target:`${type}/${id}`, allowed:false, meta: { error: err?.message } }, req);
    next(e);
  }
});

fhirRouter.post('/:type', async (req,res,next)=>{
  const { type } = req.params as { type: string };
  try{
    const doc=await createResource(type,req.body);
    const pid = req.body?.subject?.reference?.split('/')?.[1];
    await recordAudit({ event:'fhir_create', action:'create', target:`${type}/${doc.id||''}`, allowed:true, patientId: pid }, req);
    res.status(201).json(doc);
  }catch(e){
    const err:any = e;
    await recordAudit({ event:'fhir_create', action:'create', target:`${type}`, allowed:false, meta: { error: err?.message } }, req);
    next(e);
  }
});

fhirRouter.put('/:type/:id', async (req,res,next)=>{
  const { type, id } = req.params as { type: string; id: string };
  try{
    const doc = await updateResource(type,id,req.body);
    const pid = req.body?.subject?.reference?.split('/')?.[1];
    await recordAudit({ event:'fhir_update', action:'update', target:`${type}/${id}`, allowed:true, patientId: pid }, req);
    res.json(doc);
  }catch(e){
    const err:any = e;
    await recordAudit({ event:'fhir_update', action:'update', target:`${type}/${id}`, allowed:false, meta: { error: err?.message } }, req);
    next(e);
  }
});
