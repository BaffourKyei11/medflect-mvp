import React from 'react';
import { Link } from 'react-router-dom';

export function NotFound(){
  return (
    <div className="card text-center">
      <h2 className="text-lg font-semibold">Page not found</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">The page you are looking for does not exist.</p>
      <Link className="btn btn-primary mt-3 inline-block" to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}
