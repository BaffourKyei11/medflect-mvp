// Groq Prompt: Resilient LLM Call Handler
// Tool: robust_llm_call
// Description: Handles LLM API call with retries, exponential backoff, and error handling
const groq = require('groq-sdk');
require('dotenv').config();

const API_URL = process.env.LITELLM_ENDPOINT;
const API_KEY = process.env.LITELLM_API_KEY;

async function robust_llm_call({ prompt, input }) {
  let tries = 0;
  let delay = 500;
  while (tries < 3) {
    try {
      const res = await groq.call({
        endpoint: API_URL,
        apiKey: API_KEY,
        prompt,
        input
      });
      if (res && res.content) return res.content;
      throw new Error('No content');
    } catch (e) {
      if (++tries >= 3) return { error: true, message: e.message };
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

groq.createTool({
  name: 'robust_llm_call',
  description: 'Resilient LLM call handler with retries and backoff',
  entry: __filename
});

module.exports = { robust_llm_call };
