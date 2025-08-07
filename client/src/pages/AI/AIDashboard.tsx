/**
 * AI Dashboard for Medflect - Clinical AI Features
 * Showcases LLM-powered clinical decision support tools
 */

import React, { useState } from 'react';
import ClinicalSummary from '../../components/AI/ClinicalSummary';
import { PatientData } from '../../services/llmApi';

// Sample patients for demo
const samplePatients: PatientData[] = [
  {
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
  },
  {
    id: 'PT-002',
    name: 'Akosua Mensah',
    age: 28,
    gender: 'Female',
    chiefComplaint: 'Fever, headache, and joint pain for 3 days',
    vitals: {
      temperature: 38.5,
      bloodPressure: '110/70',
      heartRate: 102,
      respiratoryRate: 18,
      oxygenSaturation: 98,
    },
    symptoms: ['fever', 'headache', 'joint pain', 'fatigue', 'loss of appetite'],
    medicalHistory: ['No significant medical history'],
    currentMedications: ['Paracetamol 500mg as needed'],
    labResults: {
      'Hemoglobin': '11.8 g/dL',
      'White Blood Cells': '12,500/μL',
      'Platelets': '180,000/μL',
      'Malaria RDT': 'Negative',
    },
    notes: 'Patient presents with acute febrile illness. Denies recent travel. No rash observed. Joints appear normal on examination. Considering viral syndrome vs bacterial infection.',
  },
  {
    id: 'PT-003',
    name: 'Yaw Osei',
    age: 65,
    gender: 'Male',
    chiefComplaint: 'Difficulty breathing and swollen legs for 1 week',
    vitals: {
      temperature: 36.8,
      bloodPressure: '160/100',
      heartRate: 95,
      respiratoryRate: 24,
      oxygenSaturation: 92,
    },
    symptoms: ['shortness of breath', 'leg swelling', 'fatigue', 'orthopnea'],
    medicalHistory: ['Hypertension', 'Previous MI (2019)', 'Diabetes'],
    currentMedications: ['Amlodipine 5mg daily', 'Atorvastatin 20mg daily', 'Aspirin 75mg daily'],
    labResults: {
      'BNP': '850 pg/mL',
      'Creatinine': '1.4 mg/dL',
      'Hemoglobin': '10.2 g/dL',
    },
    notes: 'Patient with known cardiovascular disease presenting with signs of heart failure. Bilateral pedal edema noted. Chest X-ray shows cardiomegaly.',
  },
];

const AIDashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<PatientData>(samplePatients[0]);
  const [summaryType, setSummaryType] = useState<'admission' | 'progress' | 'discharge' | 'handoff'>('admission');
  const [generatedSummaries, setGeneratedSummaries] = useState<{ [key: string]: string }>({});

  const handleSummaryGenerated = (summary: string) => {
    const key = `${selectedPatient.id}-${summaryType}`;
    setGeneratedSummaries(prev => ({ ...prev, [key]: summary }));
  };

  const getPatientStatusColor = (patient: PatientData) => {
    const temp = patient.vitals.temperature;
    const hr = patient.vitals.heartRate;
    const o2sat = patient.vitals.oxygenSaturation;
    
    if (temp > 38 || hr > 100 || o2sat < 95) return 'border-red-200 bg-red-50';
    if (temp > 37.5 || hr > 90 || o2sat < 97) return 'border-yellow-200 bg-yellow-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧠 Medflect AI Clinical Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            AI-powered clinical decision support for 37 Military Hospital, Accra
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <span className="text-teal-600 dark:text-teal-400 text-xl">🤖</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Summaries</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {Object.keys(generatedSummaries).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-blue-600 dark:text-blue-400 text-xl">👥</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Patients</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{samplePatients.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <span className="text-green-600 dark:text-green-400 text-xl">⚡</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">2.3s</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-purple-600 dark:text-purple-400 text-xl">🎯</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">94.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Patient
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Choose a patient for AI analysis
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {samplePatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedPatient.id === patient.id
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                          : `${getPatientStatusColor(patient)} dark:bg-gray-700 dark:border-gray-600 hover:border-teal-300`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {patient.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {patient.age}y {patient.gender} • {patient.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {patient.vitals.temperature}°C
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            HR: {patient.vitals.heartRate}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                        {patient.chiefComplaint}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Summary Type Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Summary Type
                  </label>
                  <select
                    value={summaryType}
                    onChange={(e) => setSummaryType(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="admission">Admission Summary</option>
                    <option value="progress">Progress Note</option>
                    <option value="discharge">Discharge Summary</option>
                    <option value="handoff">Handoff Report</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span>📋</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Generate Report</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Create comprehensive report</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span>🔍</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Drug Interactions</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Check medication safety</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span>📚</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Patient Education</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Generate education materials</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main AI Assistant Panel */}
          <div className="lg:col-span-2">
            <ClinicalSummary
              patientData={selectedPatient}
              summaryType={summaryType}
              onSummaryGenerated={handleSummaryGenerated}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>🏥</span>
            <span>37 Military Hospital, Accra • Medflect AI v1.0 • LiteLLM Backend Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
