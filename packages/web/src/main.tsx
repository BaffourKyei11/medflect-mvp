import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { Navbar } from './modules/nav/Navbar.tsx';
import { BottomNav } from './modules/nav/BottomNav.tsx';
import { OfflineIndicator } from './modules/status/OfflineIndicator.tsx';
import { NotFound } from './pages/NotFound.tsx';
import { ThemeToggle } from './modules/theme/ThemeToggle.tsx';
import { registerSW } from 'virtual:pwa-register';
import { AuthProvider, Private } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import Auth from './routes/Auth.tsx';
import Patients from './routes/Patients.tsx';
import PatientDetail from './routes/PatientDetail.tsx';
import AISummary from './routes/AISummary.tsx';
import Consent from './routes/Consent.tsx';
import Audit from './routes/Audit.tsx';
import Sync from './routes/Sync.tsx';
import Dashboard from './routes/Dashboard.tsx';
import { SyncIndicator } from './components/SyncIndicator.tsx';
import Landing from './pages/Landing.tsx';
import { ChatbotWidget } from './components/chat/ChatbotWidget.tsx';

registerSW({ immediate: true });

function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar right={<ThemeToggle />} />
      <OfflineIndicator />
      <SyncIndicator />
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
          <Route path="/login" element={<Auth />} />
          <Route path="/patients" element={<Private><Patients /></Private>} />
          <Route path="/patients/:id" element={<Private><PatientDetail /></Private>} />
          <Route path="/patients/:id/ai" element={<Private><AISummary /></Private>} />
          <Route path="/consent" element={<Private><Consent /></Private>} />
          <Route path="/audit" element={<Private><Audit /></Private>} />
          <Route path="/sync" element={<Private><Sync /></Private>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <ChatbotWidget />
      <BottomNav />
      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">&copy; {new Date().getFullYear()} Medflect</footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
