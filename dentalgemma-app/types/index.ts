// ============================================================================
// Core Type Definitions for DentalGemma Application
// ============================================================================

// ----------------------------------------------------------------------------
// Common Types
// ----------------------------------------------------------------------------

export type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'home-care';
export type AnalysisType = 'cavity' | 'opg' | 'tooth-id' | 'general';
export type ImageFormat = 'jpeg' | 'png' | 'dicom';
export type VoiceMode = 'standard' | 'enhanced';
export type Theme = 'light' | 'dark' | 'system';
export type EvidenceLevel = 'A' | 'B' | 'C';
export type Gender = 'male' | 'female' | 'other';
export type Speaker = 'user' | 'ai';
export type TreatmentStatus = 'not-started' | 'in-progress' | 'completed';
export type HistoryItemType = 'xray' | 'clinical' | 'voice' | 'agentic' | 'symptom';
export type ContentType = 'research' | 'trial' | 'review' | 'case-report' | 'guideline';
export type DateRange = 'last-6-months' | '1-year' | '5-years' | 'all';
export type CitationFormat = 'bibtex' | 'apa' | 'mla';

// ----------------------------------------------------------------------------
// X-Ray Analysis Types
// ----------------------------------------------------------------------------

export interface XRayImage {
  id: string;
  file: File;
  format: ImageFormat;
  uploadedAt: Date;
  analysisType: AnalysisType;
}

