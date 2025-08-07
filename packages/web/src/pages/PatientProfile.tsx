import React from 'react';
import { useParams } from 'react-router-dom';

export function PatientProfile(){
  const { id } = useParams();
  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Patient Profile</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Patient ID: {id}</p>
      <div className="mt-4 grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-slate-500">Age</div>
            <div>—</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Sex</div>
            <div>—</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Vitals</div>
          <div className="text-sm">BP — | HR — | Temp —</div>
        </div>
      </div>
    </div>
  );
}
