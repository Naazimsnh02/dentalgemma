# Design Document

## Overview

DentalGemma is a production-ready dental AI diagnostic platform built with Next.js 16, featuring a **cloud-first architecture** that provides fast, GPU-accelerated inference via Modal.com. The application leverages the fine-tuned **DentalGemma 1.5 4B IT (Multimodal)** model that combines visual understanding of dental X-rays with clinical reasoning capabilities.

### Key Design Principles

1. **Cloud-First Architecture**: Reliable, high-performance GPU inference
2. **Multimodal AI**: Single model handles both visual (X-ray) and textual (clinical) inputs
3. **Agentic Workflows**: Autonomous multi-agent system orchestrates complex diagnostic tasks
4. **Data Privacy**: Ephemeral processing ensures data is not stored on servers
5. **Progressive Enhancement**: PWA capabilities for offline access to static resources
6. **Medical-Grade UX**: Professional, accessible interface with clear disclaimers
7. **Evidence-Based**: Integration with PubMed for research-backed recommendations

### Technology Stack

**Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, React 19.2  
**AI/ML**: Vercel AI SDK 6 (agents), Modal.com (cloud GPU)  
**APIs**: Google Places API, PubMed E-Utils, Gemini 2.5 Flash Native Audio  
**State**: Zustand, localStorage  
**Deployment**: Vercel (frontend PWA), Modal.com (backend)

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16 PWA)                    │
│                  Vercel · Tailwind v4 · shadcn/ui               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Feature Layer (11 Features)                  │  │
│  │  X-Ray │ Clinical │ Voice │ Agentic │ Dentist │ ...      │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                         │
│  ┌────────────────────┴─────────────────────────────────────┐  │
│  │                   Cloud AI Engine                         │  │
│  │    ┌──────────────────────────┐                          │  │
│  │    │   Cloud Inference        │                          │  │
│  │    │   Modal.com API          │◄─────────────────────────┘  │
│  │    │   DentalGemma 4B IT      │                             │
│  │    └──────────────────────────┘                             │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              External API Integration Layer               │  │
│  │  Google Places │ PubMed E-Utils │ Gemini Live            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                            │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │  Modal.com        │  │  Google Cloud     │                    │
│  │  · DentalGemma    │  │  · Gemini 2.5     │                    │
│  │    1.5 4B IT      │  │    Flash Native   │                    │
│  │    (Multimodal)   │  │    Audio          │                    │
│  │  · GPU: H100/A10G │  │  · Enhanced Voice │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              AGENTIC WORKFLOW LAYER (Vercel AI SDK 6)           │
│                                                                 │
│  Coordinator → X-Ray Analyzer → Clinical Assessor →            │
│  Research Synthesizer → Referral Agent → Report Generator      │
│                                                                 │
│  Tools: analyzeXray, assessCase, searchResearch,               │
│         findSpecialist, generateReport, checkGuidelines        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow


#### X-Ray Analysis Flow

```
User uploads image → Frontend validates format → 
Send to Modal.com API → DentalGemma processes → Return analysis
→ Display results with confidence scores → Save to localStorage history
```

#### Clinical Case Assessment Flow

```
User fills multi-step form → Auto-save to localStorage every 30s →
User submits → POST to Modal.com → DentalGemma generates report
→ Display structured report (8 sections) → Export PDF option
```

#### Agentic Workflow Flow

```
User provides input (text + optional image) →
Coordinator Agent analyzes input → Determines required steps →
Sequential agent execution:
  1. X-Ray Analyzer (if image present) → analyzeXray tool
  2. Clinical Assessor → assessCase tool
  3. Research Synthesizer → searchResearch tool (PubMed)
  4. Referral Agent → findSpecialist tool (Google Places)
  5. Report Generator → generateReport tool
→ Stream progress to UI → Display comprehensive report
```

## Components and Interfaces

### Frontend Components

#### 1. DentalGemma Client
 
 **Purpose**: Handles API communication with Modal.com backend
 
 **Interface**:
 ```typescript
 interface DentalGemmaClient {
   analyzeXray(image: File | string, analysisType: AnalysisType): Promise<XRayAnalysis>;
   assessCase(caseData: ClinicalCase): Promise<CaseAssessment>;
   chat(message: string, history?: Message[]): Promise<string>;
 }
 
 type AnalysisType = 'cavity' | 'opg' | 'tooth-id' | 'general';
 
 interface XRayAnalysis {
   success: boolean;
   type: AnalysisType;
   findings: string[];
   confidence: number;
   urgency: 'low' | 'medium' | 'high';
   recommendations: string[];
   visualData?: { boxes: BoundingBox[]; labels: string[] };
   processingTime: number;
 }
 
 interface CaseAssessment {
   success: boolean;
   diagnosis: {
     primary: string;
     icd10: string;
     confidence: number;
     differential: string[];
   };
   etiology: {
     rootCause: string;
     contributingFactors: string[];
     riskFactors: string[];
   };
   urgency: 'emergency' | 'urgent' | 'routine' | 'home-care';
   managementPlan: {
     immediate: string[];
     protocol: string[];
     alternatives: string[];
     expectedOutcomes: string;
     duration: string;
   };
   antibiotics?: {
     indication: string;
     drug: string;
     dosage: string;
     duration: string;
     alternatives: string[];
     rationale: string;
   };
   followUp: {
     initialTiming: string;
     monitoring: string[];
     longTerm: string;
     redFlags: string[];
   };
   patientCounseling: {
     explanation: string;
     homeCare: string[];
     dietary: string[];
     painManagement: string;
     emergencyTriggers: string[];
   };
   guidelines: {
     relevant: string[];
     references: string[];
     evidenceLevel: 'A' | 'B' | 'C';
   };
   processingTime: number;
 }
 ```
 
 **Key Methods**:
 - `analyzeXray()`: Sends image to Modal.com, handles retries, returns structured analysis
 - `assessCase()`: Sends clinical data, returns comprehensive 8-section assessment
 - `chat()`: Sends message with optional history for voice consultation

