import { 
  Patient, 
  Encounter, 
  VitalSigns, 
  Medication, 
  LabResult, 
  User, 
  PatientListItem, 
  DashboardStats,
  ConsentLog,
  Appointment,
  Notification
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'dr.mensah@37military.gov.gh',
    firstName: 'Kwame',
    lastName: 'Mensah',
    role: 'doctor',
    department: 'Internal Medicine',
    licenseNumber: 'MD-2023-001',
    phone: '+233 24 123 4567',
    isActive: true,
    lastLogin: '2024-01-15T08:30:00Z',
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'user-002',
    email: 'nurse.adwoa@37military.gov.gh',
    firstName: 'Adwoa',
    lastName: 'Osei',
    role: 'nurse',
    department: 'Emergency Department',
    phone: '+233 20 987 6543',
    isActive: true,
    lastLogin: '2024-01-15T07:45:00Z',
    createdAt: '2023-03-20T00:00:00Z',
    updatedAt: '2024-01-15T07:45:00Z'
  },
  {
    id: 'user-003',
    email: 'admin@37military.gov.gh',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    department: 'IT',
    isActive: true,
    lastLogin: '2024-01-15T06:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T06:00:00Z'
  }
];

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: 'patient-001',
    mrn: 'MRN-2024-001',
    firstName: 'Ama',
    lastName: 'Kufuor',
    dateOfBirth: '1985-03-15',
    gender: 'female',
    phone: '+233 26 111 2222',
    email: 'ama.kufuor@email.com',
    address: '123 Ring Road, Accra, Ghana',
    emergencyContact: 'Kofi Kufuor',
    emergencyPhone: '+233 24 333 4444',
    bloodType: 'O+',
    allergies: 'Penicillin, Sulfa drugs',
    medicalHistory: 'Hypertension, Type 2 Diabetes',
    insuranceInfo: 'NHIS: 1234567890',
    consentToken: 'consent-001',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'patient-002',
    mrn: 'MRN-2024-002',
    firstName: 'Kofi',
    lastName: 'Addo',
    dateOfBirth: '1978-07-22',
    gender: 'male',
    phone: '+233 20 555 6666',
    address: '456 Cantonments Road, Accra, Ghana',
    emergencyContact: 'Efua Addo',
    emergencyPhone: '+233 27 777 8888',
    bloodType: 'A+',
    allergies: 'None known',
    medicalHistory: 'Asthma, Peptic ulcer disease',
    insuranceInfo: 'NHIS: 0987654321',
    consentToken: 'consent-002',
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'patient-003',
    mrn: 'MRN-2024-003',
    firstName: 'Efua',
    lastName: 'Mensah',
    dateOfBirth: '1992-11-08',
    gender: 'female',
    phone: '+233 24 999 0000',
    email: 'efua.mensah@email.com',
    address: '789 Airport Residential Area, Accra, Ghana',
    emergencyContact: 'Kwame Mensah',
    emergencyPhone: '+233 26 111 3333',
    bloodType: 'B+',
    allergies: 'Latex',
    medicalHistory: 'Sickle cell trait, Anemia',
    insuranceInfo: 'NHIS: 1122334455',
    consentToken: 'consent-003',
    createdAt: '2024-01-14T00:00:00Z',
    updatedAt: '2024-01-15T11:45:00Z'
  },
  {
    id: 'patient-004',
    mrn: 'MRN-2024-004',
    firstName: 'Yaw',
    lastName: 'Darko',
    dateOfBirth: '1965-12-03',
    gender: 'male',
    phone: '+233 20 444 5555',
    address: '321 Labone Estate, Accra, Ghana',
    emergencyContact: 'Abena Darko',
    emergencyPhone: '+233 27 666 7777',
    bloodType: 'AB+',
    allergies: 'Iodine contrast',
    medicalHistory: 'Coronary artery disease, Hypertension, Diabetes',
    insuranceInfo: 'NHIS: 5566778899',
    consentToken: 'consent-004',
    createdAt: '2024-01-13T00:00:00Z',
    updatedAt: '2024-01-15T08:20:00Z'
  },
  {
    id: 'patient-005',
    mrn: 'MRN-2024-005',
    firstName: 'Akosua',
    lastName: 'Owusu',
    dateOfBirth: '1995-05-18',
    gender: 'female',
    phone: '+233 26 222 3333',
    email: 'akosua.owusu@email.com',
    address: '654 East Legon, Accra, Ghana',
    emergencyContact: 'Kwesi Owusu',
    emergencyPhone: '+233 24 444 5555',
    bloodType: 'O-',
    allergies: 'None known',
    medicalHistory: 'Pregnancy (32 weeks), Gestational diabetes',
    insuranceInfo: 'NHIS: 6677889900',
    consentToken: 'consent-005',
    createdAt: '2024-01-11T00:00:00Z',
    updatedAt: '2024-01-15T12:30:00Z'
  }
];