export interface VisualAnnotations {
  boxes: BoundingBox[];
  labels: string[];
  colors: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface XRayAnalysisBase {
  id: string;
  imageId: string;
  findings: string[];
  confidence: number;
  urgency: UrgencyLevel;
  recommendations: string[];
  visualData?: VisualAnnotations;
  processingTime: number;
  timestamp: Date;
}

export interface CavityAnalysis extends XRayAnalysisBase {
  type: 'cavity';
  cavityCount: '0' | '1' | '2' | '3+';
  classification: 'normal' | 'cavity';
  perToothConfidence?: Record<string, number>;
}

export interface OPGAnalysis extends XRayAnalysisBase {
  type: 'opg';
  pathologyClass: 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured';
}

export interface ToothIDAnalysis extends XRayAnalysisBase {
  type: 'tooth-id';
  toothCount: number;
  toothTypes: Array<{ tooth: string; type: string }>;
}

export interface GeneralAnalysis extends XRayAnalysisBase {
  type: 'general';
  reportSections: string[];
  qualityAssessment: string;
}

export type XRayAnalysis = CavityAnalysis | OPGAnalysis | ToothIDAnalysis | GeneralAnalysis;

// ----------------------------------------------------------------------------
// Clinical Case Types
// ----------------------------------------------------------------------------

export interface PatientInfo {
  age: number;
  gender: Gender;
  patientId?: string;
}

export interface ChiefComplaint {
  description: string;
  duration: string;
  painLevel: number; // 1-10
  triggers: string[];
}

export interface ClinicalFindings {
  intraoral: string;
  extraoral: string;
  softTissue: string;
  periodontal: string;
}

export interface RadiographicFindings {
  description: string;
  xrayImage?: string; // Base64 or URL
  boneLoss: string;
  periapicalStatus: string;
}

export interface MedicalHistory {
  medications: string[];
  allergies: string[];
  systemicConditions: string[];
  previousTreatments: string[];
}

export interface ClinicalCase {
  id: string;
  patient: PatientInfo;
  chiefComplaint: ChiefComplaint;
  clinicalFindings: ClinicalFindings;
  radiographicFindings: RadiographicFindings;
  medicalHistory: MedicalHistory;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------------------------------------------------
// Clinical Assessment Types
// ----------------------------------------------------------------------------

export interface Diagnosis {
  primary: string;
  icd10: string;
  confidence: number;
  differential: string[];
}

export interface Etiology {
  rootCause: string;
  contributingFactors: string[];
  riskFactors: string[];
}

export interface ManagementPlan {
  immediate: string[];
  protocol: string[];
  alternatives: string[];
  expectedOutcomes: string;
  duration: string;
}

export interface AntibioticRecommendation {
  indication: string;
  drug: string;
  dosage: string;
  duration: string;
  alternatives: string[];
  rationale: string;
}

export interface FollowUp {
  initialTiming: string;
  monitoring: string[];
  longTerm: string;
  redFlags: string[];
}

export interface PatientCounseling {
  explanation: string;
  homeCare: string[];
  dietary: string[];
  painManagement: string;
  emergencyTriggers: string[];
}

export interface ClinicalGuidelines {
  relevant: string[];
  references: string[];
  evidenceLevel: EvidenceLevel;
}

export interface CaseAssessment {
  success: boolean;
  diagnosis: Diagnosis;
  etiology: Etiology;
  urgency: UrgencyLevel;
  managementPlan: ManagementPlan;
  antibiotics?: AntibioticRecommendation;
  followUp: FollowUp;
  patientCounseling: PatientCounseling;
  guidelines: ClinicalGuidelines;
  processingTime: number;
}

// ----------------------------------------------------------------------------
// Voice Consultation Types
// ----------------------------------------------------------------------------

export interface VoiceMessage {
  id: string;
  speaker: Speaker;
  text: string;
  audio?: ArrayBuffer;
  timestamp: Date;
}

export interface VoiceSession {
  id: string;
  mode: VoiceMode;
  messages: VoiceMessage[];
  startedAt: Date;
  endedAt?: Date;
}

export interface VoiceSettings {
  mode: VoiceMode;
  language: string;
  voice?: string;
  speechRate: number;
  pitch: number;
}

// ----------------------------------------------------------------------------
// Agentic Workflow Types
// ----------------------------------------------------------------------------

export interface WorkflowInput {
  text: string;
  image?: File;
  location?: string;
}

export interface WorkflowStep {
  agent: string;
  action: string;
  tool?: string;
  input: any;
  output: any;
  confidence: number;
  timestamp: number;
}

export interface WorkflowResult {
  steps: WorkflowStep[];
  finalReport: string;
  recommendations: string[];
  referrals?: DentistInfo[];
  research?: ResearchPaper[];
}

// ----------------------------------------------------------------------------
// Dentist Finder Types
// ----------------------------------------------------------------------------

export interface Location {
  lat: number;
  lng: number;
}

export interface DentistInfo {
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
}

export interface PlacesSearchParams {
  location: Location;
  radius: number;
  specialty?: string;
  rating?: number;
  priceLevel?: number;
  openNow?: boolean;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  formattedPhoneNumber: string;
  website: string;
  rating: number;
  openingHours?: {
    weekdayText: string[];
    openNow: boolean;
  };
  geometry: {
    location: Location;
  };
}

// ----------------------------------------------------------------------------
// Treatment Progress Types
// ----------------------------------------------------------------------------

export interface Treatment {
  id: string;
  name: string;
  phase: string;
  status: TreatmentStatus;
  completionPercentage: number;
  nextAppointment?: Date;
  notes: string;
  documents: File[];
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------------------------------------------------
// Research Types
// ----------------------------------------------------------------------------

export interface ResearchPaper {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  date: string;
  abstract: string;
  url: string;
  keywords: string[];
  saved: boolean;
}

export interface SearchOptions {
  maxResults?: number;
  dateRange?: DateRange;
  contentType?: ContentType;
}

// ----------------------------------------------------------------------------
// Education Portal Types
// ----------------------------------------------------------------------------

export interface DentalCondition {
  id: string;
  name: string;
  category: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  prevention: string[];
  relatedConditions: string[];
}

// ----------------------------------------------------------------------------
// Symptom Checker Types
// ----------------------------------------------------------------------------

export interface SymptomData {
  location: string;
  painType: string;
  duration: string;
  triggers: string[];
  associatedSymptoms: string[];
  medicalHistory: string[];
}

export interface SymptomResult {
  possibleConditions: Array<{
    condition: string;
    likelihood: number;
  }>;
  urgency: UrgencyLevel;
  actionGuidance: string;
  homeCareRecommendations: string[];
  redFlags: string[];
}

// ----------------------------------------------------------------------------
// History Types
// ----------------------------------------------------------------------------

export interface AnalysisHistoryItem {
  id: string;
  type: HistoryItemType;
  summary: string;
  urgency?: UrgencyLevel;
  data: any;
  timestamp: Date;
}

// ----------------------------------------------------------------------------
// Dashboard Types
// ----------------------------------------------------------------------------

export interface DashboardStats {
  totalAnalyses: number;
  casesAssessed: number;
  papersFound: number;
  dentistsLocated: number;
}

export interface ActivityItem {
  id: string;
  type: HistoryItemType;
  description: string;
  timestamp: Date;
}

// ----------------------------------------------------------------------------
// Settings Types
// ----------------------------------------------------------------------------

export interface UserSettings {
  theme: Theme;
  voiceSettings: VoiceSettings;
  fontSize: 'small' | 'medium' | 'large';
  reduceAnimations: boolean;
  highContrast: boolean;
  colorBlindMode: boolean;
}

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

export interface AnalyzeXRayRequest {
  image: string; // Base64 encoded
  analysisType: AnalysisType;
}

export interface AnalyzeXRayResponse {
  success: boolean;
  analysis: string;
  type: AnalysisType;
  findings: string[];
  confidence: number;
  urgency: UrgencyLevel;
  recommendations: string[];
  visualData?: VisualAnnotations;
  processingTime: number;
}

export interface AssessCaseRequest {
  caseData: ClinicalCase;
}

export interface AssessCaseResponse {
  success: boolean;
  assessment: string;
  processingTime?: number;
}

export interface ChatRequest {
  message: string;
  history?: VoiceMessage[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  processingTime: number;
}

export interface SearchDentistsRequest {
  location: string | Location;
  radius: number;
  specialty?: string;
  rating?: number;
  priceLevel?: number;
  openNow?: boolean;
}

export interface SearchDentistsResponse {
  success: boolean;
  results: DentistInfo[];
}

export interface SearchResearchRequest {
  query: string;
  options?: SearchOptions;
}

export interface SearchResearchResponse {
  success: boolean;
  papers: ResearchPaper[];
  totalResults: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  modalConnected: boolean;
  timestamp: number;
}

// ----------------------------------------------------------------------------
// Error Types
// ----------------------------------------------------------------------------

export interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

// ----------------------------------------------------------------------------
// State Management Types
// ----------------------------------------------------------------------------

export interface AppState {
  // Current Analysis
  currentXRayAnalysis: XRayAnalysis | null;
  currentCaseAssessment: CaseAssessment | null;
  currentVoiceSession: VoiceSession | null;
  