#### 4. Agentic Workflow Engine

**Purpose**: Orchestrates multi-agent diagnostic workflow using Vercel AI SDK 6

**Interface**:
```typescript
interface AgenticWorkflowEngine {
  execute(input: WorkflowInput): AsyncGenerator<WorkflowStep, WorkflowResult>;
  pause(): void;
  resume(): void;
  cancel(): void;
}

interface WorkflowInput {
  text: string;
  image?: File;
  location?: string;
}

interface WorkflowStep {
  agent: string;
  action: string;
  tool?: string;
  input: any;
  output: any;
  confidence: number;
  timestamp: number;
}

interface WorkflowResult {
  steps: WorkflowStep[];
  finalReport: string;
  recommendations: string[];
  referrals?: DentistInfo[];
  research?: ResearchPaper[];
}
```

**Agents**:
1. **Coordinator Agent**: Analyzes input, determines workflow steps
2. **X-Ray Analyzer Agent**: Calls `analyzeXray` tool
3. **Clinical Assessor Agent**: Calls `assessCase` tool
4. **Research Synthesizer Agent**: Calls `searchResearch` tool
5. **Referral Agent**: Calls `findSpecialist` tool
6. **Report Generator Agent**: Calls `generateReport` tool

**Tools**:
```typescript
const tools = {
  analyzeXray: tool({
    description: 'Analyze dental X-ray image',
    parameters: z.object({
      image: z.string(),
      type: z.enum(['cavity', 'opg', 'tooth-id', 'general'])
    }),
    execute: async ({ image, type }) => {
      // Call DentalGemma model
    }
  }),
  
  assessCase: tool({
    description: 'Assess clinical case',
    parameters: z.object({
      caseData: z.object({...})
    }),
    execute: async ({ caseData }) => {
      // Call DentalGemma model
    }
  }),
  
  searchResearch: tool({
    description: 'Search PubMed for research',
    parameters: z.object({
      query: z.string(),
      maxResults: z.number().optional()
    }),
    execute: async ({ query, maxResults }) => {
      // Call PubMed E-Utils API
    }
  }),
  
  findSpecialist: tool({
    description: 'Find nearby dental specialists',
    parameters: z.object({
      specialty: z.string(),
      location: z.string(),
      radius: z.number()
    }),
    execute: async ({ specialty, location, radius }) => {
      // Call Google Places API
    }
  }),
  
  generateReport: tool({
    description: 'Generate comprehensive PDF report',
    parameters: z.object({
      data: z.object({...})
    }),
    execute: async ({ data }) => {
      // Generate PDF using jsPDF
    }
  })
};
```


#### 5. Voice Consultation Manager

**Purpose**: Manages hybrid voice consultation (Web Speech API + Gemini Live)

**Interface**:
```typescript
interface VoiceConsultationManager {
  mode: 'standard' | 'enhanced';
  startSession(mode: 'standard' | 'enhanced'): Promise<void>;
  stopSession(): void;
  sendAudio(audioBuffer: ArrayBuffer): Promise<void>;
  onTranscript(callback: (text: string, speaker: 'user' | 'ai') => void): void;
  onAudioResponse(callback: (audio: ArrayBuffer) => void): void;
  exportTranscript(): string;
}
```

**Standard Mode (Default)**:
- Uses browser `SpeechRecognition` API for speech-to-text
- Sends transcribed text to DentalGemma model
- Uses browser `SpeechSynthesis` API for text-to-speech
- Works offline, no API costs

**Enhanced Mode (Optional)**:
- Uses Gemini 2.5 Flash Native Audio API
- Native audio processing (no separate TTS)
- System prompt injects dental expertise
- Sub-500ms latency, emotion-aware

#### 6. External API Clients