// Mock Encounters
export const mockEncounters: Encounter[] = [
  {
    id: 'encounter-001',
    patientId: 'patient-001',
    doctorId: 'user-001',
    encounterType: 'consultation',
    status: 'active',
    chiefComplaint: 'Persistent headache and dizziness for 3 days',
    diagnosis: 'Hypertensive crisis',
    treatmentPlan: 'Amlodipine 10mg daily, Lifestyle modifications',
    notes: 'Patient reports poor medication compliance. BP: 180/110 mmHg',
    admissionDate: '2024-01-15T08:00:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'encounter-002',
    patientId: 'patient-002',
    doctorId: 'user-001',
    encounterType: 'emergency',
    status: 'completed',
    chiefComplaint: 'Severe chest pain and shortness of breath',
    diagnosis: 'Acute exacerbation of asthma',
    treatmentPlan: 'Salbutamol inhaler, Prednisolone 40mg daily for 5 days',
    notes: 'Patient responded well to treatment. Discharged with follow-up in 1 week',
    admissionDate: '2024-01-14T14:30:00Z',
    dischargeDate: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'encounter-003',
    patientId: 'patient-003',
    doctorId: 'user-001',
    encounterType: 'follow_up',
    status: 'active',
    chiefComplaint: 'Fatigue and joint pain',
    diagnosis: 'Sickle cell crisis',
    treatmentPlan: 'Hydration, Pain management, Folic acid supplementation',
    notes: 'Patient experiencing mild crisis. Monitoring for complications',
    admissionDate: '2024-01-15T11:00:00Z',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:45:00Z'
  }
];

// Mock Vital Signs
export const mockVitalSigns: VitalSigns[] = [
  {
    id: 'vitals-001',
    patientId: 'patient-001',
    encounterId: 'encounter-001',
    temperature: 37.2,
    bloodPressureSystolic: 180,
    bloodPressureDiastolic: 110,
    heartRate: 95,
    respiratoryRate: 18,
    oxygenSaturation: 98,
    weight: 68.5,
    height: 165,
    bmi: 25.1,
    painScale: 6,
    recordedBy: 'user-002',
    recordedAt: '2024-01-15T08:15:00Z'
  },
  {
    id: 'vitals-002',
    patientId: 'patient-002',
    encounterId: 'encounter-002',
    temperature: 36.8,
    bloodPressureSystolic: 140,
    bloodPressureDiastolic: 85,
    heartRate: 88,
    respiratoryRate: 24,
    oxygenSaturation: 92,
    weight: 75.2,
    height: 178,
    bmi: 23.7,
    painScale: 8,
    recordedBy: 'user-002',
    recordedAt: '2024-01-14T14:45:00Z'
  },
  {
    id: 'vitals-003',
    patientId: 'patient-003',
    encounterId: 'encounter-003',
    temperature: 38.1,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    heartRate: 102,
    respiratoryRate: 20,
    oxygenSaturation: 96,
    weight: 55.8,
    height: 162,
    bmi: 21.3,
    painScale: 7,
    recordedBy: 'user-002',
    recordedAt: '2024-01-15T11:15:00Z'
  }
];

