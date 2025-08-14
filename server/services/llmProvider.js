// Provider-agnostic LLM API service for Medflect
// Supports Groq (LiteLLM), OpenAI, Anthropic (Claude)
// Add new providers by extending the provider map and config

const { Groq } = require('groq-sdk');
// const { OpenAI } = require('openai'); // Uncomment if/when OpenAI SDK is installed
// const { Anthropic } = require('@anthropic-ai/sdk'); // Uncomment if/when Anthropic SDK is installed
const promptTemplates = require('../config/promptTemplates');
const { logger } = require('../utils/logger');

// Provider config (could be loaded from env/config/db)
const PROVIDERS = {
  groq: {
    name: 'Groq',
    getClient: () => new Groq({
      apiKey: process.env.GROQ_API_KEY || process.env.LITELLM_VIRTUAL_KEY,
      baseURL: process.env.GROQ_BASE_URL || process.env.LITELLM_ENDPOINT
    }),
    defaultModel: process.env.GROQ_MODEL || 'groq/deepseek-r1-distill-llama-70b',
    supports: ['chat', 'completion'],
  },
  // openai: {
  //   name: 'OpenAI',
  //   getClient: () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
  //   defaultModel: process.env.OPENAI_MODEL || 'gpt-4o',
  //   supports: ['chat', 'completion'],
  // },
  // anthropic: {
  //   name: 'Anthropic',
  //   getClient: () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
  //   defaultModel: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
  //   supports: ['chat'],
  // },
};

function getProvider(providerName) {
  const key = providerName?.toLowerCase() || process.env.LLM_PROVIDER || 'groq';
  if (!PROVIDERS[key]) throw new Error(`LLM provider not supported: ${key}`);
  return PROVIDERS[key];
}

async function generateLLMCompletion({
  provider = 'groq',
  promptType = 'clinical',
  promptVersion = 'v1',
  promptData = {},
  model = undefined,
  userId = undefined,
  ...opts
}) {
  const prov = getProvider(provider);
  const client = prov.getClient();
  const modelName = model || prov.defaultModel;
  const templateFn = promptTemplates[promptType]?.[promptVersion];
  if (!templateFn) throw new Error(`Prompt template not found: ${promptType} ${promptVersion}`);
  const prompt = templateFn(promptData);

  logger.ai(`LLM completion request`, { provider: prov.name, model: modelName, promptType, promptVersion, userId });

  // Groq/LiteLLM
  if (provider === 'groq') {
    const response = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: modelName,
      max_tokens: opts.max_tokens || 1024,
      temperature: opts.temperature || 0.2,
    });
    return {
      content: response.choices?.[0]?.message?.content,
      model: modelName,
      provider: prov.name,
      usage: response.usage,
      raw: response
    };
  }

  // OpenAI example (uncomment if/when OpenAI is enabled)
  // if (provider === 'openai') {
  //   const response = await client.chat.completions.create({
  //     messages: [{ role: 'user', content: prompt }],
  //     model: modelName,
  //     max_tokens: opts.max_tokens || 1024,
  //     temperature: opts.temperature || 0.2,
  //   });
  //   return {
  //     content: response.choices?.[0]?.message?.content,
  //     model: modelName,
  //     provider: prov.name,
  //     usage: response.usage,
  //     raw: response
  //   };
  // }

  // Anthropic example (uncomment if/when Anthropic is enabled)
  // if (provider === 'anthropic') {
  //   const response = await client.messages.create({
  //     messages: [{ role: 'user', content: prompt }],
  //     model: modelName,
  //     max_tokens: opts.max_tokens || 1024,
  //     temperature: opts.temperature || 0.2,
  //   });
  //   return {
  //     content: response.content,
  //     model: modelName,
  //     provider: prov.name,
  //     usage: response.usage,
  //     raw: response
  //   };
  // }

  throw new Error(`LLM provider not implemented: ${provider}`);
}

module.exports = {
  getProvider,
  generateLLMCompletion,
  PROVIDERS
};
