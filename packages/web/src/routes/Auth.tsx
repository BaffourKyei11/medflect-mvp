import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Input } from '../components/forms/Input.tsx';
import { Button } from '../components/forms/Button.tsx';

export default function Auth({ inline = false }: { inline?: boolean }){
  const { login, register, loading } = useAuth();
  const [email,setEmail]=useState('demo@medflect.health');
  const [password,setPassword]=useState('password');
  const [name,setName]=useState('');
  const [isSignup,setIsSignup]=useState(false);
  const [error,setError]=useState('');

  const onSubmit = async (e: React.FormEvent)=>{
    e.preventDefault(); setError('');
    try{
      if (isSignup) {
        await register(email, password, name || undefined);
      } else {
        await login(email,password);
      }
    }catch(err:any){ setError(err?.message|| (isSignup ? 'Registration failed' : 'Login failed')); }
  };

  return (
    <div className={inline ? '' : 'relative'}>
      {!inline && (<div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-900/30" />)}
      <div className={(inline ? '' : 'mx-auto mt-16 ') + 'max-w-md rounded-xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/70'}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{isSignup ? 'Register to access the Medflect dashboard.' : 'Use your clinical account to continue.'}</p>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {isSignup && (
            <label className="block text-sm">Name
              <Input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="mt-1 w-full"/>
            </label>
          )}
          <label className="block text-sm">Email
            <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-1 w-full"/>
          </label>
          <label className="block text-sm">Password
            <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 w-full"/>
          </label>
          {error && <div className="text-sm text-red-600 dark:text-rose-400">{error}</div>}
          <Button disabled={loading} className="w-full" variant="primary">{loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Sign up' : 'Sign in')}</Button>
        </form>
        {!isSignup && (
          <div className="mt-3 space-y-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={loading}
              onClick={async ()=>{
                setError('');
                try {
                  await login('demo@medflect.health','password');
                } catch(e1:any){
                  try {
                    // ensure demo user exists then login again
                    await register('demo@medflect.health','password','Demo User');
                    await login('demo@medflect.health','password');
                  } catch(e2:any){
                    setError(e2?.message || e1?.message || 'Demo sign-in failed');
                  }
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign in with demo'}
            </Button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">Demo: demo@medflect.health / password</p>
          </div>
        )}
        <div className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
          {isSignup ? (
            <span>
              Already have an account?{' '}
              <button type="button" className="font-medium text-sky-600 hover:underline dark:text-sky-400" onClick={()=>{ setIsSignup(false); setError(''); }}>
                Sign in
              </button>
            </span>
          ) : (
            <span>
              New here?{' '}
              <button type="button" className="font-medium text-sky-600 hover:underline dark:text-sky-400" onClick={()=>{ setIsSignup(true); setError(''); }}>
                Create an account
              </button>
            </span>
          )}
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Secure access • JWT sessions • Offline‑aware UI</p>
      </div>
    </div>
  );
}
