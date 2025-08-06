const { Groq } = require('groq-sdk');
const { logger } = require('../utils/logger');
const { getQuery, allQuery, runQuery } = require('./database');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

let groqClient;
let requestCount = 0;
let lastResetTime = Date.now();

// Security configuration
const SECURITY_CONFIG = {
  MAX_TOKENS_PER_REQUEST: 4000,
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000,
  ALLOWED_MODELS: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'],
  SENSITIVE_FIELDS: ['ssn', 'credit_card', 'password', 'private_key', 'secret'],
  MAX_INPUT_LENGTH: 10000,
  MIN_CONFIDENCE_THRESHOLD: 0.7
};

// Initialize Groq client with LiteLLM endpoint
const initializeGroq = async () => {
  try {
    const apiKey = process.env.GROQ_API_KEY || process.env.LITELLM_VIRTUAL_KEY;
    const baseURL = process.env.GROQ_BASE_URL || process.env.LITELLM_ENDPOINT;
    
    if (!apiKey || !baseURL) {
      logger.warning('Groq/LiteLLM configuration incomplete. AI features will be disabled.');
      return;
    }

    // Validate endpoint URL
    if (!isValidEndpoint(baseURL)) {
      throw new Error('Invalid LiteLLM endpoint URL');
    }

    groqClient = new Groq({
      apiKey: apiKey,
      baseURL: baseURL
    });

    // Test connection with security validation
    await testGroqConnection();
    
    // Log successful initialization with security audit
    logger.security('Groq/LiteLLM service initialized', {
      endpoint: maskSensitiveData(baseURL),
      model: process.env.GROQ_MODEL,
      timestamp: new Date().toISOString()
    });
    
    logger.success('Groq/LiteLLM AI service initialized successfully');
    
  } catch (error) {
    logger.errorWithContext(error, 'groq_initialization');
    throw error;
  }
};

// Enhanced security validation
const isValidEndpoint = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const maskSensitiveData = (data) => {
  if (typeof data !== 'string') return data;
  return data.replace(/(https?:\/\/[^\/]+)/, (match) => {
    const parts = match.split('.');
    if (parts.length >= 2) {
      return `${parts[0]}.***.***`;
    }
    return match;
  });
};

// Rate limiting check
const checkRateLimit = () => {
  const now = Date.now();
  const minuteWindow = 60 * 1000;
  const hourWindow = 60 * 60 * 1000;
  
  // Reset counters if window has passed
  if (now - lastResetTime > hourWindow) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= SECURITY_CONFIG.MAX_REQUESTS_PER_HOUR) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  requestCount++;
};

// Input validation and sanitization
const validateAndSanitizeInput = (input, context = {}) => {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: Input must be a non-empty string');
  }
  
  if (input.length > SECURITY_CONFIG.MAX_INPUT_LENGTH) {
    throw new Error(`Input too long: Maximum ${SECURITY_CONFIG.MAX_INPUT_LENGTH} characters allowed`);
  }
  
  // Check for sensitive data patterns
  const sensitivePatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\d{10,11}\b/g // Phone numbers
  ];
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(input)) {
      logger.security('Sensitive data detected in AI input', {
        pattern: pattern.toString(),
        context: context,
        timestamp: new Date().toISOString()
      });
      throw new Error('Sensitive data detected in input. Please remove personal information.');
    }
  }
  
  // Sanitize HTML and script tags
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  
  return sanitized;
};

// Output validation and sanitization
const validateAndSanitizeOutput = (output, context = {}) => {
  if (!output || typeof output !== 'string') {
    throw new Error('Invalid AI output received');
  }
  
  // Check for potential prompt injection or malicious content
  const maliciousPatterns = [
    /system:|assistant:|user:/gi,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(output)) {
      logger.security('Malicious content detected in AI output', {
        pattern: pattern.toString(),
        context: context,
        timestamp: new Date().toISOString()
      });
      throw new Error('AI output contains potentially malicious content');
    }
  }
  
  return output.trim();
};

