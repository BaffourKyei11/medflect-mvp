import React from 'react';

export const Table: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500">
          {headers.map(h => <th key={h} className="py-2">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  </div>
);
