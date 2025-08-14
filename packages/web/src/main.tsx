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
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import Patients from './routes/Patients.tsx';
import PatientDetail from './routes/PatientDetail.tsx';
import AISummary from './routes/AISummary.tsx';
import ConsentAudit from './routes/ConsentAudit.tsx';
import Sync from './routes/Sync.tsx';
import Dashboard from './routes/Dashboard.tsx';
import { SyncIndicator } from './components/SyncIndicator.tsx';
import Landing from './pages/Landing.tsx';
import Home from './pages/Home.tsx';
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
          <Route path="/landing" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/patients/:id/ai" element={<AISummary />} />
          <Route path="/consent" element={<ConsentAudit />} />
          <Route path="/audit" element={<ConsentAudit />} />
          <Route path="/sync" element={<Sync />} />
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