// Test Groq connection with enhanced security
const testGroqConnection = async () => {
  try {
    const testInput = 'Hello, this is a security test message.';
    const sanitizedInput = validateAndSanitizeInput(testInput, { test: true });
    
    const response = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: sanitizedInput }],
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      max_tokens: 10,
      temperature: 0.1
    });

    const sanitizedOutput = validateAndSanitizeOutput(
      response.choices[0]?.message?.content || '',
      { test: true }
    );

    logger.ai('Groq/LiteLLM connection test successful', {
      model: process.env.GROQ_MODEL,
      responseTime: response.usage?.total_tokens || 0,
      endpoint: maskSensitiveData(process.env.GROQ_BASE_URL || process.env.LITELLM_ENDPOINT)
    });
    
  } catch (error) {
    logger.errorWithContext(error, 'groq_connection_test');
    throw new Error('Failed to connect to Groq/LiteLLM AI service');
  }
};

// Generate clinical summary with enhanced security
const generateClinicalSummary = async (patientId, encounterId, summaryType = 'clinical', userId) => {
  try {
    const startTime = Date.now();
    
    // Rate limiting check
    checkRateLimit();
    
    // Validate inputs
    if (!patientId || !userId) {
      throw new Error('Missing required parameters');
    }
    
    // Get patient data with access control
    const patientData = await getPatientDataForSummary(patientId, encounterId, userId);
    
    if (!patientData) {
      throw new Error('Patient data not found or access denied');
    }

    // Create prompt with security validation
    const prompt = createSummaryPrompt(patientData, summaryType);
    const sanitizedPrompt = validateAndSanitizeInput(prompt, {
      patientId,
      encounterId,
      summaryType,
      userId
    });
    
    // Generate summary using Groq/LiteLLM
    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(summaryType)
        },
        {
          role: 'user',
          content: sanitizedPrompt
        }
      ],
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      max_tokens: Math.min(2000, SECURITY_CONFIG.MAX_TOKENS_PER_REQUEST),
      temperature: 0.3,
      top_p: 0.9
    });

    const rawSummary = response.choices[0]?.message?.content;
    const sanitizedSummary = validateAndSanitizeOutput(rawSummary, {
      patientId,
      encounterId,
      summaryType,
      userId
    });
    
    const duration = Date.now() - startTime;
    const confidenceScore = calculateConfidenceScore(response);

    // Log AI interaction for audit
    await logAIInteraction({
      userId,
      patientId,
      encounterId,
      action: 'clinical_summary',
      inputLength: sanitizedPrompt.length,
      outputLength: sanitizedSummary.length,
      tokens: response.usage?.total_tokens || 0,
      duration,
      confidenceScore,
      model: process.env.GROQ_MODEL
    });

    logger.ai('Clinical summary generated', {
      patientId,
      encounterId,
      summaryType,
      duration,
      tokens: response.usage?.total_tokens || 0,
      model: process.env.GROQ_MODEL,
      confidenceScore
    });

    return {
      content: sanitizedSummary,
      modelVersion: process.env.GROQ_MODEL,
      confidenceScore,
      tokens: response.usage?.total_tokens || 0,
      duration,
      securityHash: generateSecurityHash(sanitizedSummary)
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'clinical_summary_generation', {
      patientId,
      encounterId,
      summaryType,
      userId
    });
    throw error;
  }
};

