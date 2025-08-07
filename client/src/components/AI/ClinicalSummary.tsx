/**
 * AI Clinical Summary Component for Medflect
 * Connects to LLM backend to generate clinical summaries
 */

import React, { useState, useEffect } from 'react';
import { useLLM } from '../../hooks/useLLM';
import { PatientData } from '../../services/llmApi';

interface ClinicalSummaryProps {
  patientData: PatientData;
  summaryType: 'admission' | 'progress' | 'discharge' | 'handoff';
  onSummaryGenerated?: (summary: string) => void;
  className?: string;
}

// Sample patient data for demo
const samplePatientData: PatientData = {
  id: 'PT-001',
  name: 'Kwame Asante',
  age: 45,
  gender: 'Male',
  chiefComplaint: 'Chest pain and shortness of breath for 2 days',
  vitals: {
    temperature: 37.2,
    bloodPressure: '150/95',
    heartRate: 88,
    respiratoryRate: 20,
    oxygenSaturation: 96,
  },
  symptoms: ['chest pain', 'shortness of breath', 'fatigue', 'mild sweating'],
  medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
  currentMedications: ['Lisinopril 10mg daily', 'Metformin 500mg twice daily'],
  labResults: {
    'Hemoglobin': '12.5 g/dL',
    'White Blood Cells': '7,200/μL',
    'Glucose': '145 mg/dL',
    'Creatinine': '1.1 mg/dL',
  },
  notes: 'Patient reports gradual onset of chest discomfort, worse with exertion. No radiation to arms. Associated with mild dyspnea. Denies nausea or vomiting. Has been taking medications regularly.',
};

export const ClinicalSummary: React.FC<ClinicalSummaryProps> = ({
  patientData = samplePatientData,
  summaryType,
  onSummaryGenerated,
  className = '',
}) => {
  const [summary, setSummary] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  
  const {
    generateSummary,
    getDiagnosticSuggestions,
    testConnection,
    isLoading,
    error,
    isConnected,
    clearError,
  } = useLLM();

  // Test connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await testConnection();
      setConnectionStatus(connected ? 'connected' : 'disconnected');
    };
    checkConnection();
  }, [testConnection]);

  const handleGenerateSummary = async () => {
    clearError();
    
    const summaryResult = await generateSummary({
      patientData,
      summaryType,
      context: `Generate ${summaryType} summary for 37 Military Hospital, Accra, Ghana`,
    });

    if (summaryResult) {
      setSummary(summaryResult);
      onSummaryGenerated?.(summaryResult);
    }
  };

  const handleGetDiagnosticSuggestions = async () => {
    clearError();
    
    const suggestions = await getDiagnosticSuggestions(patientData);
    
    if (suggestions && suggestions.length > 0) {
      const suggestionsText = `Differential Diagnoses to Consider:\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
      setSummary(prev => prev ? `${prev}\n\n${suggestionsText}` : suggestionsText);
    }
  };

  const getSummaryTypeLabel = (type: string) => {
    const labels = {
      admission: 'Admission Summary',
      progress: 'Progress Note',
      discharge: 'Discharge Summary',
      handoff: 'Handoff Report',
    };
    return labels[type as keyof typeof labels] || 'Clinical Summary';
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'AI Connected';
      case 'disconnected': return 'AI Disconnected';
      default: return 'Checking AI...';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              🧠 AI Clinical Assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {getSummaryTypeLabel(summaryType)} • Patient: {patientData.name}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 text-sm ${getConnectionStatusColor()}`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span>{getConnectionStatusText()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Info Summary */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Chief Complaint:</span>
            <p className="text-gray-900 dark:text-white mt-1">{patientData.chiefComplaint}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Vitals:</span>
            <p className="text-gray-900 dark:text-white mt-1">
              BP: {patientData.vitals.bloodPressure}, HR: {patientData.vitals.heartRate}, Temp: {patientData.vitals.temperature}°C
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Age/Gender:</span>
            <p className="text-gray-900 dark:text-white mt-1">{patientData.age}y {patientData.gender}</p>
          </div>
        </div>
        
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-teal-600 hover:text-teal-700 text-sm mt-3 font-medium"
          >
            View Full Patient Data →
          </button>
        )}
        
        {isExpanded && (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Symptoms:</span>
              <p className="text-gray-900 dark:text-white">{patientData.symptoms.join(', ')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Medical History:</span>
              <p className="text-gray-900 dark:text-white">{patientData.medicalHistory.join(', ')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Current Medications:</span>
              <p className="text-gray-900 dark:text-white">{patientData.currentMedications.join(', ')}</p>
            </div>
            {patientData.labResults && (
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Lab Results:</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {Object.entries(patientData.labResults).map(([key, value]) => (
                    <div key={key} className="text-gray-900 dark:text-white">
                      {key}: {value}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              ← Hide Details
            </button>
          </div>
        )}
      </div>

      {/* AI Controls */}
      <div className="p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading || connectionStatus !== 'connected'}
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span>🧠</span>
                <span>Generate {getSummaryTypeLabel(summaryType)}</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleGetDiagnosticSuggestions}
            disabled={isLoading || connectionStatus !== 'connected'}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span>🔍</span>
            <span>Get Diagnostic Suggestions</span>
          </button>
          
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <span>🔗</span>
            <span>Test Connection</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">⚠️</span>
              <span className="text-red-700 dark:text-red-300 font-medium">AI Error:</span>
            </div>
            <p className="text-red-600 dark:text-red-400 mt-1 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm mt-2 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* AI-Generated Summary */}
        {summary && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-teal-600 dark:text-teal-400">🤖</span>
              <span className="font-medium text-teal-800 dark:text-teal-200">AI-Generated Clinical Summary</span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{summary}</pre>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-teal-200 dark:border-teal-700">
              <span className="text-xs text-teal-600 dark:text-teal-400">
                Generated by Medflect AI • {new Date().toLocaleString()}
              </span>
              <div className="flex space-x-2">
                <button className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium">
                  Copy Summary
                </button>
                <button className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium">
                  Save to EHR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Usage Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">ℹ️</span>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Medflect AI Clinical Assistant</p>
              <p>This AI assistant helps generate clinical summaries, diagnostic suggestions, and patient education content. All outputs should be reviewed by qualified healthcare professionals before use in patient care.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalSummary;