// Mock Medications
export const mockMedications: Medication[] = [
  {
    id: 'med-001',
    patientId: 'patient-001',
    encounterId: 'encounter-001',
    medicationName: 'Amlodipine',
    dosage: '10mg',
    frequency: 'Once daily',
    route: 'oral',
    startDate: '2024-01-15',
    prescribedBy: 'user-001',
    status: 'active',
    notes: 'For hypertension management',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'med-002',
    patientId: 'patient-001',
    medicationName: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    route: 'oral',
    startDate: '2023-06-15',
    prescribedBy: 'user-001',
    status: 'active',
    notes: 'For Type 2 Diabetes',
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2023-06-15T00:00:00Z'
  },
  {
    id: 'med-003',
    patientId: 'patient-002',
    encounterId: 'encounter-002',
    medicationName: 'Salbutamol Inhaler',
    dosage: '100mcg',
    frequency: 'As needed',
    route: 'inhalation',
    startDate: '2024-01-14',
    endDate: '2024-01-21',
    prescribedBy: 'user-001',
    status: 'active',
    notes: 'For asthma exacerbation',
    createdAt: '2024-01-14T15:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z'
  },
  {
    id: 'med-004',
    patientId: 'patient-003',
    encounterId: 'encounter-003',
    medicationName: 'Folic Acid',
    dosage: '5mg',
    frequency: 'Once daily',
    route: 'oral',
    startDate: '2024-01-15',
    prescribedBy: 'user-001',
    status: 'active',
    notes: 'For sickle cell disease',
    createdAt: '2024-01-15T11:30:00Z',
    updatedAt: '2024-01-15T11:30:00Z'
  }
];

// Mock Lab Results
export const mockLabResults: LabResult[] = [
  {
    id: 'lab-001',
    patientId: 'patient-001',
    encounterId: 'encounter-001',
    testName: 'Complete Blood Count',
    testCategory: 'Hematology',
    resultValue: '12.5',
    unit: 'g/dL',
    referenceRange: '12.0-15.5',
    abnormalFlag: 'normal',
    orderedBy: 'user-001',
    orderedDate: '2024-01-15T08:30:00Z',
    resultDate: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'lab-002',
    patientId: 'patient-001',
    encounterId: 'encounter-001',
    testName: 'Blood Glucose (Random)',
    testCategory: 'Biochemistry',
    resultValue: '180',
    unit: 'mg/dL',
    referenceRange: '70-140',
    abnormalFlag: 'high',
    orderedBy: 'user-001',
    orderedDate: '2024-01-15T08:30:00Z',
    resultDate: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T08:30:00Z'
  },
  {
    id: 'lab-003',
    patientId: 'patient-002',
    encounterId: 'encounter-002',
    testName: 'Chest X-Ray',
    testCategory: 'Radiology',
    resultValue: 'Normal',
    abnormalFlag: 'normal',
    orderedBy: 'user-001',
    orderedDate: '2024-01-14T15:00:00Z',
    resultDate: '2024-01-14T16:30:00Z',
    createdAt: '2024-01-14T15:00:00Z'
  },
  {
    id: 'lab-004',
    patientId: 'patient-003',
    encounterId: 'encounter-003',
    testName: 'Hemoglobin',
    testCategory: 'Hematology',
    resultValue: '8.5',
    unit: 'g/dL',
    referenceRange: '12.0-15.5',
    abnormalFlag: 'low',
    orderedBy: 'user-001',
    orderedDate: '2024-01-15T11:30:00Z',
    resultDate: '2024-01-15T13:00:00Z',
    createdAt: '2024-01-15T11:30:00Z'
  }
];

