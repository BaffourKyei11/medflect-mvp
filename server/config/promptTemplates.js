// Modular prompt templates for LLM summarization (A/B testing, versioned)

const promptTemplates = {
  clinical: {
    v1: ({ patient, encounter, vitalSigns, medications, labResults }) => `
Patient: ${patient.first_name} ${patient.last_name} (MRN: ${patient.mrn})
Age: ${patient.date_of_birth}  Gender: ${patient.gender}
Allergies: ${patient.allergies || "None documented"}

${encounter ? `Encounter: ${encounter.encounter_type}, Status: ${encounter.status}, Chief Complaint: ${encounter.chief_complaint || "Not documented"}` : ""}

${medications.length > 0 ? `Active Medications:\n${medications.map(med => `- ${med.medication_name} ${med.dosage} ${med.frequency} ${med.route}`).join('\n')}` : "No active medications."}

${labResults.length > 0 ? `Recent Labs:\n${labResults.map(lab => `- ${lab.test_name}: ${lab.result_value} ${lab.unit} (${lab.abnormal_flag})`).join('\n')}` : "No recent labs."}

Please generate a comprehensive clinical summary for this patient.`,
    v2: ({ patient, encounter, vitalSigns, medications, labResults }) => `
[Patient Context]
Name: ${patient.first_name} ${patient.last_name} (MRN: ${patient.mrn})
DOB: ${patient.date_of_birth}  Gender: ${patient.gender}
Allergies: ${patient.allergies || "None"}
${encounter ? `\n[Encounter]\nType: ${encounter.encounter_type}\nStatus: ${encounter.status}\nChief Complaint: ${encounter.chief_complaint || "Not documented"}` : ""}
${medications.length > 0 ? `\n[Medications]\n${medications.map(med => `- ${med.medication_name} ${med.dosage} ${med.frequency} ${med.route}`).join('\n')}` : ""}
${labResults.length > 0 ? `\n[Lab Results]\n${labResults.map(lab => `- ${lab.test_name}: ${lab.result_value} ${lab.unit} (${lab.abnormal_flag})`).join('\n')}` : ""}
\nTask: Write a clear, concise clinical summary for this patient for use in a Ghanaian hospital.`,
  },
  discharge: {
    v1: ({ patient, encounter, medications, labResults }) => `
Patient: ${patient.first_name} ${patient.last_name} (MRN: ${patient.mrn})
Discharge Summary for Encounter: ${encounter?.encounter_type || "N/A"}
Diagnosis: ${encounter?.diagnosis || "Not documented"}
Medications on Discharge: ${medications.map(med => `- ${med.medication_name} ${med.dosage} ${med.frequency}`).join('\n')}
Recent Labs: ${labResults.map(lab => `- ${lab.test_name}: ${lab.result_value} ${lab.unit}`).join('\n')}
Instructions: Please summarize the discharge plan and follow-up for this patient.`,
  },
  handoff: {
    v1: ({ patient, encounter }) => `
Patient: ${patient.first_name} ${patient.last_name} (MRN: ${patient.mrn})
Handoff for: ${encounter?.encounter_type || "N/A"}
Chief Complaint: ${encounter?.chief_complaint || "Not documented"}
Current Status: ${encounter?.status || "Unknown"}
Please summarize the key handoff points for this patient.`,
  },
};

module.exports = promptTemplates;