// Generate clinical decision support with enhanced security
const generateClinicalDecisionSupport = async (patientId, encounterId, query, userId) => {
  try {
    const startTime = Date.now();
    
    // Rate limiting check
    checkRateLimit();
    
    // Validate inputs
    if (!patientId || !query || !userId) {
      throw new Error('Missing required parameters');
    }
    
    const sanitizedQuery = validateAndSanitizeInput(query, {
      patientId,
      encounterId,
      userId
    });
    
    // Get relevant patient data with access control
    const patientData = await getPatientDataForDecisionSupport(patientId, encounterId, userId);
    
    const prompt = `
Patient Information:
${JSON.stringify(patientData, null, 2)}

Clinical Query: ${sanitizedQuery}

Please provide evidence-based clinical decision support including:
1. Differential diagnosis considerations
2. Recommended diagnostic tests
3. Treatment options with rationale
4. Risk factors and contraindications
5. Follow-up recommendations
`;

    const sanitizedPrompt = validateAndSanitizeInput(prompt, {
      patientId,
      encounterId,
      userId
    });

    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert clinical decision support system. Provide evidence-based recommendations with clear rationale. Always emphasize that your suggestions should be reviewed by qualified healthcare professionals.`
        },
        {
          role: 'user',
          content: sanitizedPrompt
        }
      ],
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      max_tokens: Math.min(1500, SECURITY_CONFIG.MAX_TOKENS_PER_REQUEST),
      temperature: 0.2
    });

    const rawOutput = response.choices[0]?.message?.content;
    const sanitizedOutput = validateAndSanitizeOutput(rawOutput, {
      patientId,
      encounterId,
      userId
    });
    
    const duration = Date.now() - startTime;
    const confidenceScore = calculateConfidenceScore(response);

    // Log AI interaction for audit
    await logAIInteraction({
      userId,
      patientId,
      encounterId,
      action: 'clinical_decision_support',
      inputLength: sanitizedPrompt.length,
      outputLength: sanitizedOutput.length,
      tokens: response.usage?.total_tokens || 0,
      duration,
      confidenceScore,
      model: process.env.GROQ_MODEL
    });

    logger.ai('Clinical decision support generated', {
      patientId,
      encounterId,
      query: sanitizedQuery,
      duration,
      tokens: response.usage?.total_tokens || 0,
      confidenceScore
    });

    return {
      content: sanitizedOutput,
      modelVersion: process.env.GROQ_MODEL,
      confidenceScore,
      tokens: response.usage?.total_tokens || 0,
      duration,
      securityHash: generateSecurityHash(sanitizedOutput)
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'clinical_decision_support', {
      patientId,
      encounterId,
      query,
      userId
    });
    throw error;
  }
};

// Generate patient communication with enhanced security
const generatePatientCommunication = async (patientId, messageType, context, userId) => {
  try {
    const startTime = Date.now();
    
    // Rate limiting check
    checkRateLimit();
    
    // Validate inputs
    if (!patientId || !messageType || !userId) {
      throw new Error('Missing required parameters');
    }
    
    const sanitizedContext = context ? validateAndSanitizeInput(context, {
      patientId,
      messageType,
      userId
    }) : '';
    
    // Get patient information with access control
    const patient = await getQuery('SELECT * FROM patients WHERE id = ?', [patientId]);
    
    if (!patient) {
      throw new Error('Patient not found or access denied');
    }

    const prompt = createPatientCommunicationPrompt(patient, messageType, sanitizedContext);
    const sanitizedPrompt = validateAndSanitizeInput(prompt, {
      patientId,
      messageType,
      userId
    });
    
    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a compassionate healthcare communication assistant. Generate clear, empathetic, and culturally appropriate messages for patients. Use simple language and avoid medical jargon.`
        },
        {
          role: 'user',
          content: sanitizedPrompt
        }
      ],
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      max_tokens: Math.min(500, SECURITY_CONFIG.MAX_TOKENS_PER_REQUEST),
      temperature: 0.7
    });

    const rawOutput = response.choices[0]?.message?.content;
    const sanitizedOutput = validateAndSanitizeOutput(rawOutput, {
      patientId,
      messageType,
      userId
    });
    
    const duration = Date.now() - startTime;

    // Log AI interaction for audit
    await logAIInteraction({
      userId,
      patientId,
      action: 'patient_communication',
      inputLength: sanitizedPrompt.length,
      outputLength: sanitizedOutput.length,
      tokens: response.usage?.total_tokens || 0,
      duration,
      model: process.env.GROQ_MODEL
    });

    logger.ai('Patient communication generated', {
      patientId,
      messageType,
      duration,
      tokens: response.usage?.total_tokens || 0
    });

    return {
      content: sanitizedOutput,
      modelVersion: process.env.GROQ_MODEL,
      messageType,
      duration,
      securityHash: generateSecurityHash(sanitizedOutput)
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'patient_communication', {
      patientId,
      messageType,
      userId
    });
    throw error;
  }
};