**Google Places Client**:
```typescript
interface GooglePlacesClient {
  searchNearby(params: PlacesSearchParams): Promise<DentistInfo[]>;
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;
}

interface PlacesSearchParams {
  location: { lat: number; lng: number };
  radius: number;
  specialty?: string;
  rating?: number;
  priceLevel?: number;
  openNow?: boolean;
}

interface DentistInfo {
  placeId: string;
  name: string;
  specialty: string;
  rating: number;
  distance: number;
  phone: string;
  website: string;
  hours: string;
  address: string;
  location: { lat: number; lng: number };
}
```

**PubMed Client**:
```typescript
interface PubMedClient {
  search(query: string, options: SearchOptions): Promise<ResearchPaper[]>;
  findSimilar(pmid: string): Promise<ResearchPaper[]>;
}

interface SearchOptions {
  maxResults?: number;
  dateRange?: 'last-6-months' | '1-year' | '5-years' | 'all';
  contentType?: 'research' | 'trial' | 'review' | 'case-report' | 'guideline';
}

interface ResearchPaper {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  date: string;
  abstract: string;
  url: string;
  keywords: string[];
}
```

### Backend Components (Modal.com)

#### DentalGemma Model Service

**Purpose**: Serves fine-tuned multimodal model on GPU

**Implementation**:
```python
@app.cls(
    image=modal_image,
    gpu="A10G",
    secrets=[modal.Secret.from_name("huggingface-secret")],
    timeout=300,
    container_idle_timeout=300,
    enable_memory_snapshot=True,  # 10x faster cold starts
)
class DentalGemmaModel:
    @modal.enter()
    def load_model(self):
        """Load model at container startup (cached via GPU snapshot)"""
        from transformers import AutoProcessor, AutoModelForImageTextToText
        import torch
        
        model_id = "naazimsnh02/dentalgemma-1.5-4b-it"
        self.processor = AutoProcessor.from_pretrained(model_id)
        self.model = AutoModelForImageTextToText.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto"
        )
    
    @modal.web_endpoint(method="POST")
    def analyze_xray(self, data: dict):
        """Multimodal inference for X-ray analysis"""
        # Process image + text prompt
        # Return structured analysis
    
    @modal.web_endpoint(method="POST")
    def assess_case(self, data: dict):
        """Text-only inference for clinical assessment"""
        # Process clinical case text
        # Return structured assessment
    
    @modal.web_endpoint(method="POST")
    def chat(self, data: dict):
        """Conversational inference for voice consultation"""
        # Process message with history
        # Return response
```

**Key Features**:
- GPU snapshotting for 10x faster cold starts
- Keep-alive pings every 5 minutes to maintain warm containers
- Automatic retry with exponential backoff
- Structured output parsing

## Data Models

### Core Data Types

```typescript
// X-Ray Analysis
interface XRayImage {
  id: string;
  file: File;
  format: 'jpeg' | 'png' | 'dicom';
  uploadedAt: Date;
  analysisType: AnalysisType;
}

interface XRayAnalysis {
  id: string;
  imageId: string;
  type: AnalysisType;
  findings: string[];
  confidence: number;
  urgency: UrgencyLevel;
  recommendations: string[];
  visualData?: VisualAnnotations;
  processingTime: number;
  timestamp: Date;
}

interface VisualAnnotations {
  boxes: BoundingBox[];
  labels: string[];
  colors: string[];
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

// Clinical Case
interface ClinicalCase {
  id: string;
  patient: PatientInfo;
  chiefComplaint: ChiefComplaint;
  clinicalFindings: ClinicalFindings;
  radiographicFindings: RadiographicFindings;
  medicalHistory: MedicalHistory;
  createdAt: Date;
  updatedAt: Date;
}

interface PatientInfo {
  age: number;
  gender: 'male' | 'female' | 'other';
  patientId?: string;
}

interface ChiefComplaint {
  description: string;
  duration: string;
  painLevel: number; // 1-10
  triggers: string[];
}

interface ClinicalFindings {
  intraoral: string;
  extraoral: string;
  softTissue: string;
  periodontal: string;
}

interface RadiographicFindings {
  description: string;
  xrayImage?: string; // Base64 or URL
  boneLoss: string;
  periapicalStatus: string;
}

interface MedicalHistory {
  medications: string[];
  allergies: string[];
  systemicConditions: string[];
  previousTreatments: string[];
}

// Voice Consultation
interface VoiceSession {
  id: string;
  mode: 'standard' | 'enhanced';
  messages: VoiceMessage[];
  startedAt: Date;
  endedAt?: Date;
}

interface VoiceMessage {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  audio?: ArrayBuffer;
  timestamp: Date;
}

// Treatment Progress
interface Treatment {
  id: string;
  name: string;
  phase: string;
  status: 'not-started' | 'in-progress' | 'completed';
  completionPercentage: number;
  nextAppointment?: Date;
  notes: string;
  documents: File[];
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Research
interface ResearchPaper {
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

// History
interface AnalysisHistoryItem {
  id: string;
  type: 'xray' | 'clinical' | 'voice' | 'agentic' | 'symptom';
  summary: string;
  urgency?: UrgencyLevel;
  data: any;
  timestamp: Date;
}

// Common Types
type UrgencyLevel = 'emergency' | 'urgent' | 'routine' | 'home-care';
type AnalysisType = 'cavity' | 'opg' | 'tooth-id' | 'general';
```

