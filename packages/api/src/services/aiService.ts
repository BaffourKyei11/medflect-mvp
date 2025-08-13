import axios from 'axios';
export async function generateSummary(patientId:string){
  if(process.env.MOCK_AI==='true') return { summary:`Discharge summary for ${patientId}.`, provenance:{model:'mock-llm',version:'v1',timestamp:new Date().toISOString(),dataRefs:[]} };
  const apiKey=process.env.GROQ_API_KEY||process.env.OPENAI_API_KEY; const baseURL=process.env.GROQ_BASE_URL||process.env.OPENAI_BASE_URL;
  if(!apiKey||!baseURL) throw new Error('AI not configured');
  const r=await axios.post(`${baseURL}/v1/chat/completions`,{model:process.env.GROQ_MODEL||'llama3-8b-8192',messages:[{role:'user',content:`Generate discharge summary for ${patientId}`}]},{headers:{Authorization:`Bearer ${apiKey}`},timeout:20000});
  const text=r.data?.choices?.[0]?.message?.content??'No content';
  return { summary:text, provenance:{model:process.env.GROQ_MODEL,version:'api',timestamp:new Date().toISOString(),dataRefs:[]} };
}

export async function generateChatCompletion(payload: { messages: Array<{ role: string; content: string }>; model?: string }){
  if(process.env.MOCK_AI==='true'){
    const combined = payload.messages.map(m=>`${m.role}: ${m.content}`).join('\n');
    return { summary:`Mock response. Input:\n${combined}`, provenance:{model:'mock-llm',version:'v1',timestamp:new Date().toISOString(),dataRefs:[]} };
  }
  const apiKey=process.env.GROQ_API_KEY||process.env.OPENAI_API_KEY; const baseURL=process.env.GROQ_BASE_URL||process.env.OPENAI_BASE_URL;
  if(!apiKey||!baseURL){
    console.warn('AI config missing:', { hasKey: !!apiKey, hasBase: !!baseURL });
    throw new Error('AI not configured');
  }
  // Ignore client-provided model in live mode to avoid unauthorized model errors
  const model = process.env.GROQ_MODEL || 'groq/deepseek-r1-distill-llama-70b';
  try{
    const url = `${baseURL}/v1/chat/completions`;
    console.log('AI upstream request ->', url, 'model:', model);
    const r=await axios.post(url,{model, messages: payload.messages},{headers:{Authorization:`Bearer ${apiKey}`,'x-api-key': apiKey,'Content-Type':'application/json'},timeout:20000});
    const text=r.data?.choices?.[0]?.message?.content??'No content';
    return { summary:text, provenance:{model,version:'api',timestamp:new Date().toISOString(),dataRefs:[]} };
  }catch(err:any){
    const status = err?.response?.status; const data = err?.response?.data;
    console.warn('AI upstream error', { status, data: typeof data==='string'? data.slice(0,200): data });
    throw err;
  }
}
