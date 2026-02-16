# 🦷 DentalGemma Professional Demo Application - Complete Implementation Plan

**Project:** DentalGemma AI Assistant  
**Challenge:** [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge)  
**Model:** Fine-tuned MedGemma 1.5 4B IT for Dental Diagnostics  
**Deployment:** Vercel (Frontend) + Modal.com (ML Backend) + External APIs

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Overview](#application-overview)
3. [Core Features](#core-features)
4. [Technical Architecture](#technical-architecture)
5. [Project Structure](#project-structure)
6. [Modal.com Deployment](#modalcom-deployment)
7. [External API Integrations](#external-api-integrations)
8. [UI/UX Design](#uiux-design)
9. [Key Pages](#key-pages)
10. [Security & Compliance](#security--compliance)
11. [Challenge Alignment](#challenge-alignment)
12. [Implementation Timeline](#implementation-timeline)
13. [Cost Estimation](#cost-estimation)

---

## 🎯 Executive Summary

Create a **production-ready dental AI diagnostic platform** with **hybrid cloud-edge architecture** and **agentic workflow capabilities** for the MedGemma Impact Challenge. The application integrates:

- **Fine-tuned MedGemma models** (VQA + Instruct) for dental diagnostics
- **Hybrid Inference** - Cloud (Modal.com) OR Edge (WebGPU) - user's choice
- **Multi-Agent Diagnostic System** - Intelligent workflow orchestration
- **Google Gemini Live API** for real-time voice consultation
- **Google Places API** for dentist location services
- **Exa Neural Search** for evidence-based research

**Deployment:** Vercel (Frontend PWA) + Modal.com (Cloud Backend) + Transformers.js (Edge Inference)  
**Tech Stack:** Next.js 14 PWA, TypeScript, Tailwind CSS, Shadcn UI, Transformers.js, WebGPU  
**Prize Targets:** Main Track + Edge AI Prize + Agentic Workflow Prize

---

## 🚀 Application Overview

**Name:** DentalGemma AI Assistant  
**Tagline:** "Privacy-First Edge AI for Dental Diagnostics with Intelligent Agentic Workflows"  
**Target Users:** Dental professionals, students, researchers, patients (educational)

### Key Differentiators

✅ **Novel Task Adaptation** - MedGemma fine-tuned for dental domain (not in original training)  
✅ **Hybrid Cloud-Edge Architecture** - User choice: Cloud speed OR Edge privacy  
✅ **Agentic Workflow System** - Multi-agent orchestration with tool calling  
✅ **Edge AI Capable** - Runs on-device with WebGPU acceleration  
✅ **Privacy-First** - Optional local inference, data never leaves device  
✅ **Multimodal Capabilities** - Text + Image analysis  
✅ **Real-time Voice** - Hands-free clinical workflow  
✅ **Evidence-based** - Integrated research dashboard  
✅ **Practical Utility** - Dentist finder for patient referrals

---

## 🔧 Core Features

### 1. 🔍 X-Ray Analysis Suite

**Capabilities from VQA Dataset (1,654 samples):**

#### A. Cavity Detection (~418 samples)
- **Input:** Intraoral X-ray images (JPG/PNG)
- **Output:**
  - Cavity count (0, 1, 2, 3+)
  - Normal vs. cavity classification
  - Confidence scores
  - Visual overlay (if bounding box available)
  
#### B. Panoramic OPG Classification (~517 samples)
- **Input:** Panoramic (OPG) X-ray images
- **Output:** 6-class pathology detection
  - ✅ Healthy Teeth
  - 🦷 Caries
  - 🔒 Impacted Teeth
  - 💔 BDC-BDR (Broken Down Crown/Root)
  - 🦠 Infection
  - ⚡ Fractured Teeth
  
#### C. Tooth Identification (~64 samples)
- **Input:** Panoramic X-ray images
- **Output:**
  - Total tooth count
  - Tooth type classification (8 classes)
  - Per-tooth identification
  
#### D. General Radiographic Assessment (~655 samples)
- **Input:** Dental radiographs
- **Output:**
  - Systematic evaluation report
  - Clinical findings
  - Quality assessment

**UI/UX Features:**
- Drag-and-drop image upload
- Sample X-rays for testing (demo mode)
- Real-time analysis with progress indicator
- Split-view: Original image + Annotated results
- Confidence scores with color coding
- Downloadable PDF report
- Image comparison slider

**Technical Implementation:**

```typescript
// API Route: /api/analyze-xray
POST /api/analyze-xray
Body: {
  image: base64 | URL,
  analysisType: "cavity" | "opg" | "tooth-id" | "general"
}

Response: {
  success: boolean,
  analysis: {
    type: string,
    findings: string[],
    confidence: number,
    urgency: "low" | "medium" | "high",
    recommendations: string[],
    visualData?: { boxes: [], labels: [] }
  },
  processingTime: number
}
```

---

### 2. 📋 Comprehensive Clinical Case Assessment

**Capabilities from Instruct Dataset (2,494 cases, 98 conditions):**

#### Input Form (Multi-step)

**Step 1: Patient Information**
- Age (number input)
- Gender (select: Male/Female/Other)
- Patient ID (optional, for tracking)

**Step 2: Chief Complaint**
- Primary complaint (textarea)
- Duration of symptoms (text)
- Pain level (1-10 scale)
- Symptom triggers (checkboxes)

**Step 3: Clinical Examination**
- Intraoral findings (textarea)
- Extraoral findings (textarea)
- Soft tissue examination (textarea)
- Periodontal status (textarea)

**Step 4: Radiographic Findings**
- X-ray description (textarea)
- Optional: Upload X-ray image (integrates with VQA model)
- Bone loss assessment
- Periapical status

**Step 5: Medical History**
- Current medications (textarea)
- Allergies (textarea)
- Systemic conditions (checkboxes: Diabetes, Hypertension, etc.)
- Previous dental treatments (textarea)

#### Output Report (Structured)

**1. 🎯 Primary Diagnosis**
- Condition name
- ICD-10 code (if applicable)
- Confidence level (percentage)
- Differential diagnoses (top 3)

**2. 🔬 Etiology Analysis**
- Root cause identification
- Contributing factors
- Risk factors present

**3. ⚠️ Urgency Classification**

- 🔴 **Urgent** - Immediate attention required (within 24 hours)
- 🟡 **Moderate** - Schedule within 1 week
- 🟢 **Elective** - Routine scheduling acceptable

**4. 📝 Management Plan**
- Immediate interventions
- Step-by-step treatment protocol
- Alternative treatment options
- Expected outcomes
- Treatment duration estimate

**5. 💊 Antibiotic Recommendations**
- Indication for antibiotics (Yes/No with reasoning)
- Recommended antibiotic (if applicable)
- Dosage and duration
- Alternative options (for allergies)
- Evidence-based rationale

**6. 📅 Follow-up Schedule**
- Initial follow-up timing
- Monitoring parameters
- Long-term follow-up plan
- Red flags to watch for

**7. 👥 Patient Counseling**
- Explanation in simple terms
- Home care instructions
- Dietary recommendations
- Pain management advice
- When to seek emergency care

**8. 📚 Clinical Guidelines**
- Relevant clinical practice guidelines
- Scientific references
- Evidence level (A/B/C)

**UI/UX Features:**
- Multi-step form with progress bar
- Auto-save to localStorage (every 30 seconds)
- Field validation with helpful error messages
- Collapsible sections for better organization
- Print-friendly report layout
- Export as PDF with professional formatting
- Share via email (optional)
- Save to history for future reference

**Technical Implementation:**
```typescript
// API Route: /api/assess-case
POST /api/assess-case
Body: {
  patient: { age, gender },
  chiefComplaint: string,
  clinicalFindings: string,
  radiographicFindings: string,
  medicalHistory: string,
  xrayImage?: base64 // Optional multimodal input
}

Response: {
  success: boolean,
  assessment: {
    diagnosis: { primary, differential[], confidence },
    etiology: string,
    urgency: "urgent" | "moderate" | "elective",
    managementPlan: string[],
    antibiotics: { indicated, recommendation, rationale },
    followUp: string[],
    patientCounseling: string[],
    clinicalGuidelines: { title, reference, evidenceLevel }[]
  },
  processingTime: number
}
```

---

### 3. 🎤 Real-Time Voice Consultation

**Using Google Gemini Live API**

**Model:** `gemini-live-2.5-flash-preview`  
**Documentation:** [Gemini Live API Guide](https://ai.google.dev/gemini-api/docs/live-guide)

#### Features

**Core Capabilities:**
- 🗣️ Real-time bidirectional voice conversation
- 🎯 Voice Activity Detection (VAD) - automatic turn-taking
- 📝 Live transcription (both user and AI)
- 🔊 Natural, human-like voice responses
- 💬 Session management for long conversations
- ⚡ Low-latency streaming (<500ms)

**Use Cases:**
1. **Quick Symptom Assessment**
   - "I have pain in my upper left molar"
   - AI asks follow-up questions
   - Provides preliminary assessment

2. **Treatment Explanation**
   - "Explain root canal procedure to me"
   - AI provides patient-friendly explanation
   - Answers follow-up questions

3. **Chairside Consultation**
   - Hands-free during procedures
   - Voice-activated clinical queries
   - Real-time documentation assistance

4. **Educational Q&A**
   - Dental students asking questions
   - Continuing education support
   - Case discussion

**UI/UX Features:**
- Large microphone button (push-to-talk or continuous)
- Real-time audio waveform visualization
- Live transcription display (scrolling)
- Conversation history panel
- Export transcript as text/PDF
- Voice settings (speed, language)
- Background noise indicator
- Connection status indicator

**Technical Implementation:**

```typescript
// API Route: /api/voice/connect (WebSocket)
// Client-side implementation

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
const model = 'gemini-live-2.5-flash-preview';

const session = await ai.live.connect({
  model: model,
  config: {
    responseModalities: ['AUDIO', 'TEXT'],
    systemInstruction: `You are an expert dental AI assistant. 
    Provide accurate, evidence-based dental information. 
    Always recommend consulting a licensed dentist for diagnosis.`
  }
});

// Send audio stream
await session.send({
  realtimeInput: {
    audio: audioBuffer,
    mimeType: 'audio/pcm;rate=16000'
  }
});

// Receive responses
for await (const response of session.receive()) {
  if (response.text) {
    // Display transcription
  }
  if (response.audio) {
    // Play audio response
  }
}
```

---

### 4. 🗺️ Find Nearby Dentists

**Using Google Places API**

#### Features

**Search Capabilities:**
- 📍 Location-based search (address, city, or coordinates)
- 🔍 Radius filter (1, 5, 10, 25 miles)
- 🏥 Specialty filter:
  - General Dentistry
  - Orthodontics
  - Endodontics
  - Periodontics
  - Oral Surgery
  - Pediatric Dentistry
  - Prosthodontics
  - Cosmetic Dentistry
- ⭐ Rating filter (4+ stars, 4.5+ stars)
- 💰 Price level filter ($, $$, $$$, $$$$)
- 🕐 Open now filter

**Display Information:**
- Interactive map with markers (Leaflet.js or Google Maps)
- Practice name and specialty
- ⭐ Rating (1-5 stars) + review count
- 📍 Distance from search location
- 📞 Phone number (click to call)
- 🌐 Website link
- 📧 Email (if available)
- 🕐 Hours of operation
- 💰 Price level indicator
- 📸 Photos (if available)
- 📝 Recent reviews (top 3)
- 🚗 Directions link (Google Maps)

**UI/UX Features:**
- Split view: Map (left) + List (right)
- Marker clustering for dense areas
- Click marker to highlight in list
- Filter panel (collapsible on mobile)
- Sort options:
  - Distance (nearest first)
  - Rating (highest first)
  - Review count (most reviewed)
  - Price (lowest first)
- Save favorites (localStorage)
- Share dentist info
- Mobile-responsive (map stacks on top)

**Technical Implementation:**

```typescript
// API Route: /api/find-dentists
POST /api/find-dentists
Body: {
  location: string | { lat: number, lng: number },
  radius: number, // in meters
  specialty?: string,
  minRating?: number,
  priceLevel?: number[],
  openNow?: boolean
}

Response: {
  success: boolean,
  results: [
    {
      placeId: string,
      name: string,
      address: string,
      location: { lat, lng },
      distance: number, // in miles
      rating: number,
      reviewCount: number,
      priceLevel: number,
      phone: string,
      website: string,
      hours: { open, close }[],
      photos: string[],
      reviews: { author, rating, text, time }[]
    }
  ],
  mapCenter: { lat, lng },
  totalResults: number
}

// Implementation using Google Places API
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const response = await client.placesNearby({
  params: {
    location: { lat, lng },
    radius: radiusInMeters,
    type: "dentist",
    keyword: specialty,
    key: process.env.GOOGLE_PLACES_API_KEY
  }
});
```

**Map Integration:**
```typescript
// Using react-leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[lat, lng]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {dentists.map(dentist => (
    <Marker key={dentist.placeId} position={[dentist.location.lat, dentist.location.lng]}>
      <Popup>
        <h3>{dentist.name}</h3>
        <p>⭐ {dentist.rating} ({dentist.reviewCount} reviews)</p>
        <p>📍 {dentist.distance} miles away</p>
      </Popup>
    </Marker>
  ))}
</MapContainer>
```

---

### 5. 🔬 Evidence-Based Research Dashboard

**Using Exa Neural Search API**

#### Features

**Search Capabilities:**
- 🧠 Neural semantic search (AI-powered relevance)
- 📚 Source filtering:
  - PubMed / MEDLINE
  - Dental journals
  - Clinical guidelines
  - University research
  - .edu domains
  - .gov domains
- 📅 Date range filter (last 6 months, 1 year, 5 years, all time)
- 🏷️ Content type filter:
  - Research papers
  - Clinical trials
  - Systematic reviews
  - Case reports
  - Guidelines
- 🔍 Advanced query options:
  - Autoprompt (AI query enhancement)
  - Similar content search
  - Citation tracking

**Display Information:**
- 📄 Article title (clickable)
- ✍️ Authors and affiliations
- 📅 Publication date
- 📰 Journal/source name
- 📊 Relevance score (0-100)
- 📝 Abstract/summary (first 300 words)
- 🔗 Full-text link (if available)
- 📚 Citation count (if available)
- 🏷️ Keywords/tags
- 💾 Save to reading list
- 📤 Export citation (BibTeX, APA, MLA)

**UI/UX Features:**
- Search bar with autocomplete
- Advanced filter panel (collapsible)
- Results grid/list view toggle
- Infinite scroll or pagination
- Highlight search terms in results
- Quick preview modal (abstract)
- Reading list sidebar
- Export selected citations
- Share search results
- Search history

**Technical Implementation:**

```typescript
// API Route: /api/research
POST /api/research
Body: {
  query: string,
  filters?: {
    dateRange?: { start: string, end: string },
    domains?: string[], // ["pubmed.gov", ".edu"]
    contentType?: string,
    numResults?: number
  },
  useAutoprompt?: boolean
}

Response: {
  success: boolean,
  results: [
    {
      id: string,
      title: string,
      url: string,
      author: string,
      publishedDate: string,
      score: number,
      text: string, // abstract/summary
      highlights: string[],
      domain: string
    }
  ],
  autopromptQuery?: string, // if autoprompt used
  totalResults: number
}

// Implementation using Exa API
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);
const results = await exa.searchAndContents(query, {
  type: "neural",
  useAutoprompt: true,
  numResults: 10,
  includeDomains: ["pubmed.ncbi.nlm.nih.gov", ".edu"],
  startPublishedDate: "2020-01-01",
  text: { maxCharacters: 1000 }
});
```

---

### 6. 📊 Interactive Dashboard

**Features:**
- 📈 Usage statistics (analyses performed, cases assessed)
- 🕐 Recent activity timeline
- ⭐ Saved items (X-rays, cases, research papers)
- 📊 Condition distribution chart (pie chart)
- ⚠️ Urgency breakdown (bar chart)
- 🎯 Quick action cards:
  - Analyze X-ray
  - Assess case
  - Voice consultation
  - Find dentist
  - Research
- 🔔 Notifications (if any)
- 👤 User profile (optional, for saved data)

---

### 7. 🤖 Multi-Agent Diagnostic Workflow (NEW - Agentic)

**Intelligent Orchestration System**

**What it does:**
Reimagines the dental diagnostic workflow by deploying multiple AI agents that work together to provide comprehensive analysis.

**Agent Architecture:**

```typescript
// Multi-Agent System
class DentalDiagnosticAgent {
  private agents = {
    coordinator: new CoordinatorAgent(),
    xrayAnalyzer: new XRayAnalyzerAgent(),
    clinicalAssessor: new ClinicalAssessorAgent(),
    researchSynthesizer: new ResearchSynthesizerAgent(),
    referralAgent: new ReferralAgent(),
  };
  
  async diagnose(input: PatientCase) {
    // Coordinator plans the workflow
    const plan = await this.agents.coordinator.createPlan(input);
    
    // Execute multi-step workflow
    const results = await this.executeWorkflow(plan);
    
    return results;
  }
}
```

**Workflow Steps:**

1. **📋 Intake Agent**
   - Analyzes patient complaint
   - Identifies required diagnostic steps
   - Creates execution plan

2. **🔍 X-Ray Analysis Agent** (if image provided)
   - Calls VQA model (cloud or edge)
   - Extracts findings
   - Identifies abnormalities

3. **🩺 Clinical Assessment Agent**
   - Synthesizes all available data
   - Generates differential diagnosis
   - Determines urgency level

4. **🔬 Research Agent**
   - Searches for relevant clinical guidelines
   - Finds similar cases
   - Synthesizes evidence-based recommendations

5. **🏥 Referral Agent** (if needed)
   - Determines if specialist needed
   - Finds nearby specialists
   - Provides referral information

6. **📝 Report Synthesis Agent**
   - Combines all agent outputs
   - Generates comprehensive report
   - Provides actionable recommendations

**Tool Calling Framework:**

```typescript
// Agent can call multiple tools
const tools = {
  analyzeXray: async (image) => { /* VQA model */ },
  searchResearch: async (query) => { /* Exa API */ },
  findSpecialist: async (specialty, location) => { /* Places API */ },
  assessCase: async (data) => { /* Instruct model */ },
  synthesizeEvidence: async (papers) => { /* LLM synthesis */ }
};

// Coordinator decides which tools to use
const workflow = await coordinator.plan({
  hasXray: true,
  urgency: "moderate",
  requiresSpecialist: false
});

// Example workflow:
// 1. analyzeXray(image)
// 2. searchResearch(findings)
// 3. assessCase(combined_data)
// 4. synthesizeEvidence(research_results)
```

**UI/UX Features:**
- Workflow visualization (step-by-step progress)
- Agent activity log (transparency)
- Tool call history (what was searched, analyzed)
- Confidence scores per agent
- Override options (user can guide workflow)
- Export complete workflow trace

**Example Workflow:**

```
User Input: "45M with severe pain in tooth #14, X-ray attached"

Agent Workflow:
┌─────────────────────────────────────────────────────────┐
│ 1. Coordinator Agent                                     │
│    ✓ Detected: X-ray image present                      │
│    ✓ Plan: Analyze X-ray → Search research → Assess     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. X-Ray Analyzer Agent                                  │
│    ✓ Tool: analyzeXray(image)                           │
│    ✓ Finding: Deep cavity in tooth #14                  │
│    ✓ Finding: Periapical radiolucency                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Research Agent                                        │
│    ✓ Tool: searchResearch("periapical abscess")         │
│    ✓ Found: 5 relevant clinical guidelines              │
│    ✓ Synthesized: Treatment protocols                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Clinical Assessor Agent                               │
│    ✓ Tool: assessCase(combined_data)                    │
│    ✓ Diagnosis: Acute periapical abscess                │
│    ✓ Urgency: URGENT (within 24 hours)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Referral Agent                                        │
│    ✓ Tool: findSpecialist("endodontist", user_location) │
│    ✓ Found: 3 nearby endodontists                       │
│    ✓ Sorted by: Rating, distance                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Report Synthesis Agent                                │
│    ✓ Combined all findings                              │
│    ✓ Generated comprehensive report                     │
│    ✓ Included: Diagnosis, treatment, referrals          │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Automates complex diagnostic workflow
- ✅ Reduces time from hours to minutes
- ✅ Ensures no steps are missed
- ✅ Evidence-based recommendations
- ✅ Transparent decision-making
- ✅ Qualifies for Agentic Workflow Prize 🏆

---

### 8. 🔄 Inference Mode Manager (NEW - Edge AI)

**Hybrid Cloud-Edge System**

**What it does:**
Allows users to choose between cloud inference (fast, reliable) or edge inference (private, offline).

**Features:**

**Mode Selection:**
- 🌐 **Cloud Mode** (Default)
  - Fast inference (2-3 seconds)
  - Reliable (99.9% uptime)
  - No setup required
  - Uses Modal.com backend

- 💻 **Edge Mode** (Optional)
  - Private (data never leaves device)
  - Offline capable
  - Zero server costs
  - Requires model download (2.5 GB, one-time)

**Model Download Manager:**
```typescript
class ModelDownloadManager {
  async downloadModel() {
    // Download quantized ONNX model
    const modelUrl = 'https://huggingface.co/.../dentalgemma-vqa-onnx-q4';
    
    // Show progress
    const progress = await this.downloadWithProgress(modelUrl);
    
    // Cache in IndexedDB
    await this.cacheModel(progress.data);
    
    // Initialize Transformers.js
    await this.initializeLocalInference();
  }
  
  async checkModelAvailability() {
    // Check if model cached
    const cached = await this.isModelCached();
    
    // Check WebGPU support
    const webgpuAvailable = 'gpu' in navigator;
    
    return { cached, webgpuAvailable };
  }
}
```

**UI Components:**

1. **Mode Toggle**
   - Switch between Cloud/Edge
   - Shows current mode
   - Displays performance metrics

2. **Download Progress**
   - Progress bar (0-100%)
   - Download speed
   - Estimated time remaining
   - Pause/Resume capability

3. **Performance Dashboard**
   - Inference time comparison
   - Memory usage
   - Battery impact (mobile)
   - Cost savings (edge mode)

4. **Smart Recommendations**
   - Suggests cloud mode on mobile data
   - Suggests edge mode for sensitive data
   - Warns about battery drain

**Technical Implementation:**

```typescript
// Transformers.js + WebGPU
import { pipeline, env } from '@xenova/transformers';

class EdgeInferenceEngine {
  private model: any;
  
  async initialize() {
    // Enable WebGPU
    env.backends.onnx.wasm.proxy = false;
    
    // Load quantized model
    this.model = await pipeline(
      'image-text-to-text',
      'dentalgemma-vqa-onnx-q4',
      {
        device: 'webgpu',
        dtype: 'q4',
        cache_dir: 'indexeddb://models'
      }
    );
  }
  
  async analyze(image: ImageData, prompt: string) {
    const startTime = performance.now();
    
    const result = await this.model(image, {
      prompt,
      max_new_tokens: 512,
      do_sample: false
    });
    
    const inferenceTime = performance.now() - startTime;
    
    return {
      analysis: result,
      inferenceTime,
      source: 'edge'
    };
  }
}
```

**Benefits:**
- ✅ User choice (speed vs privacy)
- ✅ Automatic fallback (reliability)
- ✅ Zero additional cost (edge is optional)
- ✅ HIPAA-friendly (local mode)
- ✅ Offline capability
- ✅ Qualifies for Edge AI Prize 🏆

---

## 🏗️ Technical Architecture (Hybrid Cloud-Edge + Agentic)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel PWA)                                 │
│                                                                          │
│  Next.js 14 PWA + TypeScript + Tailwind CSS + Shadcn UI + Service Worker│
│                                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ X-Ray    │ │ Clinical │ │ Voice    │ │ Dentist  │ │ Multi-Agent  │ │
│  │ Analysis │ │ Case     │ │ Agent    │ │ Finder   │ │ Workflow     │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              INFERENCE MODE MANAGER                               │  │
│  │                                                                   │  │
│  │  [Cloud Mode] ←→ Toggle ←→ [Edge Mode]                          │  │
│  │                                                                   │  │
│  │  Cloud: Fast (2-3s) | Edge: Private (3-10s)                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────────┐       ┌───────────────────────┐
        │   CLOUD PATH          │       │   EDGE PATH           │
        │                       │       │                       │
        │   Next.js API Routes  │       │   Transformers.js     │
        │   + Modal.com         │       │   + WebGPU            │
        │                       │       │   + IndexedDB Cache   │
        └───────────────────────┘       └───────────────────────┘
                    │                               │
        ┌───────────┴───────────┐                  │
        ▼                       ▼                  ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Modal.com    │    │ External APIs    │    │ Browser Storage  │
│              │    │                  │    │                  │
│ • VQA Model  │    │ • Gemini Live    │    │ • ONNX Model     │
│ • Instruct   │    │ • Places API     │    │   (2.5 GB)       │
│   Model      │    │ • Exa Search     │    │ • IndexedDB      │
│              │    │                  │    │ • Cache API      │
└──────────────┘    └──────────────────┘    └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    AGENTIC WORKFLOW LAYER                                │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ Coordinator  │→ │ X-Ray        │→ │ Research     │→ │ Referral   │ │
│  │ Agent        │  │ Analyzer     │  │ Synthesizer  │  │ Agent      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                          │
│  Tool Calling: analyzeXray | searchResearch | findSpecialist | assess   │
└─────────────────────────────────────────────────────────────────────────┘
```

**Technology Stack:**

**Frontend:**
- Next.js 14 (App Router) with PWA support
- TypeScript
- Tailwind CSS
- Shadcn UI components
- React Leaflet (maps)
- Recharts (data visualization)
- React Hook Form (forms)
- Zod (validation)
- Zustand (state management)
- Workbox (Service Worker)

**Edge AI:**
- Transformers.js v4 (WebGPU support)
- ONNX Runtime Web
- WebGPU API
- IndexedDB (model caching)
- Cache API (offline support)

**Cloud Backend:**
- Next.js API Routes
- Modal.com (ML inference)
- Google Gemini Live API
- Google Places API
- Exa Search API

**Agentic System:**
- LangChain.js (agent orchestration)
- Custom tool calling framework
- Multi-agent coordination
- Workflow state management

**Deployment:**
- Vercel (PWA + API routes)
- Modal.com (GPU inference)
- CDN (model distribution)

---


## 📦 Project Structure

```
dentalgemma-app/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                      # Landing page
│   │   ├── about/page.tsx                # About the project
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Dashboard layout with sidebar
│   │   ├── page.tsx                      # Main dashboard
│   │   ├── xray-analysis/
│   │   │   └── page.tsx                  # X-ray analysis interface
│   │   ├── clinical-assessment/
│   │   │   └── page.tsx                  # Clinical case form
│   │   ├── voice-consultation/
│   │   │   └── page.tsx                  # Voice agent interface
│   │   ├── find-dentists/
│   │   │   └── page.tsx                  # Dentist finder with map
│   │   ├── research/
│   │   │   └── page.tsx                  # Research dashboard
│   │   ├── agentic-workflow/
│   │   │   └── page.tsx                  # Multi-agent diagnostic workflow
│   │   ├── settings/
│   │   │   └── page.tsx                  # Inference mode settings
│   │   └── history/
│   │       └── page.tsx                  # Analysis history
│   ├── api/
│   │   ├── analyze-xray/
│   │   │   └── route.ts                  # Modal VQA endpoint proxy
│   │   ├── assess-case/
│   │   │   └── route.ts                  # Modal Instruct endpoint proxy
│   │   ├── voice/
│   │   │   └── route.ts                  # Gemini Live API proxy
│   │   ├── find-dentists/
│   │   │   └── route.ts                  # Google Places API proxy
│   │   ├── research/
│   │   │   └── route.ts                  # Exa Search API proxy
│   │   └── agentic/
│   │       └── route.ts                  # Multi-agent workflow endpoint
│   ├── manifest.json                     # PWA manifest
│   ├── layout.tsx                        # Root layout
│   └── globals.css                       # Global styles
├── components/
│   ├── ui/                               # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   ├── switch.tsx
│   │   └── ...
│   ├── xray/
│   │   ├── xray-uploader.tsx             # Drag-drop upload
│   │   ├── xray-viewer.tsx               # Image viewer with zoom
│   │   ├── analysis-results.tsx          # Results display
│   │   └── sample-xrays.tsx              # Demo images
│   ├── case/
│   │   ├── case-form.tsx                 # Multi-step form
│   │   ├── assessment-report.tsx         # Report viewer
│   │   └── pdf-export.tsx                # PDF generation
│   ├── voice/
│   │   ├── voice-interface.tsx           # Microphone controls
│   │   ├── audio-visualizer.tsx          # Waveform display
│   │   └── transcript-viewer.tsx         # Conversation history
│   ├── dentist/
│   │   ├── dentist-map.tsx               # Leaflet map
│   │   ├── dentist-list.tsx              # Results list
│   │   ├── dentist-card.tsx              # Individual dentist card
│   │   └── filter-panel.tsx              # Search filters
│   ├── research/
│   │   ├── search-bar.tsx                # Search interface
│   │   ├── research-results.tsx          # Results grid
│   │   ├── paper-card.tsx                # Individual paper card
│   │   └── citation-export.tsx           # Export citations
│   ├── agentic/
│   │   ├── workflow-visualizer.tsx       # Agent workflow display
│   │   ├── agent-card.tsx                # Individual agent status
│   │   ├── tool-call-log.tsx             # Tool execution history
│   │   └── workflow-controls.tsx         # Start/stop/override
│   ├── edge/
│   │   ├── inference-mode-toggle.tsx     # Cloud/Edge switcher
│   │   ├── model-download-manager.tsx    # Download progress
│   │   ├── performance-dashboard.tsx     # Metrics comparison
│   │   └── webgpu-detector.tsx           # Capability detection
│   ├── dashboard/
│   │   ├── stats-cards.tsx               # Statistics cards
│   │   ├── activity-timeline.tsx         # Recent activity
│   │   └── charts.tsx                    # Data visualizations
│   ├── layout/
│   │   ├── navbar.tsx                    # Top navigation
│   │   ├── sidebar.tsx                   # Side navigation
│   │   └── footer.tsx                    # Footer
│   └── shared/
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       └── disclaimer.tsx                # Medical disclaimer
├── lib/
│   ├── api/
│   │   ├── modal-client.ts               # Modal API client
│   │   ├── gemini-client.ts              # Gemini Live client
│   │   ├── places-client.ts              # Google Places client
│   │   └── exa-client.ts                 # Exa Search client
│   ├── edge/
│   │   ├── inference-manager.ts          # Hybrid cloud/edge manager
│   │   ├── transformers-client.ts        # Transformers.js wrapper
│   │   ├── model-cache.ts                # IndexedDB model storage
│   │   └── webgpu-utils.ts               # WebGPU helpers
│   ├── agentic/
│   │   ├── agent-coordinator.ts          # Multi-agent orchestrator
│   │   ├── tool-registry.ts              # Tool calling framework
│   │   ├── workflow-engine.ts            # Workflow execution
│   │   └── agents/
│   │       ├── xray-analyzer.ts          # X-ray analysis agent
│   │       ├── clinical-assessor.ts      # Clinical assessment agent
│   │       ├── research-synthesizer.ts   # Research synthesis agent
│   │       └── referral-agent.ts         # Specialist referral agent
│   ├── utils.ts                          # Utility functions
│   ├── constants.ts                      # App constants
│   └── validations.ts                    # Zod schemas
├── hooks/
│   ├── use-xray-analysis.ts
│   ├── use-case-assessment.ts
│   ├── use-voice-session.ts
│   ├── use-dentist-search.ts
│   ├── use-research.ts
│   ├── use-inference-mode.ts             # Cloud/Edge mode management
│   ├── use-model-download.ts             # Model download state
│   ├── use-agentic-workflow.ts           # Multi-agent workflow
│   └── use-webgpu.ts                     # WebGPU detection
├── store/
│   └── app-store.ts                      # Zustand store
├── types/
│   └── index.ts                          # TypeScript types
├── public/
│   ├── sample-xrays/                     # Demo X-ray images
│   │   ├── cavity-1.jpg
│   │   ├── opg-1.jpg
│   │   └── ...
│   ├── icons/
│   ├── images/
│   ├── manifest.json                     # PWA manifest
│   └── sw.js                             # Service worker
├── workers/
│   └── model-worker.ts                   # Web Worker for inference
├── .env.local                            # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---


## 🚀 Modal.com Deployment

### Endpoint 1: VQA Model (X-Ray Analysis)

```python
# modal_vqa_endpoint.py
import modal
from transformers import AutoProcessor, AutoModelForImageTextToText
import torch
from PIL import Image
import io
import base64

app = modal.App("dentalgemma-vqa")

# Create image with dependencies
image = (
    modal.Image.debian_slim()
    .pip_install(
        "transformers>=4.50.0",
        "torch>=2.0.0",
        "pillow>=10.0.0",
        "accelerate>=0.20.0"
    )
)

# Download model at build time
@app.function(
    image=image,
    gpu="A10G",
    secrets=[modal.Secret.from_name("huggingface-secret")],
    timeout=300
)
@modal.web_endpoint(method="POST")
def analyze_xray(data: dict):
    """
    Analyze dental X-ray images using fine-tuned MedGemma VQA model
    
    Input:
    {
        "image": "base64_encoded_image",
        "question": "Analyze this dental X-ray for cavities"
    }
    
    Output:
    {
        "analysis": "This dental X-ray shows...",
        "confidence": 0.95,
        "processing_time": 2.3
    }
    """
    import time
    start_time = time.time()
    
    # Load model (cached after first call)
    model_id = "YOUR_HF_USERNAME/dentalgemma-vqa-finetuned"
    processor = AutoProcessor.from_pretrained(model_id)
    model = AutoModelForImageTextToText.from_pretrained(
        model_id,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    
    # Decode image
    image_data = base64.b64decode(data["image"])
    image = Image.open(io.BytesIO(image_data))
    
    # Prepare input
    question = data.get("question", "Analyze this dental X-ray image.")
    messages = [
        {
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": question}
            ]
        }
    ]
    
    # Process
    inputs = processor.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt"
    ).to(model.device, dtype=torch.bfloat16)
    
    # Generate
    with torch.inference_mode():
        generation = model.generate(**inputs, max_new_tokens=2000, do_sample=False)
        generation = generation[0][inputs["input_ids"].shape[-1]:]
    
    # Decode
    analysis = processor.decode(generation, skip_special_tokens=True)
    
    processing_time = time.time() - start_time
    
    return {
        "success": True,
        "analysis": analysis,
        "processing_time": processing_time
    }
```

### Endpoint 2: Instruct Model (Clinical Assessment)

```python
# modal_instruct_endpoint.py
import modal
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = modal.App("dentalgemma-instruct")

image = (
    modal.Image.debian_slim()
    .pip_install(
        "transformers>=4.50.0",
        "torch>=2.0.0",
        "accelerate>=0.20.0"
    )
)

@app.function(
    image=image,
    gpu="A10G",
    secrets=[modal.Secret.from_name("huggingface-secret")],
    timeout=300
)
@modal.web_endpoint(method="POST")
def assess_case(data: dict):
    """
    Assess clinical dental case using fine-tuned MedGemma Instruct model
    
    Input:
    {
        "patient": {"age": 45, "gender": "Male"},
        "chief_complaint": "Severe pain in upper right molar",
        "clinical_findings": "Deep cavity visible...",
        "radiographic_findings": "Periapical radiolucency...",
        "medical_history": "Type 2 diabetes, controlled"
    }
    
    Output:
    {
        "diagnosis": {...},
        "management_plan": [...],
        "urgency": "urgent",
        ...
    }
    """
    import time
    start_time = time.time()
    
    # Load model
    model_id = "YOUR_HF_USERNAME/dentalgemma-instruct-finetuned"
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    
    # Format case
    case_text = f"""Please evaluate this dental patient:

PATIENT: {data['patient']['age']}yo {data['patient']['gender']}

CHIEF COMPLAINT:
{data['chief_complaint']}

CLINICAL FINDINGS:
{data['clinical_findings']}

RADIOGRAPHIC FINDINGS:
{data['radiographic_findings']}

MEDICAL HISTORY:
{data['medical_history']}"""
    
    messages = [
        {"role": "system", "content": "You are an expert dental clinician..."},
        {"role": "user", "content": case_text}
    ]
    
    # Tokenize
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to(model.device)
    
    # Generate
    with torch.inference_mode():
        outputs = model.generate(
            inputs,
            max_new_tokens=2000,
            do_sample=False,
            temperature=0.7
        )
    
    # Decode
    assessment = tokenizer.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True)
    
    processing_time = time.time() - start_time
    
    return {
        "success": True,
        "assessment": assessment,
        "processing_time": processing_time
    }
```

**Deployment Commands:**
```bash
# Install Modal
pip install modal

# Authenticate
modal token new

# Deploy VQA endpoint
modal deploy modal_vqa_endpoint.py

# Deploy Instruct endpoint
modal deploy modal_instruct_endpoint.py

# Get endpoint URLs
modal app list
```

---


## 🔌 External API Integrations

### 1. Google Gemini Live API

**Setup:**
```bash
# Install SDK
npm install @google/genai

# Environment variable
GOOGLE_AI_API_KEY=your_api_key_here
```

**Usage in Next.js:**
```typescript
// lib/api/gemini-client.ts
import { GoogleGenAI } from '@google/genai';

export class GeminiVoiceClient {
  private ai: GoogleGenAI;
  private session: any;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect() {
    this.session = await this.ai.live.connect({
      model: 'gemini-live-2.5-flash-preview',
      config: {
        responseModalities: ['AUDIO', 'TEXT'],
        systemInstruction: `You are an expert dental AI assistant...`
      }
    });
    return this.session;
  }

  async sendAudio(audioBuffer: ArrayBuffer) {
    await this.session.send({
      realtimeInput: {
        audio: audioBuffer,
        mimeType: 'audio/pcm;rate=16000'
      }
    });
  }

  async *receiveResponses() {
    for await (const response of this.session.receive()) {
      yield response;
    }
  }
}
```

**Pricing:** Pay-as-you-go (check [Google AI pricing](https://ai.google.dev/pricing))

---

### 2. Google Places API

**Setup:**
```bash
# Install SDK
npm install @googlemaps/google-maps-services-js

# Environment variable
GOOGLE_PLACES_API_KEY=your_api_key_here
```

**Usage:**
```typescript
// lib/api/places-client.ts
import { Client } from "@googlemaps/google-maps-services-js";

export async function findNearbyDentists(params: {
  location: { lat: number; lng: number };
  radius: number;
  specialty?: string;
}) {
  const client = new Client({});
  
  const response = await client.placesNearby({
    params: {
      location: params.location,
      radius: params.radius,
      type: "dentist",
      keyword: params.specialty,
      key: process.env.GOOGLE_PLACES_API_KEY!
    }
  });
  
  return response.data.results;
}

export async function getPlaceDetails(placeId: string) {
  const client = new Client({});
  
  const response = await client.placeDetails({
    params: {
      place_id: placeId,
      fields: ["name", "rating", "formatted_phone_number", "website", "opening_hours", "reviews"],
      key: process.env.GOOGLE_PLACES_API_KEY!
    }
  });
  
  return response.data.result;
}
```

**Pricing:** 
- Nearby Search: $32 per 1000 requests
- Place Details: $17 per 1000 requests
- Free tier: $200 credit/month

---

### 3. Exa Search API

**Setup:**
```bash
# Install SDK
npm install exa-js

# Environment variable
EXA_API_KEY=your_api_key_here
```

**Usage:**
```typescript
// lib/api/exa-client.ts
import Exa from "exa-js";

export async function searchDentalResearch(query: string, options?: {
  dateRange?: { start: string; end: string };
  domains?: string[];
  numResults?: number;
}) {
  const exa = new Exa(process.env.EXA_API_KEY!);
  
  const results = await exa.searchAndContents(query, {
    type: "neural",
    useAutoprompt: true,
    numResults: options?.numResults || 10,
    includeDomains: options?.domains || [
      "pubmed.ncbi.nlm.nih.gov",
      ".edu",
      "scholar.google.com"
    ],
    startPublishedDate: options?.dateRange?.start,
    endPublishedDate: options?.dateRange?.end,
    text: {
      maxCharacters: 1000,
      includeHtmlTags: false
    },
    highlights: {
      numSentences: 3,
      highlightsPerUrl: 3
    }
  });
  
  return results;
}

export async function findSimilarPapers(url: string) {
  const exa = new Exa(process.env.EXA_API_KEY!);
  
  const results = await exa.findSimilar(url, {
    numResults: 5,
    includeDomains: ["pubmed.ncbi.nlm.nih.gov", ".edu"]
  });
  
  return results;
}
```

**Pricing:**
- Free tier: 1000 searches/month
- Pro: $20/month for 10,000 searches

---


## 🎨 UI/UX Design Principles

### Design System

**Color Palette:**
```css
/* Primary - Medical Blue */
--primary: 210 100% 50%;        /* #0080FF */
--primary-foreground: 0 0% 100%; /* White */

/* Secondary - Clinical Gray */
--secondary: 210 10% 95%;        /* #F2F4F7 */
--secondary-foreground: 210 10% 20%; /* #2D3748 */

/* Accent - Success Green */
--accent: 142 76% 36%;           /* #16A34A */
--accent-foreground: 0 0% 100%;

/* Destructive - Urgent Red */
--destructive: 0 84% 60%;        /* #EF4444 */
--destructive-foreground: 0 0% 100%;

/* Warning - Moderate Yellow */
--warning: 38 92% 50%;           /* #F59E0B */

/* Background */
--background: 0 0% 100%;         /* White */
--foreground: 210 10% 10%;       /* Near Black */

/* Muted */
--muted: 210 10% 96%;
--muted-foreground: 210 10% 40%;

/* Border */
--border: 210 10% 90%;
--ring: 210 100% 50%;
```

**Typography:**
- Headings: Inter (700, 600)
- Body: Inter (400, 500)
- Monospace: JetBrains Mono (code/data)

**Spacing:**
- Base unit: 4px (0.25rem)
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96

### Accessibility

✅ **WCAG 2.1 AA Compliance:**
- Color contrast ratio ≥ 4.5:1 for text
- Color contrast ratio ≥ 3:1 for UI components
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels for screen readers
- Alt text for all images
- Semantic HTML structure

✅ **Responsive Design:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

✅ **Performance:**
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Image optimization (WebP, lazy loading)

### Component Library

**Using Shadcn UI:**
- Button, Card, Dialog, Form, Input, Select, Tabs
- Toast notifications
- Loading skeletons
- Error boundaries
- Custom components for domain-specific needs

---

## 📄 Key Pages

### 1. Landing Page (`/`)

**Sections:**
- **Hero**
  - Headline: "AI-Powered Dental Diagnostics with Fine-Tuned MedGemma"
  - Subheadline: "Novel task adaptation for dental X-ray analysis and clinical assessment"
  - CTA: "Try Demo" button
  - Demo video embed (3 min)

- **Features Grid**
  - 5 feature cards with icons
  - X-Ray Analysis, Clinical Assessment, Voice Consultation, Dentist Finder, Research

- **How It Works**
  - 3-step process visualization
  - Upload → Analyze → Get Results

- **Model Information**
  - Fine-tuning details
  - Dataset statistics
  - Performance metrics

- **Challenge Context**
  - MedGemma Impact Challenge badge
  - Submission details

- **Footer**
  - Links, disclaimer, contact

---

### 2. Dashboard (`/dashboard`)

**Layout:**
- Sidebar navigation (collapsible on mobile)
- Top bar with user menu and notifications
- Main content area

**Content:**
- Welcome message
- Quick stats cards:
  - Total analyses performed
  - Cases assessed
  - Research papers found
  - Dentists located
- Recent activity timeline
- Quick action buttons (large, prominent)
- Charts:
  - Condition distribution (pie chart)
  - Urgency breakdown (bar chart)
  - Usage over time (line chart)

---

### 3. X-Ray Analysis (`/dashboard/xray-analysis`)

**Layout:**
- Two-column layout (upload left, results right)
- Mobile: stacked vertically

**Upload Section:**
- Drag-and-drop zone
- File browser button
- Sample X-rays gallery (click to analyze)
- Analysis type selector:
  - Cavity Detection
  - OPG Classification
  - Tooth Identification
  - General Assessment

**Results Section:**
- Image viewer with zoom/pan
- Analysis text (formatted)
- Confidence scores with progress bars
- Visual overlays (if applicable)
- Export buttons (PDF, JSON)
- Save to history

---

### 4. Clinical Assessment (`/dashboard/clinical-assessment`)

**Multi-step Form:**
- Progress indicator (5 steps)
- Step 1: Patient Info
- Step 2: Chief Complaint
- Step 3: Clinical Findings
- Step 4: Radiographic Findings
- Step 5: Medical History

**Features:**
- Auto-save indicator
- Field validation with inline errors
- Optional X-ray upload (integrates with VQA)
- Previous/Next navigation
- Submit button on final step

**Results Page:**
- Comprehensive report with sections
- Collapsible sections for better readability
- Print button
- Export as PDF
- Share via email
- Save to history

---

### 5. Voice Consultation (`/dashboard/voice-consultation`)

**Layout:**
- Centered interface
- Large microphone button
- Audio waveform visualization
- Transcript panel (scrollable)

**Features:**
- Microphone permission request
- Push-to-talk or continuous mode toggle
- Real-time transcription (user + AI)
- Conversation history
- Export transcript
- Clear conversation
- Voice settings (speed, language)

---

### 6. Find Dentists (`/dashboard/find-dentists`)

**Layout:**
- Split view: Map (60%) + List (40%)
- Mobile: Map on top, list below

**Search Panel:**
- Location input (autocomplete)
- Radius slider (1-25 miles)
- Specialty dropdown
- Rating filter
- Price level filter
- Open now checkbox
- Search button

**Map:**
- Interactive Leaflet map
- Dentist markers (clustered)
- Click marker to highlight in list
- Zoom controls

**List:**
- Dentist cards with:
  - Name, specialty
  - Rating, review count
  - Distance
  - Phone, website
  - Hours
  - "Get Directions" button
- Pagination or infinite scroll

---

### 7. Research Dashboard (`/dashboard/research`)

**Layout:**
- Search bar at top
- Filter panel (left sidebar, collapsible)
- Results grid (main area)

**Search Bar:**
- Large input field
- Autocomplete suggestions
- Advanced options toggle

**Filter Panel:**
- Date range picker
- Domain checkboxes (PubMed, .edu, etc.)
- Content type radio buttons
- Number of results slider

**Results Grid:**
- Paper cards with:
  - Title (clickable)
  - Authors, date
  - Relevance score
  - Abstract preview
  - Save button
  - Export citation button
- Load more button

**Saved Papers:**
- Sidebar or separate tab
- Export all citations

---


## 🔒 Security & Compliance

### Data Privacy

**No Patient Data Storage (Demo Mode):**
- All analyses are ephemeral
- No server-side data persistence
- Optional localStorage for user convenience (can be cleared)
- No user accounts required

**Data in Transit:**
- HTTPS only (enforced by Vercel)
- API keys stored in environment variables
- No sensitive data in URLs or logs

**HIPAA Considerations:**
- Clear disclaimer: "Not HIPAA compliant, for educational use only"
- Recommend users not upload real patient data
- Use synthetic/demo data for testing

### Disclaimers

**Prominent Display (on every page):**
```
⚠️ IMPORTANT DISCLAIMER
This application is for educational and research purposes only.
It is NOT intended for clinical diagnosis or patient care.
AI-generated assessments must be validated by licensed dental professionals.
Do not upload real patient data.
```

**Additional Disclaimers:**
- Model limitations section
- Data usage policy
- Terms of service
- Privacy policy

### Rate Limiting

**API Protection:**
```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

export async function middleware(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }
  
  return NextResponse.next();
}
```

### Error Handling

**Graceful Degradation:**
- Try-catch blocks for all API calls
- User-friendly error messages
- Fallback UI for failed requests
- Retry mechanisms with exponential backoff

---

## 🏆 Challenge Alignment

### MedGemma Impact Challenge Evaluation Criteria

| Criterion | Weight | How We Address It | Evidence |
|-----------|--------|-------------------|----------|
| **Effective use of HAI-DEF models** | 20% | Fine-tuned MedGemma 1.5 4B IT for novel dental task (not in original training) | • 1,654 VQA samples<br>• 2,494 instruct samples<br>• 98 dental conditions<br>• Multimodal capabilities<br>• Hybrid cloud-edge deployment |
| **Problem domain** | 15% | Clear dental diagnostic workflow improvement with agentic automation | • Reduces diagnostic time from hours to minutes<br>• Automates complex workflows<br>• Improves accuracy with multi-agent validation<br>• Accessible to underserved areas<br>• Educational tool for students |
| **Impact potential** | 15% | Accessible AI for dental professionals globally with privacy-first option | • Web-based PWA (no installation)<br>• Free to use (demo)<br>• Edge AI for privacy compliance<br>• Offline capable<br>• Multiple languages (future)<br>• Scalable architecture |
| **Product feasibility** | 20% | Production-ready app with real deployment and innovative edge AI | • Deployed on Vercel<br>• Modal.com for cloud inference<br>• Transformers.js for edge inference<br>• External APIs integrated<br>• Performance optimized<br>• PWA installable |
| **Execution & communication** | 30% | Professional demo + comprehensive documentation + innovative features | • 3-min demo video (main)<br>• Edge AI demo video<br>• Agentic workflow demo video<br>• Detailed writeup<br>• Clean codebase<br>• User-friendly UI<br>• Technical innovation |

### Prize Eligibility

**🏆 Main Track ($75,000)**
- ✅ Novel task adaptation (dental diagnostics)
- ✅ Production-ready deployment
- ✅ Comprehensive feature set
- ✅ Real-world applicability

**🏆 Edge AI Prize ($5,000)**
- ✅ On-device inference with WebGPU
- ✅ 4-bit quantized ONNX model
- ✅ Offline capability
- ✅ Privacy-first architecture
- ✅ Performance comparison dashboard
- ✅ Progressive Web App

**🏆 Agentic Workflow Prize ($10,000)**
- ✅ Multi-agent orchestration system
- ✅ Tool calling framework
- ✅ Intelligent workflow planning
- ✅ Complex process automation
- ✅ Transparent decision-making
- ✅ Significant workflow overhaul

**🏆 Novel Task Prize ($10,000)**
- ✅ MedGemma not trained on dental data
- ✅ Custom dataset creation (4,148 samples)
- ✅ Domain-specific fine-tuning
- ✅ Novel multimodal capabilities

**Total Prize Potential: $100,000** (4 categories)

### Submission Deliverables

**1. Main Video (3 minutes)**
- Script and storyboard
- Screen recording with voiceover
- Demo of all 7 features (including agentic workflow)
- Hybrid cloud-edge demonstration
- Technical architecture overview
- Impact statement

**2. Edge AI Demo Video (2 minutes)**
- Model download process
- WebGPU inference demonstration
- Performance comparison (cloud vs edge)
- Offline capability showcase
- Privacy benefits explanation

**3. Agentic Workflow Demo Video (2 minutes)**
- Multi-agent system visualization
- Tool calling demonstration
- Workflow orchestration
- Complex case automation
- Transparency and explainability

**4. Writeup (3 pages)**
- Project name and team
- Problem statement
- Solution overview (hybrid + agentic)
- Technical details (edge AI + multi-agent)
- Results and impact
- Novel task adaptation evidence

**5. Code Repository**
- GitHub repo with comprehensive README
- Well-documented code
- Setup instructions
- Deployment guide
- Model conversion scripts
- Agentic system documentation

**6. Live Demo**
- Vercel deployment URL
- Sample data for testing
- User guide
- Edge AI toggle demonstration
- Agentic workflow examples

---

## 📅 Implementation Timeline (Updated for Hybrid + Agentic)

### Week 1: Foundation + Cloud Backend (Days 1-7)

**Day 1-2: Project Setup**
- [ ] Initialize Next.js 14 project with PWA support
- [ ] Install dependencies (Shadcn UI, Tailwind, Transformers.js, etc.)
- [ ] Set up project structure (including edge/ and agentic/ folders)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Git repository
- [ ] Configure PWA manifest and service worker

**Day 3-4: Landing Page & Dashboard**
- [ ] Create landing page with hero section
- [ ] Build feature showcase (7 features)
- [ ] Implement dashboard layout
- [ ] Add sidebar navigation
- [ ] Create stats cards
- [ ] Add inference mode toggle UI

**Day 5-7: X-Ray Analysis (Cloud Mode)**
- [ ] Build upload interface
- [ ] Implement drag-and-drop
- [ ] Add sample X-rays
- [ ] Create results viewer
- [ ] Test with mock data
- [ ] Add performance metrics display

---

### Week 2: Cloud Features + Edge AI Setup (Days 8-14)

**Day 8-9: Modal Deployment**
- [ ] Write Modal VQA endpoint
- [ ] Write Modal Instruct endpoint
- [ ] Deploy to Modal.com
- [ ] Test endpoints
- [ ] Integrate with Next.js API routes
- [ ] Add error handling and retries

**Day 10-11: Clinical Assessment**
- [ ] Build multi-step form
- [ ] Implement validation
- [ ] Add auto-save functionality
- [ ] Create report viewer
- [ ] Add PDF export
- [ ] Connect to Modal Instruct endpoint

**Day 12-14: Edge AI Foundation**
- [ ] Convert VQA model to ONNX (4-bit quantized)
- [ ] Set up Transformers.js integration
- [ ] Implement model download manager
- [ ] Create IndexedDB caching system
- [ ] Build WebGPU detection
- [ ] Test local inference

---

### Week 3: Agentic System + Edge Integration (Days 15-21)

**Day 15-16: Agentic Framework**
- [ ] Design multi-agent architecture
- [ ] Implement tool calling framework
- [ ] Create agent coordinator
- [ ] Build workflow engine
- [ ] Add state management

**Day 17-18: Agent Implementation**
- [ ] Implement X-ray analyzer agent
- [ ] Implement clinical assessor agent
- [ ] Implement research synthesizer agent
- [ ] Implement referral agent
- [ ] Test agent coordination

**Day 19-20: Edge AI Integration**
- [ ] Integrate Transformers.js with X-ray analysis
- [ ] Implement inference mode manager
- [ ] Add cloud/edge toggle
- [ ] Build performance comparison dashboard
- [ ] Test offline capability

**Day 21: Voice + External APIs**
- [ ] Set up Gemini Live API
- [ ] Integrate Google Places API
- [ ] Integrate Exa Search API
- [ ] Test all external integrations

---

### Week 4: Polish, Testing & Deployment (Days 22-28)

**Day 22-23: Feature Completion**
- [ ] Complete agentic workflow UI
- [ ] Add workflow visualization
- [ ] Implement dentist finder
- [ ] Complete research dashboard
- [ ] Add voice consultation

**Day 24: UI/UX Polish**
- [ ] Refine all pages
- [ ] Add loading states
- [ ] Improve error messages
- [ ] Test responsive design
- [ ] Accessibility audit
- [ ] PWA testing (install, offline)

**Day 25: Testing & Optimization**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Edge AI performance testing
- [ ] Agentic workflow testing

**Day 26: Deployment**
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)
- [ ] Test production build
- [ ] Monitor performance
- [ ] Upload ONNX model to CDN

**Day 27: Documentation**
- [ ] Write comprehensive README
- [ ] Create user guide
- [ ] Document API endpoints
- [ ] Write deployment guide
- [ ] Document agentic system
- [ ] Document edge AI setup
- [ ] Prepare challenge writeup

**Day 28: Demo Videos**
- [ ] Write scripts (3 videos)
- [ ] Record main demo (3 min)
- [ ] Record edge AI demo (2 min)
- [ ] Record agentic workflow demo (2 min)
- [ ] Edit videos
- [ ] Upload and submit

---


## 💰 Cost Estimation (Updated for Hybrid)

### Development Phase (4 weeks)

**Free Tier Services:**
- ✅ Vercel (Hobby plan) - $0
- ✅ GitHub (public repo) - $0
- ✅ Next.js, React, Tailwind - $0
- ✅ Transformers.js - $0
- ✅ WebGPU - $0

**Paid Services:**

| Service | Usage | Cost |
|---------|-------|------|
| **Modal.com** | GPU inference (A10G) | ~$0.50/hour |
| | Estimated: 30 hours testing | ~$15 |
| **Google AI Studio** | Gemini Live API | Your existing credits |
| | Estimated: 1000 requests | ~$5-10 |
| **Google Places API** | Nearby Search + Details | Free tier ($200/month) |
| | Estimated: 500 requests | $0 (within free tier) |
| **Exa Search API** | Neural search | Free tier (1000/month) |
| | Estimated: 200 searches | $0 (within free tier) |
| **CDN (optional)** | ONNX model hosting | Free (Vercel/HF) |
| | 2.5 GB model | $0 |
| **Domain (optional)** | Custom domain | ~$12/year |

**Total Development Cost:** ~$20-35

---

### Demo Period (1 month)

**Estimated Usage:**
- 100 X-ray analyses (50 cloud, 50 edge)
- 50 clinical assessments (cloud only)
- 200 voice consultations
- 500 dentist searches
- 300 research queries
- 50 agentic workflows

| Service | Cost |
|---------|------|
| Modal.com | ~$15 (30 hours GPU, reduced due to edge usage) |
| Google AI Studio | ~$20 (covered by your credits) |
| Google Places API | $0 (within free tier) |
| Exa Search API | $0 (within free tier) |
| Vercel | $0 (Hobby plan) |
| CDN | $0 (free tier) |

**Total Demo Period Cost:** ~$15-35

**Cost Savings from Edge AI:** ~40% reduction in Modal.com costs

---

### Production Scale (Optional)

**For 1000 users/month (50% edge, 50% cloud):**
- Modal.com: ~$150-200 (50% reduction)
- Google AI Studio: ~$100-200
- Google Places API: ~$50-100
- Exa Search API: ~$20 (Pro plan)
- Vercel Pro: $20/month
- CDN: $10-20/month

**Total Production Cost:** ~$350-560/month

**Cost Savings from Edge AI:** ~$150-200/month (30-35% reduction)

---

## 📊 Success Metrics

### Technical Metrics

**Performance:**
- ✅ X-ray analysis: < 3 seconds
- ✅ Clinical assessment: < 5 seconds
- ✅ Voice response latency: < 500ms
- ✅ Page load time: < 2 seconds
- ✅ Lighthouse score: > 90

**Reliability:**
- ✅ Uptime: 99.9%
- ✅ Error rate: < 1%
- ✅ API success rate: > 95%

### User Experience Metrics

**Usability:**
- ✅ Intuitive interface (no training required)
- ✅ Clear results presentation
- ✅ Helpful error messages
- ✅ Mobile-friendly

**Accessibility:**
- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader compatible

### Challenge Metrics

**Alignment:**
- ✅ Novel task adaptation demonstrated
- ✅ Real-world applicability shown
- ✅ Production-ready deployment
- ✅ Comprehensive documentation
- ✅ Professional presentation

---

## 🚀 Future Enhancements

### Phase 2 (Post-Challenge)

**1. Advanced Features**
- [ ] Batch X-ray processing
- [ ] Treatment timeline visualization
- [ ] Comparison mode (before/after)
- [ ] 3D tooth visualization
- [ ] Periodontal charting

**2. Collaboration**
- [ ] User accounts
- [ ] Case sharing
- [ ] Team workspaces
- [ ] Comments and annotations

**3. Integration**
- [ ] DICOM support
- [ ] EHR integration (HL7 FHIR)
- [ ] Practice management systems
- [ ] Imaging software plugins

**4. Localization**
- [ ] Multi-language support (Spanish, French, Portuguese)
- [ ] Regional dental terminology
- [ ] Local dentist databases

**5. Mobile App**
- [ ] React Native app
- [ ] Offline mode
- [ ] Camera integration
- [ ] Push notifications

**6. Analytics**
- [ ] Usage dashboard
- [ ] Performance tracking
- [ ] User feedback collection
- [ ] A/B testing

---

## 📚 Documentation Deliverables

### 1. README.md (Main Repository)

**Sections:**
- Project overview
- Features list
- Tech stack
- Quick start guide
- Environment variables
- Deployment instructions
- Contributing guidelines
- License

### 2. ARCHITECTURE.md

**Sections:**
- System architecture diagram
- Component breakdown
- Data flow
- API endpoints
- Database schema (if applicable)
- Security considerations

### 3. API.md

**Sections:**
- Endpoint documentation
- Request/response formats
- Authentication
- Rate limiting
- Error codes
- Example requests

### 4. DATASETS.md

**Sections:**
- Training data overview
- VQA dataset details
- Instruct dataset details
- Data preprocessing
- Licensing information

### 5. DEPLOYMENT.md

**Sections:**
- Prerequisites
- Modal.com setup
- Vercel deployment
- Environment configuration
- Troubleshooting

### 6. USER_GUIDE.md

**Sections:**
- Getting started
- Feature walkthroughs
- Tips and best practices
- FAQ
- Support contact

### 7. SUBMISSION.md (Challenge Writeup)

**Sections:**
- Project name and team
- Problem statement
- Solution overview
- Technical details
- Results and impact
- Future work

---

## 🎬 Demo Video Script (3 minutes)

### 0:00-0:30 - Introduction & Problem Statement

**Visual:** Landing page, dental clinic footage  
**Narration:**
> "Dental diagnostics face significant challenges: time-consuming analysis, limited access to specialists, and the need for evidence-based decision-making. What if AI could assist dentists in providing faster, more accurate diagnoses?"

### 0:30-1:00 - Solution Overview

**Visual:** Architecture diagram, model training visualization  
**Narration:**
> "Introducing DentalGemma - a fine-tuned MedGemma 1.5 4B model specifically adapted for dental diagnostics. We trained it on 1,654 dental X-ray images and 2,494 clinical cases covering 98 dental conditions. This is a novel task adaptation, as MedGemma was not originally trained on dental data."

### 1:00-1:45 - Live Demo

**Visual:** Screen recording of app  
**Narration:**
> "Let me show you how it works. First, X-ray analysis - upload an image and get instant cavity detection, pathology classification, and tooth identification. Next, clinical case assessment - input patient information and receive a comprehensive diagnosis with treatment plan, urgency classification, and evidence-based recommendations. Finally, real-time voice consultation using Google Gemini Live API for hands-free clinical workflow."

### 1:45-2:15 - Additional Features

**Visual:** Dentist finder map, research dashboard  
**Narration:**
> "But that's not all. Find nearby dentists with ratings and reviews using Google Places API. Access evidence-based research with Exa's neural search. All integrated into one seamless platform."

### 2:15-2:45 - Technical Details

**Visual:** Code snippets, deployment diagram  
**Narration:**
> "Built with Next.js 14 and deployed on Vercel, with Modal.com handling GPU inference. The fine-tuned models achieve high accuracy on dental-specific tasks, demonstrating the power of domain adaptation for medical AI."

### 2:45-3:00 - Impact & Conclusion

**Visual:** Impact statistics, call to action  
**Narration:**
> "DentalGemma makes AI-powered dental diagnostics accessible to professionals worldwide. Try it now at [URL]. Together, we're building the future of dental care."

---

## ✅ Pre-Launch Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Code formatted with Prettier
- [ ] No console.log statements in production
- [ ] Environment variables documented

### Testing
- [ ] All features tested manually
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility checked
- [ ] API endpoints tested
- [ ] Error handling verified

### Performance
- [ ] Images optimized (WebP, lazy loading)
- [ ] Bundle size optimized
- [ ] Lighthouse audit passed
- [ ] Loading states implemented
- [ ] Caching configured

### Security
- [ ] API keys in environment variables
- [ ] Rate limiting implemented
- [ ] HTTPS enforced
- [ ] Input validation added
- [ ] XSS protection enabled

### Documentation
- [ ] README.md complete
- [ ] API documentation written
- [ ] User guide created
- [ ] Code comments added
- [ ] Deployment guide ready

### Legal
- [ ] Disclaimers added
- [ ] Privacy policy written
- [ ] Terms of service created
- [ ] License file included
- [ ] Attribution for datasets

### Deployment
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Analytics set up (optional)
- [ ] Error monitoring configured

### Challenge Submission
- [ ] Video recorded and edited
- [ ] Writeup completed (3 pages)
- [ ] Code repository public
- [ ] Live demo URL working
- [ ] All links verified

---

## 📞 Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Modal.com Docs](https://modal.com/docs)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live-guide)
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Exa Search API](https://docs.exa.ai/)

### Community
- [MedGemma Challenge Forum](https://kaggle.com/competitions/med-gemma-impact-challenge/discussion)
- [Modal Discord](https://discord.gg/modal)
- [Next.js Discord](https://discord.gg/nextjs)

### Contact
- GitHub Issues: For bug reports and feature requests
- Email: [your-email@example.com]
- Twitter: [@your-handle]

---

## 🎯 Conclusion

This comprehensive plan outlines a production-ready dental AI diagnostic platform that:

✅ **Demonstrates novel task adaptation** of MedGemma for dental diagnostics  
✅ **Provides real-world utility** with 5 integrated features  
✅ **Uses cutting-edge technology** (Gemini Live, Modal, Exa)  
✅ **Delivers professional UX** with accessibility and performance  
✅ **Aligns perfectly** with MedGemma Impact Challenge criteria

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Week 1 implementation
4. Deploy and submit to challenge

**Estimated Timeline:** 4 weeks  
**Estimated Cost:** $20-45  
**Expected Impact:** High (novel task, production-ready, comprehensive features)

---

*Built for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge) 🏥*

*Bringing dental diagnostics into the age of medical foundation models* 🦷✨