### State Management

**Zustand Store**:
```typescript
interface AppState {
  // Current Analysis
  currentXRayAnalysis: XRayAnalysis | null;
  currentCaseAssessment: CaseAssessment | null;
  currentVoiceSession: VoiceSession | null;
  
  // History
  analysisHistory: AnalysisHistoryItem[];
  
  // Settings
  theme: 'light' | 'dark' | 'system';
  voiceMode: 'standard' | 'enhanced';
  voiceSettings: VoiceSettings;
  
  // Actions
  addToHistory: (item: AnalysisHistoryItem) => void;
  clearHistory: () => void;
  updateSettings: (settings: Partial<AppState>) => void;
}
```

**localStorage Schema**:
```typescript
{
  'dentalgemma:history': AnalysisHistoryItem[],
  'dentalgemma:treatments': Treatment[],
  'dentalgemma:saved-papers': ResearchPaper[],
  'dentalgemma:favorites-dentists': DentistInfo[],
  'dentalgemma:settings': UserSettings,
  'dentalgemma:form-autosave': ClinicalCase
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I've identified the following key properties while eliminating redundancy:

**Redundancy Elimination:**
- Requirements 1.2-1.5 all test output structure for different analysis types → Combined into Property 1
- Requirements 2.6-2.13 all test assessment output sections → Combined into Property 3
- Requirements 3.6-3.10 all test voice UI elements → Combined into Property 5
- Requirements 4.2-4.6 all test conditional agent invocation → Combined into Property 6
- Requirements 5.2-5.4 and 5.5-5.9 test search/display → Combined into Properties 8-9
- Requirements 6.2-6.3 and 6.4-6.6 test visualization and styling → Combined into Property 10
- Requirements 7.2-7.3 and 7.4-7.9 test filtering and display → Combined into Property 12
- Requirements 8.1-8.2 and 8.4-8.10 test browsing and display → Combined into Property 14
- Requirements 9.5-9.10 and 9.11-9.14 test results and features → Combined into Property 16
- Requirements 10.1 and 10.4-10.5 test cloud/offline behavior → Combined into Property 17
- Requirements 11.1-11.10, 12.1-12.10, 13.1-13.10, 14.1-14.10, 15.1-15.10, 16.5-16.10, 17.1-17.10, 18.1-18.10 all test UI/feature completeness → Combined into respective properties

### Core Properties

**Property 1: X-Ray Analysis Output Completeness**  
*For any* valid X-ray image and analysis type (cavity, OPG, tooth-id, general), the DentalGemma model output SHALL contain all required fields: findings array, confidence score (0-1), urgency level, recommendations array, and processing time.  
**Validates: Requirements 1.2, 1.3, 1.4, 1.5**

**Property 2: Image Format Validation**  
*For any* file upload, the system SHALL accept only JPEG, PNG, and DICOM formats, and SHALL reject all other formats with an error message.  
**Validates: Requirements 1.1, 1.10**

**Property 3: Clinical Assessment Output Completeness**  
*For any* valid clinical case submission, the DentalGemma model output SHALL contain all 8 required sections: primary diagnosis (with ICD-10 code, confidence, differential diagnoses), etiology analysis, urgency classification, management plan, antibiotic recommendations (when indicated), follow-up schedule, patient counseling, and clinical guidelines with evidence level.  
**Validates: Requirements 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13**

**Property 4: Clinical Case Data Collection**  
*For any* clinical case form submission, the system SHALL collect and store all required fields: patient info (age, gender), chief complaint (description, duration, pain level, triggers), clinical findings (intraoral, extraoral, soft tissue, periodontal), radiographic findings (description, optional image), and medical history (medications, allergies, conditions, treatments).  
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

**Property 5: Voice Consultation UI Completeness**  
*For any* active voice consultation session, the UI SHALL display all required elements: microphone button with animation state, mode toggle (standard/enhanced), real-time waveform visualization, live transcription for both user and AI, conversation history panel, and connection status indicator.  
**Validates: Requirements 3.6, 3.7, 3.8, 3.9, 3.10**

**Property 6: Agentic Workflow Conditional Execution**  
*For any* workflow input, the Agentic Workflow SHALL invoke agents conditionally: X-Ray Analyzer agent if and only if image is present, Clinical Assessor agent if and only if clinical data is present, Research Synthesizer agent after diagnosis, Referral Agent if specialist needed, and Report Generator agent after all other agents complete.  
**Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**

**Property 7: Workflow Progress Visualization**  
*For any* executing agentic workflow, the system SHALL display animated step-by-step progress, log all agent decisions with tool calls (inputs and outputs), and allow user override at any step.  
**Validates: Requirements 4.7, 4.8, 4.9, 4.10**

**Property 8: Location Input Validation**  
*For any* dentist search, the system SHALL accept location input in any of three formats: street address, city name, or GPS coordinates (latitude, longitude).  
**Validates: Requirements 5.1**

**Property 9: Dentist Search Results Completeness**  
*For any* successful dentist search, each result SHALL contain all required fields: name, specialty, rating, distance, phone, website, hours, address, and location coordinates, and SHALL be displayed on both map (with clustered markers) and list views.  
**Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9**

**Property 10: Treatment Progress Visualization**  
*For any* treatment entry, the system SHALL display horizontal timeline visualization, interactive charts (progress over time, cost tracking), and color-coded indicators (red for overdue, yellow for upcoming, green for completed) based on treatment status.  
**Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

**Property 11: Treatment Data Persistence**  
*For any* treatment CRUD operation (create, read, update, delete), the system SHALL persist changes to localStorage immediately and maintain data consistency across page reloads.  
**Validates: Requirements 6.1, 6.7, 6.8, 6.9, 6.10**

**Property 12: Research Search and Display**  
*For any* PubMed search query with optional filters (date range, content type), the system SHALL query the API with correct parameters, display results with all required fields (title, authors, date, journal, abstract, URL, keywords), and respect the 3 requests/second rate limit.  
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10**

**Property 13: Research Citation Export**  
*For any* saved research paper, the system SHALL generate valid citations in all three formats (BibTeX, APA, MLA) that can be parsed by standard citation tools.  
**Validates: Requirements 7.7**

**Property 14: Education Content Completeness**  
*For any* dental condition from the 98 conditions, the system SHALL generate and display patient-friendly content including: symptoms, causes, treatments, prevention, interactive anatomy explorer, pre/post-procedure guidance, related conditions, and shareable cards.  
**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10**

**Property 15: Symptom Checker Data Collection**  
*For any* symptom checker session, the system SHALL collect all required data through the questionnaire: location (tooth/area), pain type, duration, triggers, associated symptoms, and medical history.  
**Validates: Requirements 9.2**

**Property 16: Symptom Checker Results Completeness**  
*For any* completed symptom assessment, the system SHALL provide: ranked possible conditions, urgency classification with color-coded recommendations, action guidance, home care recommendations, red flag warnings, and options to save/export results.  
**Validates: Requirements 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13, 9.14**

**Property 17: Cloud-Only & Offline Behavior**  
*For any* analysis request, the system SHALL check for internet connectivity. If connected, proceed with cloud inference. If disconnected, prevent inference and offer offline tools (cached content, symptom checker) with clear messaging.  
**Validates: Requirements 10.1, 10.4, 10.5**

**Property 19: Model Information Display**  
*For any* user viewing the model information page, the system SHALL display all required sections: architecture details, training data statistics (6 datasets, 4,148 samples, 98 conditions), capabilities showcase with interactive demo, performance metrics, technical details with model card, limitations, and resource links.  
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10**

**Property 20: Dashboard Completeness**  
*For any* dashboard view, the system SHALL display all required widgets: quick stats cards (4 metrics), recent activity timeline (last 10 items), quick action cards (11 features), and analytics charts (condition distribution pie chart, urgency breakdown bar chart, usage over time line chart).  
**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10**

**Property 21: Analysis History Management**  
*For any* history operation (view, filter, search, export, delete), the system SHALL: maintain reverse chronological order, support filtering by type and date range, enable keyword search, display all required fields per item (thumbnail, type, date, summary, urgency), support bulk operations, and persist changes to localStorage immediately.  
**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10**

**Property 22: Accessibility Compliance**  
*For any* page in the application, the system SHALL: provide keyboard navigation with focus indicators, include ARIA labels for screen readers, maintain WCAG 2.1 AA contrast ratios (≥ 4.5:1), use semantic HTML, respond to viewport changes (mobile 320px+, tablet 768px+, desktop 1024px+), and achieve Lighthouse accessibility score > 90.  
**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10**

**Property 23: Data Privacy and Security**  
*For any* user data (uploads, analyses, personal information), the system SHALL: never store data on servers (ephemeral processing only), enforce HTTPS-only connections, store API keys exclusively in environment variables, implement rate limiting (10 req/min for AI endpoints), display medical disclaimers on every page, and immediately remove all localStorage entries when user clears data.  
**Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10**

**Property 24: Performance Constraints**  
*For any* inference request, the system SHALL complete cloud inference within 5 seconds under normal conditions, and SHALL measure and tag processing time in results.  
**Validates: Requirements 16.1, 16.2**

**Property 25: Error Handling and Fallback**  
*For any* failed API request, the system SHALL: retry with exponential backoff (max 3 attempts), fall back to cached data or offline tools after retries exhausted, display user-friendly error messages without stack traces, and log errors for debugging while maintaining privacy.  
**Validates: Requirements 16.3, 16.4, 16.10**

**Property 26: Export Round-Trip Consistency**  
*For any* analysis result (X-ray or clinical assessment), exporting to JSON then parsing SHALL produce data equivalent to the original result (round-trip property).  
**Validates: Requirements 1.8**

**Property 27: PDF Generation Validity**  
*For any* analysis result or assessment, generating a PDF export SHALL produce a valid PDF file that can be opened by standard PDF readers.  
**Validates: Requirements 1.7, 2.15**

**Property 28: External API Integration**  
*For any* external API call (Google Places, PubMed, Gemini Live, Modal.com), the system SHALL: use API keys from environment variables, implement appropriate rate limiting, cache results when applicable, handle failures gracefully with user-friendly messages, and fall back to alternative methods when available.  
**Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 17.10**

**Property 29: PWA Offline Functionality**  
*For any* offline state, the PWA SHALL: serve cached pages and assets, provide access to cached clinical guidelines (98 conditions), enable symptom checker with rule-based engine, enable treatment progress tracker, enable voice TTS using Web Speech API, display offline indicator, and sync pending operations when connection is restored.  
**Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 18.10**

**Property 30: Form Auto-Save**  
*For any* clinical case form with unsaved changes, the system SHALL auto-save to localStorage every 30 seconds and restore data on page reload.  
**Validates: Requirements 2.14**


## Error Handling

### Error Categories and Strategies

#### 1. Network Errors

**Scenarios**:
- Modal.com API unreachable
- Google Places API timeout
- PubMed API rate limit exceeded
- Gemini Live connection dropped

**Handling Strategy**:
```typescript
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    fallback
  } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      if (attempt === maxRetries) {
        if (fallback) {
          console.warn('All retries exhausted, using fallback');
          return await fallback();
        }
        throw new NetworkError('Request failed after retries', error);
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await sleep(delay);
    }
  }
}