  // History
  analysisHistory: AnalysisHistoryItem[];
  
  // Treatments
  treatments: Treatment[];
  
  // Saved Items
  savedPapers: ResearchPaper[];
  favoriteDentists: DentistInfo[];
  
  // Settings
  settings: UserSettings;
  
  // Dashboard Stats
  dashboardStats: DashboardStats;
  
  // Actions
  setCurrentXRayAnalysis: (analysis: XRayAnalysis | null) => void;
  setCurrentCaseAssessment: (assessment: CaseAssessment | null) => void;
  setCurrentVoiceSession: (session: VoiceSession | null) => void;
  addToHistory: (item: AnalysisHistoryItem) => void;
  clearHistory: () => void;
  addTreatment: (treatment: Treatment) => void;
  updateTreatment: (id: string, updates: Partial<Treatment>) => void;
  deleteTreatment: (id: string) => void;
  savePaper: (paper: ResearchPaper) => void;
  unsavePaper: (pmid: string) => void;
  saveDentist: (dentist: DentistInfo) => void;
  unsaveDentist: (placeId: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  updateDashboardStats: (stats: Partial<DashboardStats>) => void;
}

// ----------------------------------------------------------------------------
// localStorage Schema Types
// ----------------------------------------------------------------------------

export interface LocalStorageSchema {
  'dentalgemma:history': AnalysisHistoryItem[];
  'dentalgemma:treatments': Treatment[];
  'dentalgemma:saved-papers': ResearchPaper[];
  'dentalgemma:favorites-dentists': DentistInfo[];
  'dentalgemma:settings': UserSettings;
  'dentalgemma:form-autosave': ClinicalCase;
  'dentalgemma:dashboard-stats': DashboardStats;
}
