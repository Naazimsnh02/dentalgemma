export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string;
  timestamp: number;
  isStreaming?: boolean;
};

export type ModelState =
  | 'checking'
  | 'not-found'
  | 'ready-to-load'
  | 'loading'
  | 'loaded'
  | 'error';

export type ModelFiles = {
  modelPath: string;
  mmprojPath: string;
  modelExists: boolean;
  mmprojExists: boolean;
};

export type SymptomData = {
  location: string;
  painType: string;
  duration: string;
  triggers: string[];
  associatedSymptoms: string[];
  medicalHistory: string[];
};

export type SymptomResult = {
  possibleConditions: Array<{
    condition: string;
    likelihood: number;
  }>;
  urgency: 'emergency' | 'urgent' | 'routine' | 'home-care';
  actionGuidance: string;
  homeCareRecommendations: string[];
  redFlags: string[];
};

export type SimpleSymptomResult = {
  urgency: UrgencyLevel;
  markdownReport: string;
};

export type AnalysisType = 'photo' | 'xray';
export type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'home-care';

export type ImageAnalysisResult = {
  type: AnalysisType;
  rawAnalysis?: string; // Full raw text from model
  findings: string[]; // For backward compatibility
  confidence: number; // Not displayed
  urgency: UrgencyLevel; // Not displayed
  recommendations: string[]; // Not displayed
  condition?: 'healthy' | 'decay' | 'other'; // Not displayed
  severity?: 'mild' | 'moderate' | 'severe'; // Not displayed
  pathologyClass?: 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured'; // Not displayed
  differentialDiagnosis?: string[]; // Not displayed
};

export type Location = {
  lat: number;
  lng: number;
};

export type DentistInfo = {
  placeId: string;
  name: string;
  specialty: string;
  rating: number;
  distance: number;
  phone: string;
  website: string;
  hours: string;
  address: string;
  location: Location;
};

// Clinical Assessment Types
export type PatientInfo = {
  age: number;
  gender: 'male' | 'female' | 'other';
  occupation?: string;
};

export type ChiefComplaint = {
  description: string;
};

export type ClinicalFindings = {
  description: string;
};

export type RadiographicFindings = {
  description: string;
  xrayImage?: string;
};

export type MedicalHistory = {
  systemicConditions?: string;
  medications?: string;
  habits?: string;
  history?: string;
};

export type ClinicalCase = {
  id: string;
  patient: PatientInfo;
  chiefComplaint: ChiefComplaint;
  history: string;
  clinicalFindings: ClinicalFindings;
  radiographicFindings: RadiographicFindings;
  medicalHistory: MedicalHistory;
  createdAt: Date;
  updatedAt: Date;
};

export type CaseAssessment = {
  success: boolean;
  diagnosis: {
    primary: string;
    differential: string[];
  };
  etiology: {
    rootCause: string;
  };
  urgency: UrgencyLevel;
  managementPlan: {
    protocol: string[];
  };
  antibiotics?: {
    indicated: boolean;
    reason: string;
  };
  followUp: {
    timing: string;
    monitoring: string[];
  };
  patientCounseling: {
    explanation: string;
  };
  processingTime: number;
};