// Usage
const analysis = await fetchWithRetry(
  () => cloudClient.analyzeXray(image, type),
  {
    fallback: () => edgeClient.analyzeXray(image, type)
  }
);
```

**User Experience**:
- Display loading spinner during retries
- Show retry count: "Retrying... (2/3)"
- On final failure, show: "Unable to connect. Please check your internet connection."
- Graceful degradation to cached content where applicable

#### 2. Model Inference Errors

**Scenarios**:
- Invalid input format
- Model timeout (>30s)
- Malformed model output

**Handling Strategy**:
```typescript
class InferenceError extends Error {
  constructor(
    message: string,
    public code: InferenceErrorCode,
    public recoverable: boolean
  ) {
    super(message);
  }
}

enum InferenceErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  TIMEOUT = 'TIMEOUT',
  OUT_OF_MEMORY = 'OUT_OF_MEMORY',
  MALFORMED_OUTPUT = 'MALFORMED_OUTPUT',
  MODEL_NOT_LOADED = 'MODEL_NOT_LOADED'
}

async function safeInference<T>(
  inferenceFn: () => Promise<T>,
  validator: (result: T) => boolean
): Promise<T> {
  try {
    const result = await Promise.race([
      inferenceFn(),
      timeout(30000, 'Inference timeout')
    ]);
    
    if (!validator(result)) {
      throw new InferenceError(
        'Model output validation failed',
        InferenceErrorCode.MALFORMED_OUTPUT,
        true
      );
    }
    
    return result;
  } catch (error) {
    if (error instanceof InferenceError && error.recoverable) {
      // Retry with different parameters or fallback
      return await fallbackInference();
    }
    throw error;
  }
}
```

**User Experience**:
- "Processing your request..." (normal)
- "This is taking longer than usual..." (>10s)
- "Unable to process. Please try again or use a different image." (error)
- "Unable to process. Please try again or use a different image." (error)

#### 3. Data Validation Errors

**Scenarios**:
- Invalid image format
- Missing required form fields
- Invalid date ranges
- Malformed API responses

**Handling Strategy**:
```typescript
import { z } from 'zod';

