import React from 'react';

const PatientList: React.FC = () => {
  // TODO: Fetch and display patient list from /api/fhir/patient
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Patients</h1>
      <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
        <p className="text-gray-500">FHIR Patient list UI coming soon...</p>
      </div>
    </div>
  );
};

export default PatientList;
