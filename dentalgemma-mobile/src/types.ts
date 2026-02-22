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

export type AnalysisType = 'photo' | 'xray';
export type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'home-care';

export type ImageAnalysisResult = {
  type: AnalysisType;
  findings: string[];
  confidence: number;
  urgency: UrgencyLevel;
  recommendations: string[];
  condition?: 'healthy' | 'decay' | 'other';
  severity?: 'mild' | 'moderate' | 'severe';
  pathologyClass?: 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured';
  differentialDiagnosis?: string[];
};
