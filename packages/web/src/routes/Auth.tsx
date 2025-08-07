import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Input } from '../components/forms/Input.tsx';
import { Button } from '../components/forms/Button.tsx';

export default function Auth(){
  const { login, loading } = useAuth();
  const [email,setEmail]=useState('demo@medflect.health');
  const [password,setPassword]=useState('password');
  const [error,setError]=useState('');

  const onSubmit = async (e: React.FormEvent)=>{
    e.preventDefault(); setError('');
    try{ await login(email,password); }catch(err:any){ setError(err?.message||'Login failed'); }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500">Use your clinical account to continue.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block text-sm">Email
          <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-1 w-full"/>
        </label>
        <label className="block text-sm">Password
          <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-1 w-full"/>
        </label>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <Button disabled={loading} className="w-full" variant="primary">{loading?'Signing in...':'Sign in'}</Button>
      </form>
    </div>
  );
}
