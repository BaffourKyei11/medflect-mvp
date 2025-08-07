import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Mode = 'light' | 'dark' | 'system';

type ThemeCtx = { mode: Mode; setMode: (m: Mode) => void; isDark: boolean };

const Ctx = createContext<ThemeCtx | undefined>(undefined);

function applyMode(mode: Mode){
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = mode === 'system' ? prefersDark : mode === 'dark';
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('theme.mode') as Mode) || 'system');

  useEffect(() => {
    localStorage.setItem('theme.mode', mode);
    applyMode(mode);
  }, [mode]);

  useEffect(()=>{
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { const saved = (localStorage.getItem('theme.mode') as Mode) || 'system'; applyMode(saved); };
    mq.addEventListener?.('change', handler);
    return ()=> mq.removeEventListener?.('change', handler);
  },[]);

  const isDark = useMemo(()=>{
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return mode === 'system' ? prefersDark : mode === 'dark';
  }, [mode]);

  const value = useMemo(()=>({ mode, setMode, isDark }), [mode, isDark]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTheme = () => {
  const v = useContext(Ctx);
  if(!v) throw new Error('useTheme must be used within ThemeProvider');
  return v;
};
