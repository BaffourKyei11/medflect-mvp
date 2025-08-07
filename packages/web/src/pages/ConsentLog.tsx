import React from 'react';

export function ConsentLog(){
  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Consent Log</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Date</th>
              <th className="py-2">Clinician</th>
              <th className="py-2">Access Type</th>
              <th className="py-2">Hash ID</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100 dark:border-slate-700">
              <td className="py-2">2025-08-08 09:00</td>
              <td className="py-2">Dr. Abena</td>
              <td className="py-2">Read</td>
              <td className="py-2">0x8a12...f9b3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
