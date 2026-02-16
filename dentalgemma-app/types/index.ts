// Core type definitions for DentalGemma application
// This file will be expanded in Task 2

export type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'home-care';
export type AnalysisType = 'cavity' | 'opg' | 'tooth-id' | 'general';

// Placeholder types - will be fully defined in Task 2
export interface XRayAnalysis {
  id: string;
  type: AnalysisType;
  timestamp: Date;
}

export interface ClinicalCase {
  id: string;
  createdAt: Date;
}

export interface VoiceSession {
  id: string;
  mode: 'standard' | 'enhanced';
}

export interface Treatment {
  id: string;
  name: string;
}

export interface ResearchPaper {
  pmid: string;
  title: string;
}

export interface AnalysisHistoryItem {
  id: string;
  type: 'xray' | 'clinical' | 'voice' | 'agentic' | 'symptom';
  timestamp: Date;
}
