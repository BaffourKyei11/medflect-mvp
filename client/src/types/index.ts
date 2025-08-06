// FHIR Resource Types
export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  insuranceInfo?: string;
  consentToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  doctorId: string;
  encounterType: 'admission' | 'consultation' | 'emergency' | 'follow_up';
  status: 'active' | 'completed' | 'cancelled';
  chiefComplaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  admissionDate?: string;
  dischargeDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  encounterId?: string;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painScale?: number;
  recordedBy: string;
  recordedAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  encounterId?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'intravenous' | 'intramuscular' | 'subcutaneous' | 'topical';
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  status: 'active' | 'discontinued' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  encounterId?: string;
  testName: string;
  testCategory?: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  abnormalFlag: 'normal' | 'high' | 'low' | 'critical';
  orderedBy: string;
  orderedDate: string;
  resultDate?: string;
  notes?: string;
  createdAt: string;
}

export interface AISummary {
  id: string;
  patientId: string;
  encounterId?: string;
  summaryType: 'clinical' | 'discharge' | 'handoff' | 'progress';
  content: string;
  generatedBy: string;
  modelVersion?: string;
  confidenceScore?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIInteraction {
  id: string;
  userId: string;
  patientId?: string;
  encounterId?: string;
  action: 'clinical_summary' | 'clinical_decision_support' | 'patient_communication' | 'medication_interaction_check' | 'test';
  inputLength: number;
  outputLength: number;
  tokens: number;
  duration: number;
  confidenceScore?: number;
  model?: string;
  securityHash: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient';
  department?: string;
  licenseNumber?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentLog {
  id: string;
  patientId: string;
  userId: string;
  action: string;
  accessType: string;
  hashId: string;
  timestamp: string;
  metadata?: any;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentType: 'consultation' | 'follow_up' | 'emergency' | 'procedure';
  scheduledDate: string;
  durationMinutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'appointment' | 'lab_result' | 'medication' | 'alert' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
}

// App-specific Types
export interface PatientListItem {
  patient: Patient;
  latestEncounter?: Encounter;
  latestVitals?: VitalSigns;
  activeMedications: Medication[];
  recentLabResults: LabResult[];
  consentStatus: 'granted' | 'pending' | 'revoked';
  lastUpdated: string;
}

export interface DashboardStats {
  totalPatients: number;
  activeEncounters: number;
  pendingLabResults: number;
  todayAppointments: number;
  aiInteractionsToday: number;
  offlineSyncQueue: number;
}

export interface AISummaryRequest {
  patientId: string;
  encounterId?: string;
  summaryType: 'clinical' | 'discharge' | 'handoff' | 'progress';
}

export interface AISummaryResponse {
  content: string;
  modelVersion: string;
  confidenceScore: number;
  tokens: number;
  duration: number;
  securityHash: string;
}

export interface ClinicalDecisionSupportRequest {
  patientId: string;
  encounterId?: string;
  query: string;
}

export interface MedicationInteractionRequest {
  medications: Array<{
    name: string;
    dosage: string;
  }>;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingChanges: number;
  syncErrors: string[];
}

export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  theme: Theme;
  syncStatus: SyncStatus;
  selectedPatient: Patient | null;
  notifications: Notification[];
}

// UI Component Props
export interface PatientCardProps {
  patient: PatientListItem;
  onSelect: (patient: Patient) => void;
  onGenerateSummary: (patientId: string) => void;
  onShare: (patientId: string) => void;
  onFlag: (patientId: string) => void;
}

export interface VitalSignsDisplayProps {
  vitals: VitalSigns;
  showTrends?: boolean;
}

export interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AISummaryResponse | null;
  patient: Patient;
  onRegenerate: () => void;
  onSave: () => void;
}

export interface ConsentLogProps {
  patientId: string;
  logs: ConsentLog[];
}

export interface OfflineIndicatorProps {
  isOnline: boolean;
  syncStatus: SyncStatus;
}

export interface NavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface PatientSearchForm {
  query: string;
  filters: {
    ageRange?: [number, number];
    gender?: string;
    status?: string;
    department?: string;
  };
}

export interface AISummaryForm {
  patientId: string;
  encounterId?: string;
  summaryType: 'clinical' | 'discharge' | 'handoff' | 'progress';
  additionalContext?: string;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStateData<T> {
  data: T | null;
  loading: LoadingState;
  error: AppError | null;
}

// PWA Types
export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  startUrl: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
}

// Blockchain Types
export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
}

export interface ConsentTransaction extends BlockchainTransaction {
  patientId: string;
  userId: string;
  consentType: string;
  expiryDate?: string;
} 