// Medication interaction check with enhanced security
const checkMedicationInteractions = async (medications, userId) => {
  try {
    const startTime = Date.now();
    
    // Rate limiting check
    checkRateLimit();
    
    // Validate inputs
    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      throw new Error('Invalid medications data');
    }
    
    // Sanitize medication data
    const sanitizedMedications = medications.map(med => ({
      name: validateAndSanitizeInput(med.name || '', { userId }),
      dosage: validateAndSanitizeInput(med.dosage || '', { userId })
    }));
    
    const prompt = `
Please analyze the following medications for potential interactions:

Medications:
${sanitizedMedications.map(med => `- ${med.name} (${med.dosage})`).join('\n')}

Provide:
1. Potential drug-drug interactions
2. Contraindications
3. Recommended monitoring
4. Alternative options if needed
`;

    const sanitizedPrompt = validateAndSanitizeInput(prompt, { userId });

    const response = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a clinical pharmacist specializing in medication safety. Provide evidence-based medication interaction analysis.`
        },
        {
          role: 'user',
          content: sanitizedPrompt
        }
      ],
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      max_tokens: Math.min(1000, SECURITY_CONFIG.MAX_TOKENS_PER_REQUEST),
      temperature: 0.1
    });

    const rawOutput = response.choices[0]?.message?.content;
    const sanitizedOutput = validateAndSanitizeOutput(rawOutput, { userId });
    
    const duration = Date.now() - startTime;

    // Log AI interaction for audit
    await logAIInteraction({
      userId,
      action: 'medication_interaction_check',
      inputLength: sanitizedPrompt.length,
      outputLength: sanitizedOutput.length,
      tokens: response.usage?.total_tokens || 0,
      duration,
      model: process.env.GROQ_MODEL
    });

    logger.ai('Medication interaction check completed', {
      medicationCount: medications.length,
      duration,
      tokens: response.usage?.total_tokens || 0
    });

    return {
      content: sanitizedOutput,
      modelVersion: process.env.GROQ_MODEL,
      duration,
      securityHash: generateSecurityHash(sanitizedOutput)
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'medication_interaction_check', { userId });
    throw error;
  }
};

// Enhanced helper functions with access control
const getPatientDataForSummary = async (patientId, encounterId, userId) => {
  try {
    // Check user access to patient data
    const hasAccess = await checkUserAccessToPatient(userId, patientId);
    if (!hasAccess) {
      logger.security('Unauthorized access attempt to patient data', {
        userId,
        patientId,
        timestamp: new Date().toISOString()
      });
      return null;
    }
    
    // Get patient basic info
    const patient = await getQuery('SELECT * FROM patients WHERE id = ?', [patientId]);
    
    if (!patient) return null;

    // Get encounter info
    const encounter = encounterId ? 
      await getQuery('SELECT * FROM encounters WHERE id = ? AND patient_id = ?', [encounterId, patientId]) :
      await getQuery('SELECT * FROM encounters WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1', [patientId]);

    // Get vital signs
    const vitalSigns = await allQuery(
      'SELECT * FROM vital_signs WHERE patient_id = ? ORDER BY recorded_at DESC LIMIT 5',
      [patientId]
    );

    // Get medications
    const medications = await allQuery(
      'SELECT * FROM medications WHERE patient_id = ? AND status = "active"',
      [patientId]
    );

    // Get lab results
    const labResults = await allQuery(
      'SELECT * FROM lab_results WHERE patient_id = ? ORDER BY ordered_date DESC LIMIT 10',
      [patientId]
    );

    return {
      patient,
      encounter,
      vitalSigns,
      medications,
      labResults
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'get_patient_data_for_summary');
    throw error;
  }
};

const getPatientDataForDecisionSupport = async (patientId, encounterId, userId) => {
  try {
    const patientData = await getPatientDataForSummary(patientId, encounterId, userId);
    
    if (!patientData) return null;
    
    // Add additional context for decision support
    const criticalResults = await allQuery(
      'SELECT * FROM lab_results WHERE patient_id = ? AND abnormal_flag IN ("high", "critical") ORDER BY ordered_date DESC LIMIT 5',
      [patientId]
    );

    return {
      ...patientData,
      criticalResults
    };
    
  } catch (error) {
    logger.errorWithContext(error, 'get_patient_data_for_decision_support');
    throw error;
  }
};

// Access control helper
const checkUserAccessToPatient = async (userId, patientId) => {
  try {
    // Check if user is admin
    const user = await getQuery('SELECT role FROM users WHERE id = ?', [userId]);
    if (user?.role === 'admin') return true;
    
    // Check if user is assigned to patient
    const assignment = await getQuery(
      'SELECT * FROM user_patient_assignments WHERE user_id = ? AND patient_id = ?',
      [userId, patientId]
    );
    
    return !!assignment;
  } catch (error) {
    logger.errorWithContext(error, 'check_user_access_to_patient');
    return false;
  }
};

// Security utilities
const generateSecurityHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

const logAIInteraction = async (interactionData) => {
  try {
    await runQuery(`
      INSERT INTO ai_interactions (
        user_id, patient_id, encounter_id, action, input_length, 
        output_length, tokens, duration, confidence_score, model, 
        security_hash, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      interactionData.userId,
      interactionData.patientId || null,
      interactionData.encounterId || null,
      interactionData.action,
      interactionData.inputLength,
      interactionData.outputLength,
      interactionData.tokens,
      interactionData.duration,
      interactionData.confidenceScore || null,
      interactionData.model,
      interactionData.securityHash,
      new Date().toISOString()
    ]);
  } catch (error) {
    logger.errorWithContext(error, 'log_ai_interaction');
  }
};

