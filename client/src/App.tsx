import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Styles
import './index.css';

// Lazy-loaded feature pages for FHIR, Consent, Audit
const PatientList = lazy(() => import('./pages/FHIR/PatientList'));
const ObservationList = lazy(() => import('./pages/FHIR/ObservationList'));
const EncounterList = lazy(() => import('./pages/FHIR/EncounterList'));
const ConsentDashboard = lazy(() => import('./pages/Consent/ConsentDashboard'));
const AuditLog = lazy(() => import('./pages/Audit/AuditLog'));

// AI Dashboard Component (inline for now)
const AIDashboard = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testLLMConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      const response = await fetch('http://91.108.112.45:4000/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-npvlOAYvZsy6iRqqtM5PNA',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: 'Hello! This is a connection test for Medflect AI clinical assistant. Please respond with a brief greeting.' }
          ],
          max_tokens: 100,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        setAiResponse(data.choices?.[0]?.message?.content || 'Connection successful!');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setAiResponse(`Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const generateClinicalSummary = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://91.108.112.45:4000/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-npvlOAYvZsy6iRqqtM5PNA',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert clinical AI assistant for Medflect, designed for Ghanaian healthcare settings. Generate professional clinical summaries.'
            },
            {
              role: 'user',
              content: `Generate an admission summary for a 45-year-old male patient named Kwame Asante presenting with chest pain and shortness of breath for 2 days. Vitals: BP 150/95, HR 88, Temp 37.2°C, RR 20, O2Sat 96%. Medical history includes hypertension and type 2 diabetes. Current medications: Lisinopril 10mg daily, Metformin 500mg twice daily. Patient reports gradual onset of chest discomfort, worse with exertion, associated with mild dyspnea.`
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponse(data.choices?.[0]?.message?.content || 'Summary generated successfully!');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setAiResponse(`Failed to generate summary: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ LLM Connected';
      case 'connecting': return '🔄 Connecting...';
      case 'error': return '❌ Connection Failed';
      default: return '⚪ Not Connected';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🧠 Medflect AI Clinical Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            AI-Powered Clinical Decision Support for 37 Military Hospital, Accra
          </p>
          
          {/* Connection Status */}
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm ${getStatusColor()}`}>
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Controls</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Test and use the LiteLLM backend connection
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <button
                onClick={testLLMConnection}
                disabled={isConnecting}
                className="w-full flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Test LLM Connection</span>
                  </>
                )}
              </button>
              
              <button
                onClick={generateClinicalSummary}
                disabled={isLoading || connectionStatus !== 'connected'}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Generate Clinical Summary</span>
                  </>
                )}
              </button>
              
              {/* Sample Patient Info */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sample Patient</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Name:</strong> Kwame Asante</p>
                  <p><strong>Age:</strong> 45y Male</p>
                  <p><strong>Chief Complaint:</strong> Chest pain and shortness of breath</p>
                  <p><strong>Vitals:</strong> BP 150/95, HR 88, Temp 37.2°C</p>
                  <p><strong>History:</strong> Hypertension, Type 2 Diabetes</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Response Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Response</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                LiteLLM Backend: http://91.108.112.45:4000
              </p>
            </div>
            
            <div className="p-6">
              {aiResponse ? (
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-teal-600 dark:text-teal-400">🤖</span>
                    <span className="font-medium text-teal-800 dark:text-teal-200">AI Generated Content</span>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{aiResponse}</pre>
                  </div>
                  <div className="mt-4 pt-3 border-t border-teal-200 dark:border-teal-700">
                    <span className="text-xs text-teal-600 dark:text-teal-400">
                      Generated: {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-4">🤖</div>
                  <p>Click "Test LLM Connection" to verify backend connectivity</p>
                  <p className="text-sm mt-2">Then try "Generate Clinical Summary" to see AI in action</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Backend Info */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backend Integration Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">LiteLLM Endpoint:</span>
                <p className="text-gray-900 dark:text-white font-mono">http://91.108.112.45:4000</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Virtual Key:</span>
                <p className="text-gray-900 dark:text-white font-mono">sk-npvlOAYvZsy6iRqqtM5PNA</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                <p className="text-gray-900 dark:text-white">GPT-3.5-turbo</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                <p className={`font-medium ${getStatusColor()}`}>{getStatusText()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-teal-600 hover:text-teal-700 font-medium">
            ← Back to Landing Page
          </a>
        </div>
      </div>
    </div>
  );
};

// Simple Landing Component
const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Medflect</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered Clinical
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                {' '}Decision Support
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Empowering Ghanaian healthcare workers with intelligent clinical decision support, 
              patient management, and diagnostic assistance. Available offline, accessible everywhere.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/ai" className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl">
                <span>🧠</span>
                <span>Try AI Clinical Assistant</span>
                <span>→</span>
              </a>
              
              <a href="/dashboard" className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700">
                <span>📊</span>
                <span>View Dashboard</span>
                <span>→</span>
              </a>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Works Offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Mobile Optimized</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Multi-language Support</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Comprehensive Clinical Tools
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need for modern healthcare delivery in one integrated platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🧠',
                  title: 'AI Diagnostic Assistant',
                  description: 'Advanced machine learning algorithms help identify potential diagnoses based on patient symptoms, medical history, and clinical findings.'
                },
                {
                  icon: '👥',
                  title: 'Patient Management',
                  description: 'Comprehensive patient records, appointment scheduling, and treatment tracking with secure data synchronization.'
                },
                {
                  icon: '🛡️',
                  title: 'Clinical Guidelines',
                  description: 'Access to evidence-based treatment protocols and clinical guidelines tailored for Ghanaian healthcare settings.'
                },
                {
                  icon: '📱',
                  title: 'Mobile-First Design',
                  description: 'Optimized for smartphones and tablets with offline capabilities for areas with limited internet connectivity.'
                },
                {
                  icon: '📊',
                  title: 'Real-time Monitoring',
                  description: 'Track patient vitals, medication adherence, and treatment outcomes with intelligent alerts and notifications.'
                },
                {
                  icon: '🚨',
                  title: 'Emergency Protocols',
                  description: 'Quick access to emergency procedures, drug dosage calculators, and critical care guidelines.'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-600">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Clinical Practice?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Join thousands of healthcare professionals using Medflect to deliver better patient care
            </p>
            <a href="/ai" className="inline-block bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl">
              🚀 Launch AI Assistant
            </a>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold">Medflect</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering healthcare professionals with AI-powered clinical decision support tools designed for the Ghanaian healthcare system.
            </p>
            <p className="text-gray-400">
              © 2024 Medflect. All rights reserved. Built for Ghanaian healthcare professionals.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1f2937',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Suspense fallback={<div className="p-8 text-center text-xl">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/ai" element={<AIDashboard />} />
            <Route path="/fhir/patients" element={<PatientList />} />
            <Route path="/fhir/observations" element={<ObservationList />} />
            <Route path="/fhir/encounters" element={<EncounterList />} />
            <Route path="/consent" element={<ConsentDashboard />} />
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/dashboard" element={<AIDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