// Schema definitions
const XRayImageSchema = z.object({
  file: z.instanceof(File),
  format: z.enum(['jpeg', 'png', 'dicom']),
  size: z.number().max(10 * 1024 * 1024) // 10MB max
});

const ClinicalCaseSchema = z.object({
  patient: z.object({
    age: z.number().min(0).max(150),
    gender: z.enum(['male', 'female', 'other'])
  }),
  chiefComplaint: z.object({
    description: z.string().min(10),
    duration: z.string(),
    painLevel: z.number().min(1).max(10)
  }),
  // ... other fields
});

// Validation with user-friendly errors
function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const friendlyErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: getFriendlyMessage(err)
      }));
      throw new ValidationError('Invalid input', friendlyErrors);
    }
    throw error;
  }
}

function getFriendlyMessage(error: z.ZodIssue): string {
  switch (error.code) {
    case 'too_small':
      return `Must be at least ${error.minimum} characters`;
    case 'too_big':
      return `Must be at most ${error.maximum} characters`;
    case 'invalid_type':
      return `Expected ${error.expected}, got ${error.received}`;
    default:
      return error.message;
  }
}
```

**User Experience**:
- Inline validation with red borders and error messages
- "Please enter a valid age (0-150)"
- "Image must be JPEG, PNG, or DICOM format"
- "File size must be under 10MB"

#### 4. Storage Errors

**Scenarios**:
- localStorage quota exceeded
- Cache corruption

**Handling Strategy**:
```typescript
class StorageManager {
  async saveToLocalStorage(key: string, data: any): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Clear old data and retry
        await this.clearOldData();
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch {
          throw new StorageError('Storage quota exceeded after cleanup');
        }
      }
      throw error;
    }
  }
  
  async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(storeName, 'readwrite');
      await tx.objectStore(storeName).put(data);
      await tx.done;
    } catch (error) {
      console.error('IndexedDB error:', error);
      throw new StorageError('Failed to save to IndexedDB', error);
    }
  }
  
  private async clearOldData(): Promise<void> {
    // Remove oldest history items
    const history = this.getHistory();
    const recentHistory = history.slice(0, 50); // Keep only 50 most recent
    localStorage.setItem('dentalgemma:history', JSON.stringify(recentHistory));
  }
}
```

**User Experience**:
- "Storage is full. Clearing old data..."
- "Unable to save. Please clear some history items."

#### 5. External API Errors

**Scenarios**:
- Google Places API key invalid
- PubMed rate limit exceeded
- Gemini Live quota exceeded
- Modal.com cold start timeout

**Handling Strategy**:
```typescript
class ExternalAPIClient {
  async callWithErrorHandling<T>(
    apiCall: () => Promise<T>,
    apiName: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      const apiError = this.parseAPIError(error, apiName);
      
      switch (apiError.code) {
        case 'RATE_LIMIT':
          await this.waitForRateLimit(apiError.retryAfter);
          return await apiCall();
          
        case 'INVALID_KEY':
          throw new APIError(`${apiName} API key is invalid. Please check configuration.`);
          
        case 'QUOTA_EXCEEDED':
          throw new APIError(`${apiName} quota exceeded. Please try again later.`);
          
        case 'SERVICE_UNAVAILABLE':
          throw new APIError(`${apiName} is temporarily unavailable. Please try again.`);
          
        default:
          throw new APIError(`${apiName} error: ${apiError.message}`);
      }
    }
  }
  
  private parseAPIError(error: any, apiName: string): ParsedAPIError {
    // Parse error based on API-specific format
    if (apiName === 'Google Places') {
      return {
        code: error.status === 'OVER_QUERY_LIMIT' ? 'RATE_LIMIT' : 'UNKNOWN',
        message: error.error_message || 'Unknown error',
        retryAfter: 1000
      };
    }
    // ... other APIs
  }
}
```

**User Experience**:
- "Searching for dentists..." (normal)
- "Rate limit reached. Retrying in 1 second..." (rate limit)
- "Unable to search. Please try again later." (quota exceeded)
- Fallback to cached results when available

### Error Logging

```typescript
class ErrorLogger {
  log(error: Error, context: ErrorContext): void {
    const errorReport = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context: {
        feature: context.feature,
        action: context.action,
        userId: 'anonymous', // No PII
        inferenceMode: context.inferenceMode,
        browser: navigator.userAgent
      }
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Report:', errorReport);
    }
    