const createSummaryPrompt = (patientData, summaryType) => {
  const { patient, encounter, vitalSigns, medications, labResults } = patientData;
  
  let prompt = `
Patient: ${patient.first_name} ${patient.last_name} (MRN: ${patient.mrn})
Age: ${calculateAge(patient.date_of_birth)}
Gender: ${patient.gender}
Allergies: ${patient.allergies || 'None documented'}

`;

  if (encounter) {
    prompt += `
Encounter Information:
- Type: ${encounter.encounter_type}
- Status: ${encounter.status}
- Chief Complaint: ${encounter.chief_complaint || 'Not documented'}
- Diagnosis: ${encounter.diagnosis || 'Not documented'}
- Treatment Plan: ${encounter.treatment_plan || 'Not documented'}
`;
  }

  if (vitalSigns.length > 0) {
    prompt += `
Recent Vital Signs:
${vitalSigns.map(vs => `- ${new Date(vs.recorded_at).toLocaleDateString()}: BP ${vs.blood_pressure_systolic}/${vs.blood_pressure_diastolic}, HR ${vs.heart_rate}, Temp ${vs.temperature}°C, O2 ${vs.oxygen_saturation}%`).join('\n')}
`;
  }

  if (medications.length > 0) {
    prompt += `
Active Medications:
${medications.map(med => `- ${med.medication_name} ${med.dosage} ${med.frequency} ${med.route}`).join('\n')}
`;
  }

  if (labResults.length > 0) {
    prompt += `
Recent Lab Results:
${labResults.map(lab => `- ${lab.test_name}: ${lab.result_value} ${lab.unit} (${lab.abnormal_flag})`).join('\n')}
`;
  }

  prompt += `
Please generate a comprehensive ${summaryType} summary for this patient.`;

  return prompt;
};