// Mock Consent Logs
export const mockConsentLogs: ConsentLog[] = [
  {
    id: 'consent-001',
    patientId: 'patient-001',
    userId: 'user-001',
    action: 'Consent Granted',
    accessType: 'Full Access',
    hashId: '0x1234567890abcdef',
    timestamp: '2024-01-15T08:00:00Z',
    metadata: { consentType: 'treatment', expiryDate: '2024-12-31' }
  },
  {
    id: 'consent-002',
    patientId: 'patient-002',
    userId: 'user-001',
    action: 'Consent Granted',
    accessType: 'Emergency Access',
    hashId: '0xabcdef1234567890',
    timestamp: '2024-01-14T14:30:00Z',
    metadata: { consentType: 'emergency', expiryDate: '2024-01-21' }
  },
  {
    id: 'consent-003',
    patientId: 'patient-003',
    userId: 'user-001',
    action: 'Consent Pending',
    accessType: 'Limited Access',
    hashId: '0x9876543210fedcba',
    timestamp: '2024-01-15T11:00:00Z',
    metadata: { consentType: 'consultation', status: 'pending' }
  }
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'appt-001',
    patientId: 'patient-001',
    doctorId: 'user-001',
    appointmentType: 'follow_up',
    scheduledDate: '2024-01-20T09:00:00Z',
    durationMinutes: 30,
    status: 'scheduled',
    notes: 'BP monitoring and medication review',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'appt-002',
    patientId: 'patient-002',
    doctorId: 'user-001',
    appointmentType: 'follow_up',
    scheduledDate: '2024-01-21T14:00:00Z',
    durationMinutes: 30,
    status: 'scheduled',
    notes: 'Asthma control assessment',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'appt-003',
    patientId: 'patient-005',
    doctorId: 'user-001',
    appointmentType: 'consultation',
    scheduledDate: '2024-01-16T10:00:00Z',
    durationMinutes: 45,
    status: 'confirmed',
    notes: 'Prenatal checkup - 32 weeks',
    createdAt: '2024-01-15T12:30:00Z',
    updatedAt: '2024-01-15T12:30:00Z'
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-001',
    type: 'lab_result',
    title: 'New Lab Results Available',
    message: 'Blood glucose results for Ama Kufuor are ready for review',
    isRead: false,
    priority: 'high',
    createdAt: '2024-01-15T10:05:00Z'
  },
  {
    id: 'notif-002',
    userId: 'user-001',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'Follow-up appointment with Kofi Addo tomorrow at 2:00 PM',
    isRead: false,
    priority: 'normal',
    scheduledFor: '2024-01-16T14:00:00Z',
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: 'notif-003',
    userId: 'user-001',
    type: 'alert',
    title: 'Critical Lab Value',
    message: 'Hemoglobin level for Efua Mensah is critically low (8.5 g/dL)',
    isRead: true,
    priority: 'urgent',
    createdAt: '2024-01-15T13:05:00Z'
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalPatients: 5,
  activeEncounters: 3,
  pendingLabResults: 2,
  todayAppointments: 3,
  aiInteractionsToday: 8,
  offlineSyncQueue: 0
};

// Helper function to create PatientListItem objects
export const createPatientListItems = (): PatientListItem[] => {
  return mockPatients.map(patient => {
    const latestEncounter = mockEncounters
      .filter(e => e.patientId === patient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    const latestVitals = mockVitalSigns
      .filter(v => v.patientId === patient.id)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
    
    const activeMedications = mockMedications.filter(m => 
      m.patientId === patient.id && m.status === 'active'
    );
    
    const recentLabResults = mockLabResults
      .filter(l => l.patientId === patient.id)
      .sort((a, b) => new Date(b.orderedDate).getTime() - new Date(a.orderedDate).getTime())
      .slice(0, 3);
    
    const consentLog = mockConsentLogs.find(c => c.patientId === patient.id);
    const consentStatus = consentLog?.action.includes('Granted') ? 'granted' : 
                         consentLog?.action.includes('Pending') ? 'pending' : 'revoked';
    
    return {
      patient,
      latestEncounter,
      latestVitals,
      activeMedications,
      recentLabResults,
      consentStatus,
      lastUpdated: latestEncounter?.updatedAt || patient.updatedAt
    };
  });
};

export const mockPatientListItems = createPatientListItems(); 