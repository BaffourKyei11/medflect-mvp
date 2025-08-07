/**
 * React hook for LLM API interactions in Medflect AI
 */

import { useState, useCallback } from 'react';
import { llmApi, PatientData, ClinicalSummaryRequest } from '../services/llmApi';

export interface LLMState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean | null;
}

export interface UseLLMReturn extends LLMState {
  generateSummary: (request: ClinicalSummaryRequest) => Promise<string | null>;
  getDiagnosticSuggestions: (patientData: PatientData) => Promise<string[] | null>;
  getPatientEducation: (condition: string, language?: string) => Promise<string | null>;
  testConnection: () => Promise<boolean>;
  clearError: () => void;
}

export const useLLM = (): UseLLMReturn => {
  const [state, setState] = useState<LLMState>({
    isLoading: false,
    error: null,
    isConnected: null,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    clearError();
    
    try {
      const connected = await llmApi.testConnection();
      setState(prev => ({ ...prev, isConnected: connected, isLoading: false }));
      return connected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, isConnected: false }));
      return false;
    }
  }, [setLoading, clearError, setError]);

  const generateSummary = useCallback(async (request: ClinicalSummaryRequest): Promise<string | null> => {
    setLoading(true);
    clearError();

    try {
      const summary = await llmApi.generateClinicalSummary(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return summary;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate clinical summary';
      setError(errorMessage);
      return null;
    }
  }, [setLoading, clearError, setError]);

  const getDiagnosticSuggestions = useCallback(async (patientData: PatientData): Promise<string[] | null> => {
    setLoading(true);
    clearError();

    try {
      const suggestions = await llmApi.generateDiagnosticSuggestions(patientData);
      setState(prev => ({ ...prev, isLoading: false }));
      return suggestions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate diagnostic suggestions';
      setError(errorMessage);
      return null;
    }
  }, [setLoading, clearError, setError]);

  const getPatientEducation = useCallback(async (condition: string, language: string = 'en'): Promise<string | null> => {
    setLoading(true);
    clearError();

    try {
      const education = await llmApi.generatePatientEducation(condition, language);
      setState(prev => ({ ...prev, isLoading: false }));
      return education;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate patient education content';
      setError(errorMessage);
      return null;
    }
  }, [setLoading, clearError, setError]);

  return {
    ...state,
    generateSummary,
    getDiagnosticSuggestions,
    getPatientEducation,
    testConnection,
    clearError,
  };
};

export default useLLM;