const getSystemPrompt = (summaryType) => {
  const prompts = {
    clinical: `You are an expert clinical documentation assistant. Generate comprehensive, accurate clinical summaries that include:
1. Patient presentation and chief complaint
2. Relevant history and physical findings
3. Diagnostic workup and results
4. Assessment and differential diagnosis
5. Treatment plan and recommendations
6. Follow-up instructions

Use clear, professional medical language while maintaining accuracy and completeness.`,
    
    discharge: `You are an expert discharge planning assistant. Generate comprehensive discharge summaries that include:
1. Admission diagnosis and course of hospitalization
2. Procedures and treatments received
3. Discharge diagnosis and condition
4. Discharge medications with instructions
5. Follow-up appointments and instructions
6. Home care instructions and precautions
7. Emergency contact information

Ensure all information is clear and actionable for patients and caregivers.`,
    
    handoff: `You are an expert handoff communication assistant. Generate concise handoff reports that include:
1. Patient identification and location
2. Current status and active problems
3. Recent events and interventions
4. Current medications and treatments
5. Pending tasks and follow-ups
6. Special considerations and alerts

Focus on essential information for safe patient handoff.`,
    
    progress: `You are an expert progress note assistant. Generate structured progress notes that include:
1. Subjective: Patient's current status and complaints
2. Objective: Vital signs, physical exam, and new findings
3. Assessment: Current problems and clinical impressions
4. Plan: Treatment plan, medications, and next steps

Use SOAP format for clear documentation.`
  };

  return prompts[summaryType] || prompts.clinical;
};

const createPatientCommunicationPrompt = (patient, messageType, context) => {
  const prompts = {
    appointment_reminder: `Generate a friendly appointment reminder for ${patient.first_name} ${patient.last_name}. Include:
- Appointment date and time
- Location and preparation instructions
- Contact information for questions
- Reminder to bring insurance card and ID`,
    
    lab_result: `Generate a clear explanation of lab results for ${patient.first_name} ${patient.last_name}. Include:
- What the test measures
- What the results mean
- Any necessary follow-up
- Contact information for questions`,
    
    medication_reminder: `Generate a medication reminder for ${patient.first_name} ${patient.last_name}. Include:
- Medication name and dosage
- Timing and frequency
- Important instructions
- Side effects to watch for`,
    
    follow_up: `Generate a follow-up care message for ${patient.first_name} ${patient.last_name}. Include:
- Summary of recent care
- Next steps and recommendations
- When to contact the doctor
- Emergency contact information`
  };

  return prompts[messageType] || 'Generate a general patient communication message.';
};

const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const calculateConfidenceScore = (response) => {
  // Simple confidence calculation based on response length and token usage
  const content = response.choices[0]?.message?.content || '';
  const tokens = response.usage?.total_tokens || 0;
  
  // Higher confidence for longer, more detailed responses
  const lengthScore = Math.min(content.length / 1000, 1);
  const tokenScore = Math.min(tokens / 1000, 1);
  
  return Math.round((lengthScore + tokenScore) / 2 * 100);
};

// Get Groq client instance
const getGroqClient = () => {
  return groqClient;
};

// Check if Groq is available
const isGroqAvailable = () => {
  return !!groqClient;
};

module.exports = {
  initializeGroq,
  generateClinicalSummary,
  generateClinicalDecisionSupport,
  generatePatientCommunication,
  checkMedicationInteractions,
  getGroqClient,
  isGroqAvailable
}; 