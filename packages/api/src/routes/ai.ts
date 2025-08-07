import { Router } from 'express'; import { generateSummary } from '../services/aiService.js'; import { createResource } from '../services/fhirService.js';
export const aiRouter=Router();
aiRouter.post('/summary/:patientId', async (req,res,next)=>{ try{
  const {patientId}=req.params; const r=await generateSummary(patientId);
  const doc=await createResource('DocumentReference',{resourceType:'DocumentReference',status:'current',subject:{reference:`Patient/${patientId}`},date:new Date().toISOString(),description:'AI summary',content:[{attachment:{contentType:'text/plain',data:Buffer.from(r.summary).toString('base64')}}],extension:[{url:'http://medflect.ai/provenance',valueString:JSON.stringify(r.provenance)}]});
  res.json({summary:r.summary,provenance:r.provenance,documentReferenceId:doc.id});
}catch(e){ next(e);} });