    // In production, could send to error tracking service
    // (but respecting privacy - no user data)
  }
}
```

## Testing Strategy

### Dual Testing Approach

The application requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**:
```typescript
import fc from 'fast-check';

// Configure all property tests to run minimum 100 iterations
fc.configureGlobal({
  numRuns: 100,
  verbose: true
});
```

**Test Tagging Format**:
```typescript
describe('X-Ray Analysis', () => {
  it('Property 1: X-Ray Analysis Output Completeness - For any valid X-ray image and analysis type, output contains all required fields', () => {
    // Feature: dentalgemma-app, Property 1: X-Ray Analysis Output Completeness
    fc.assert(
      fc.property(
        fc.record({
          image: validXRayImageArbitrary(),
          type: fc.constantFrom('cavity', 'opg', 'tooth-id', 'general')
        }),
        async ({ image, type }) => {
          const result = await analyzeXray(image, type);
          
          expect(result).toHaveProperty('findings');
          expect(Array.isArray(result.findings)).toBe(true);
          expect(result).toHaveProperty('confidence');
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(1);
          expect(result).toHaveProperty('urgency');
          expect(['low', 'medium', 'high']).toContain(result.urgency);
          expect(result).toHaveProperty('recommendations');
          expect(Array.isArray(result.recommendations)).toBe(true);
          expect(result).toHaveProperty('processingTime');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Property Test Examples

#### Property 1: X-Ray Analysis Output Completeness

```typescript
// Arbitrary generators
const validXRayImageArbitrary = () => fc.record({
  data: fc.uint8Array({ minLength: 1000, maxLength: 10000 }),
  format: fc.constantFrom('jpeg', 'png', 'dicom'),
  width: fc.integer({ min: 100, max: 2000 }),
  height: fc.integer({ min: 100, max: 2000 })
});

// Property test
test('Property 1: X-Ray Analysis Output Completeness', async () => {
  await fc.assert(
    fc.asyncProperty(
      validXRayImageArbitrary(),
      fc.constantFrom('cavity', 'opg', 'tooth-id', 'general'),
      async (image, analysisType) => {
        const result = await analyzeXray(image, analysisType);
        
        // Verify all required fields present
        expect(result).toMatchObject({
          findings: expect.any(Array),
          confidence: expect.any(Number),
          urgency: expect.stringMatching(/^(low|medium|high)$/),
          recommendations: expect.any(Array),
          processingTime: expect.any(Number)
        });
        
        // Verify confidence in valid range
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 2: Image Format Validation

```typescript
test('Property 2: Image Format Validation', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        data: fc.uint8Array({ minLength: 100, maxLength: 1000 }),
        format: fc.string()
      }),
      async (file) => {
        const validFormats = ['jpeg', 'png', 'dicom'];
        const isValid = validFormats.includes(file.format);
        
        if (isValid) {
          // Should accept
          await expect(validateImageFormat(file)).resolves.not.toThrow();
        } else {
          // Should reject
          await expect(validateImageFormat(file)).rejects.toThrow(/invalid format/i);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 26: Export Round-Trip Consistency

```typescript
test('Property 26: Export Round-Trip Consistency', async () => {
  await fc.assert(
    fc.asyncProperty(
      validXRayAnalysisArbitrary(),
      async (analysis) => {
        // Export to JSON
        const json = exportToJSON(analysis);
        
        // Parse back
        const parsed = JSON.parse(json);
        
        // Should be equivalent
        expect(parsed).toEqual(analysis);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Examples

#### Edge Cases

```typescript
describe('X-Ray Analysis Edge Cases', () => {
  it('should handle empty image', async () => {
    const emptyImage = new Uint8Array(0);
    await expect(analyzeXray(emptyImage, 'cavity')).rejects.toThrow(/empty image/i);
  });
  
  it('should handle very large image', async () => {
    const largeImage = new Uint8Array(20 * 1024 * 1024); // 20MB
    await expect(analyzeXray(largeImage, 'cavity')).rejects.toThrow(/file too large/i);
  });
  
  it('should handle corrupted image data', async () => {
    const corruptedImage = new Uint8Array([0xFF, 0xD8, 0xFF]); // Incomplete JPEG
    await expect(analyzeXray(corruptedImage, 'cavity')).rejects.toThrow(/corrupted/i);
  });
});
```

#### Integration Tests

```typescript
describe('Agentic Workflow Integration', () => {
  it('should execute complete workflow with image and text', async () => {
    const input = {
      text: '45M with severe pain in tooth #14',
      image: await loadTestImage('cavity-sample.jpg'),
      location: 'New York, NY'
    };
    
    const workflow = new AgenticWorkflowEngine();
    const steps: WorkflowStep[] = [];
    
    for await (const step of workflow.execute(input)) {
      steps.push(step);
    }
    
    // Verify all expected agents executed
    expect(steps.map(s => s.agent)).toEqual([
      'Coordinator',
      'X-Ray Analyzer',
      'Clinical Assessor',
      'Research Synthesizer',
      'Referral Agent',
      'Report Generator'
    ]);
    
    // Verify final report generated
    const finalStep = steps[steps.length - 1];
    expect(finalStep.output).toHaveProperty('finalReport');
    expect(finalStep.output.finalReport).toContain('diagnosis');
  });
});
```

#### Error Handling Tests

```typescript
describe('Error Handling', () => {
  it('should retry on network failure', async () => {
    let attempts = 0;
    const mockFetch = jest.fn(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Network error');
      }
      return Promise.resolve({ ok: true, json: () => ({}) });
    });
    
    const result = await fetchWithRetry(mockFetch, { maxRetries: 3 });
    
    expect(attempts).toBe(3);
    expect(result).toBeDefined();
  });
  
  it('should handle cloud failure gracefully', async () => {
    const cloudClient = {
      analyzeXray: jest.fn().mockRejectedValue(new Error('Cloud unavailable'))
    };
    
    await expect(cloudClient.analyzeXray()).rejects.toThrow('Cloud unavailable');
  });
});
```

### Test Coverage Goals

- **Unit Test Coverage**: > 80% line coverage
- **Property Test Coverage**: All 30 correctness properties implemented
- **Integration Test Coverage**: All 11 features with end-to-end tests
- **Accessibility Tests**: WCAG 2.1 AA compliance verified with axe-core
- **Performance Tests**: Inference time constraints verified

### Testing Tools

- **Unit Testing**: Jest + React Testing Library
- **Property Testing**: fast-check
- **E2E Testing**: Playwright
- **Accessibility**: axe-core + jest-axe
- **Performance**: Lighthouse CI
- **Visual Regression**: Percy or Chromatic

