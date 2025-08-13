// Clinical NLP service for Medflect: supports spaCy and MedCAT (Python via child process)
// Extracts diagnoses, medications, labs, and clinical concepts from text

const { spawn } = require('child_process');
const path = require('path');
const { logger } = require('../utils/logger');

// Helper to run Python NLP script (spaCy or MedCAT)
function runPythonNLP({ text, engine = 'spacy', entities = ['diagnosis', 'medication', 'lab'], model = undefined }) {
  return new Promise((resolve, reject) => {
    const script = engine === 'medcat'
      ? path.join(__dirname, 'py', 'medcat_ner.py')
      : path.join(__dirname, 'py', 'spacy_ner.py');
    const args = [script, '--text', text, '--entities', entities.join(','), ...(model ? ['--model', model] : [])];
    const py = spawn('python', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    py.stdout.on('data', d => out += d);
    py.stderr.on('data', d => err += d);
    py.on('close', code => {
      if (code !== 0) {
        logger.errorWithContext(err, 'clinical_nlp_python_error', { engine });
        return reject(new Error(err));
      }
      try {
        resolve(JSON.parse(out));
      } catch (e) {
        logger.errorWithContext(e, 'clinical_nlp_json_parse', { out });
        reject(e);
      }
    });
  });
}

// Main entry point for clinical NLP
async function extractClinicalEntities(text, opts = {}) {
  const engine = opts.engine || process.env.NLP_ENGINE || 'spacy';
  const entities = opts.entities || ['diagnosis', 'medication', 'lab'];
  const model = opts.model;
  if (!text || typeof text !== 'string') throw new Error('Text required for NLP extraction');
  logger.clinical('Running clinical NLP', { engine, entities, model });
  return await runPythonNLP({ text, engine, entities, model });
}

module.exports = {
  extractClinicalEntities,
  runPythonNLP
};
