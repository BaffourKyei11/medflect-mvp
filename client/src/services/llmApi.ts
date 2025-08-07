/**
 * LiteLLM API Service for Medflect AI
 * Connects to the backend LLM endpoint for clinical AI features
 */

const LLM_ENDPOINT = 'http://91.108.112.45:4000';
const VIRTUAL_KEY = 'sk-npvlOAYvZsy6iRqqtM5PNA';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  vitals: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
  symptoms: string[];
  medicalHistory: string[];
  currentMedications: string[];
  labResults?: {
    [key: string]: string | number;
  };
  notes: string;
}

export interface ClinicalSummaryRequest {
  patientData: PatientData;
  summaryType: 'admission' | 'progress' | 'discharge' | 'handoff';
  context?: string;
}

class LLMApiService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = LLM_ENDPOINT;
    this.apiKey = VIRTUAL_KEY;
  }

  /**
   * Make a request to the LiteLLM endpoint
   */
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LLM API request failed:', error);
      throw error;
    }
  }

  /**
   * Generate clinical summary using AI
   */
  async generateClinicalSummary(request: ClinicalSummaryRequest): Promise<string> {
    const { patientData, summaryType, context } = request;

    const systemPrompt = `You are an expert clinical AI assistant for Medflect, designed specifically for Ghanaian healthcare settings. You help doctors and nurses by generating accurate, concise clinical summaries.

Key Guidelines:
- Use clear, professional medical language
- Focus on clinically relevant information
- Include vital signs, symptoms, and assessment
- Consider Ghanaian healthcare context and common conditions
- Be concise but comprehensive
- Always maintain patient confidentiality
- Format for easy reading by healthcare professionals

Patient Context: ${context || 'Standard clinical assessment'}`;

    const userPrompt = `Generate a ${summaryType} summary for the following patient:

Patient Information:
- Name: ${patientData.name}
- Age: ${patientData.age} years
- Gender: ${patientData.gender}
- Chief Complaint: ${patientData.chiefComplaint}

Vital Signs:
- Temperature: ${patientData.vitals.temperature}°C
- Blood Pressure: ${patientData.vitals.bloodPressure}
- Heart Rate: ${patientData.vitals.heartRate} bpm
- Respiratory Rate: ${patientData.vitals.respiratoryRate} breaths/min
- Oxygen Saturation: ${patientData.vitals.oxygenSaturation}%

Symptoms: ${patientData.symptoms.join(', ')}
Medical History: ${patientData.medicalHistory.join(', ')}
Current Medications: ${patientData.currentMedications.join(', ')}

${patientData.labResults ? `Lab Results: ${JSON.stringify(patientData.labResults, null, 2)}` : ''}

Clinical Notes: ${patientData.notes}

Please generate a professional ${summaryType} summary that would be useful for the next healthcare provider.`;

    const llmRequest: LLMRequest = {
      model: 'gpt-3.5-turbo', // Default model, can be configured
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent medical responses
      max_tokens: 1000,
    };

    const response: LLMResponse = await this.makeRequest('/chat/completions', llmRequest);
    
    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }
    
    throw new Error('No response generated from LLM');
  }

  /**
   * Generate diagnostic suggestions
   */
  async generateDiagnosticSuggestions(patientData: PatientData): Promise<string[]> {
    const systemPrompt = `You are a clinical decision support AI for Medflect, specialized in Ghanaian healthcare. Provide differential diagnosis suggestions based on patient presentation.

Guidelines:
- Consider common conditions in Ghana/West Africa
- Include tropical diseases when relevant
- Rank by likelihood based on symptoms
- Be specific but cautious
- Always recommend further clinical evaluation
- Consider resource constraints in Ghanaian healthcare settings`;

    const userPrompt = `Based on this patient presentation, suggest possible diagnoses to consider:

Patient: ${patientData.age}-year-old ${patientData.gender}
Chief Complaint: ${patientData.chiefComplaint}
Symptoms: ${patientData.symptoms.join(', ')}
Vital Signs: BP ${patientData.vitals.bloodPressure}, HR ${patientData.vitals.heartRate}, Temp ${patientData.vitals.temperature}°C
Medical History: ${patientData.medicalHistory.join(', ')}

Provide 3-5 differential diagnoses ranked by likelihood. Format as a simple list.`;

    const llmRequest: LLMRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 500,
    };

    const response: LLMResponse = await this.makeRequest('/chat/completions', llmRequest);
    
    if (response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content;
      // Parse the response into an array of suggestions
      return content.split('\n').filter(line => line.trim()).map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
    
    return [];
  }

  /**
   * Generate patient education content
   */
  async generatePatientEducation(condition: string, language: string = 'en'): Promise<string> {
    const systemPrompt = `You are a patient education AI for Medflect, creating clear, culturally appropriate health information for Ghanaian patients.

Guidelines:
- Use simple, non-technical language
- Be culturally sensitive to Ghanaian context
- Include practical advice for local conditions
- Be encouraging and supportive
- Focus on actionable steps
- Consider resource availability in Ghana`;

    const userPrompt = `Create patient education content about "${condition}" in ${language === 'en' ? 'English' : language}. 

Include:
1. What the condition is (simple explanation)
2. Common symptoms to watch for
3. Treatment recommendations
4. When to seek immediate care
5. Prevention tips
6. Lifestyle modifications

Keep it practical for patients in Ghana.`;

    const llmRequest: LLMRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 800,
    };

    const response: LLMResponse = await this.makeRequest('/chat/completions', llmRequest);
    
    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }
    
    throw new Error('No patient education content generated');
  }

  /**
   * Test connection to LLM endpoint
   */
  async testConnection(): Promise<boolean> {
    try {
      const testRequest: LLMRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, this is a connection test for Medflect AI.' }
        ],
        max_tokens: 50,
      };

      await this.makeRequest('/chat/completions', testRequest);
      return true;
    } catch (error) {
      console.error('LLM connection test failed:', error);
      return false;
    }
  }
}

export const llmApi = new LLMApiService();
export default llmApi;
