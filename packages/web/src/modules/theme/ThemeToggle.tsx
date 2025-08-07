import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';

export function ThemeToggle(){
  const { mode, setMode, isDark } = useTheme();

  const next = () => {
    const order: Array<'light'|'dark'|'system'> = ['light','dark','system'];
    const idx = order.indexOf(mode);
    const nextMode = order[(idx+1)%order.length];
    setMode(nextMode);
  };

  const Icon = mode==='system' ? Monitor : (isDark ? Sun : Moon);
  const label = mode==='system' ? 'System' : (isDark ? 'Light' : 'Dark');

  return (
    <button className="btn" aria-label="Toggle theme mode" onClick={next} title={`Theme: ${mode}`}>
      <Icon size={18} />
      <span className="hidden sm:inline">{label} mode</span>
    </button>
  );
}
