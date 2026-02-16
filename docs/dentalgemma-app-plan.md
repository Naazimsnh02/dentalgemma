# 🦷 DentalGemma Professional Demo Application — Complete Implementation Plan

**Project:** DentalGemma AI Assistant  
**Challenge:** [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge)  
**Model:** Fine-tuned MedGemma 1.5 4B IT for Dental Diagnostics  
**Deployment:** Vercel (Frontend PWA) + Modal.com (ML Backend)  
**Last Updated:** February 15, 2026

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Overview](#application-overview)
3. [Technical Architecture](#technical-architecture)
4. [Core Features](#core-features)
5. [PWA & Offline Features](#pwa--offline-features)
6. [Agentic Diagnostic Workflow](#agentic-diagnostic-workflow)
7. [Additional Features](#additional-features)
8. [Technology Stack](#technology-stack)
9. [Project Structure](#project-structure)
10. [Modal.com Deployment](#modalcom-deployment)
11. [External API Integrations](#external-api-integrations)
12. [UI/UX Design System](#uiux-design-system)
13. [Key Pages](#key-pages)
14. [Security & Compliance](#security--compliance)
15. [Challenge Alignment](#challenge-alignment)
16. [Implementation Timeline](#implementation-timeline)
17. [Cost Estimation](#cost-estimation)
18. [Risk Mitigation](#risk-mitigation)
19. [Submission Deliverables](#submission-deliverables)
20. [Future Enhancements](#future-enhancements)

---

## 🎯 Executive Summary

DentalGemma is a **production-ready dental AI diagnostic platform** with **cloud-first architecture** and **agentic workflow capabilities**, purpose-built for the MedGemma Impact Challenge. The platform integrates:

- **Fine-tuned MedGemma Multimodal Model** (VQA + Instruct) for dental diagnostics across 98 clinical conditions
- **Cloud-First Architecture** — Fast and reliable inference via Modal.com GPU
- **Multi-Agent Diagnostic System** — Intelligent workflow orchestration via Vercel AI SDK 6
- **Hybrid Voice Consultation** — Web Speech API + DentalGemma (default) | Gemini 2.5 Flash Native Audio (enhanced)
- **Google Places API** for dentist location services
- **PubMed E-Utils API** for evidence-based research

**Deployment:** Vercel (Frontend PWA) + Modal.com (Cloud GPU Backend)  
**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Vercel AI SDK 6  
**Prize Targets:** Main Track ($75K) + Agentic Workflow ($10K) + Novel Task ($10K)

---

## 🚀 Application Overview

**Name:** DentalGemma AI Assistant  
**Tagline:** *"AI-Powered Dental Diagnostics with Intelligent Agentic Workflows"*  
**Target Users:** Dental professionals, students, researchers, patients (educational)  
**URL:** `dentalgemma.vercel.app`

### Key Capabilities

✅ **Novel Task Adaptation** — MedGemma fine-tuned for dental domain (not in original training data)  
✅ **Cloud-First Architecture** — Specialized GPU inference for high accuracy and speed
✅ **Agentic Workflow System** — Autonomous multi-step diagnostic orchestration  
✅ **Multimodal** — Text + Image analysis with fine-tuned VQA model  
✅ **Real-time Voice** — Hands-free clinical workflow with hybrid voice architecture  
✅ **Evidence-based** — PubMed-integrated research dashboard  
✅ **Practical Utility** — Dentist finder, treatment tracking, patient education

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16 PWA)                        │
│              Deployed on Vercel · Tailwind v4 · shadcn/ui           │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ X-Ray    │ │ Clinical │ │ Voice    │ │ Agentic  │              │
│  │ Analyzer │ │ Case     │ │ Consult  │ │ Workflow │              │
│  │  (VQA)   │ │ Assess.  │ │ (Hybrid) │ │ Engine   │              │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘              │
│       │             │            │             │                    │
│  ┌────┴─────────────┴────────────┴─────────────┴────────────┐      │
│  │                 AI ENGINE LAYER                          │      │
│  │    ┌──────────────────────────┐                          │      │
│  │    │   Cloud API (Modal)      │                          │      │
│  │    │   DentalGemma Full Model │                          │      │
│  │    │   (GPU Inference)        │                          │      │
│  │    └──────────────────────────┘                          │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │ Dentist  │ │ Progress │ │ Research │ │ Patient  │ │Symptom │  │
│  │ Finder   │ │ Tracker  │ │ Dashboard│ │ Educatn  │ │Checker │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICES                                │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │  Modal.com        │  │  Google Cloud     │                        │
│  │  · DentalGemma    │  │  · Gemini 2.5     │                        │
│  │    1.5 4B IT      │  │    Flash Native   │                        │
│  │    (Multimodal)   │  │    Audio GA       │                        │
│  │  · GPU: H100/A10G │  │    (enhanced      │                        │
│  │                   │  │     voice mode)   │                        │
│  └──────────────────┘  └──────────────────┘                        │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐                        │
│  │  Google Places    │  │  PubMed E-Utils  │                        │
│  │  API (dentist     │  │  (free research  │                        │
│  │   finder)         │  │   search)        │                        │
│  └──────────────────┘  └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              AGENTIC WORKFLOW LAYER                                  │
│              Vercel AI SDK 6 Agent Abstractions                     │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────────┐│
│  │ Coordinator│→│ X-Ray      │→│ Research   │→│ Referral Agent   ││
│  │ Agent      │ │ Analyzer   │ │ Synthesizer│ │ + Report Gen     ││
│  └────────────┘ └────────────┘ └────────────┘ └──────────────────┘│
│                                                                     │
│  Tools: analyzeXray · assessCase · searchResearch · findSpecialist  │
│         generateReport · checkGuidelines                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Features

### 1. 🔍 X-Ray Analysis Suite

**Model:** DentalGemma 1.5 4B IT (Multimodal) — Same model for both vision and text tasks

#### Capabilities

| Analysis Type | Training Samples | Output |
|:-------------|:----------------|:-------|
| **Cavity Detection** | ~418 | Cavity count (0–3+), normal/cavity classification, confidence scores |
| **Panoramic OPG Classification** | ~517 | 6-class pathology: Healthy, Caries, Impacted, BDC-BDR, Infection, Fractured |
| **Tooth Identification** | ~64 | Total count, 8-class type classification, per-tooth identification |
| **General Radiographic Assessment** | ~655 | Systematic evaluation report, clinical findings, quality assessment |

#### User Interface
- Drag-and-drop image upload with file browser fallback
- Sample X-rays gallery for demo/testing
- Real-time analysis with progress indicator
- Split-view: Original image alongside annotated results
- Confidence scores with color-coded indicators
- Image comparison slider (before/after overlay)
- Downloadable PDF report with professional formatting
- Export raw analysis as JSON

#### API Design
```typescript
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

**Model:** DentalGemma 1.5 4B IT (Multimodal) — Same model used for X-ray analysis

#### Input Form (Multi-step with Progress Bar)

**Step 1: Patient Information**
- Age, gender, patient ID (optional)

**Step 2: Chief Complaint**
- Primary complaint (textarea), duration, pain level (1-10 scale), symptom triggers (checkboxes)

**Step 3: Clinical Examination**
- Intraoral findings, extraoral findings, soft tissue examination, periodontal status

**Step 4: Radiographic Findings**
- X-ray description (textarea), optional X-ray upload (integrates with Multimodal model), bone loss assessment, periapical status

**Step 5: Medical History**
- Current medications, allergies, systemic conditions (Diabetes, Hypertension, etc.), previous dental treatments

#### Structured Output Report

1. 🎯 **Primary Diagnosis** — Condition name, ICD-10 code, confidence level, differential diagnoses (top 3)
2. 🔬 **Etiology Analysis** — Root cause, contributing factors, risk factors
3. ⚠️ **Urgency Classification**
   - 🔴 **Urgent** — Immediate attention required (within 24 hours)
   - 🟡 **Moderate** — Schedule within 1 week
   - 🟢 **Elective** — Routine scheduling acceptable
4. 📝 **Management Plan** — Immediate interventions, step-by-step protocol, alternatives, expected outcomes, duration estimate
5. 💊 **Antibiotic Recommendations** — Indication (with reasoning), drug/dosage/duration, alternatives for allergies, evidence-based rationale
6. 📅 **Follow-up Schedule** — Initial timing, monitoring parameters, long-term plan, red flags
7. 👥 **Patient Counseling** — Simple-language explanation, home care, dietary recommendations, pain management, emergency triggers
8. 📚 **Clinical Guidelines** — Relevant guidelines, scientific references, evidence level (A/B/C)

#### User Interface Features
- Multi-step form with animated progress bar
- Auto-save to localStorage (every 30 seconds)
- Field validation with helpful error messages
- Collapsible sections in report for better readability
- Print-friendly report layout
- Export as PDF with professional formatting
- Save to history for future reference

---

### 3. 🎤 Real-Time Voice Consultation (Hybrid Architecture)

The voice consultation feature uses a **hybrid approach** to combine the strength of our fine-tuned model with the naturalness of Google's Gemini voice system.

#### Default Mode: Web Speech API + DentalGemma

- **Speech Recognition:** Browser-native `SpeechRecognition` API (free, no API key, offline-capable)
- **AI Response:** Transcribed text → DentalGemma on Modal → dental-specific clinical response
- **Text-to-Speech:** Browser-native `SpeechSynthesis` API (free, works offline)
- **Advantages:** Uses our fine-tuned model for all dental responses; zero third-party voice costs; offline TTS support

#### Enhanced Mode (User Toggle): Gemini 2.5 Flash Native Audio

- **Model:** `gemini-live-2.5-flash-native-audio` (GA since December 2025)
- **SDK:** `@google/genai` v1.41+ (official GA SDK)
- **Capabilities:** Native audio processing (no separate TTS step), 30 HD voices, 24+ languages, VAD (automatic turn-taking), barge-in support, affective dialog (emotion-aware), function calling mid-utterance, proactive audio
- **System prompt** injects DentalGemma's dental expertise and clinical knowledge
- **Advantages:** Most natural conversational experience; sub-500ms latency; emotional awareness

#### Clinical Use Cases
1. **Quick Symptom Assessment** — AI asks targeted follow-up questions to narrow diagnosis
2. **Treatment Explanation** — Patient-friendly procedural explanations
3. **Chairside Consultation** — Hands-free clinical queries during procedures
4. **Educational Q&A** — Dental student learning support

#### User Interface
- Large microphone button (push-to-talk or continuous mode)
- Real-time audio waveform visualization (Web Audio API + Canvas)
- Live transcription display (scrolling, both user and AI)
- Mode toggle: "Standard" ↔ "Enhanced Voice"
- Conversation history panel
- Export transcript as text/PDF
- Voice settings (speed, language)
- Connection status and background noise indicators

#### Technical Implementation
```typescript
// Default Mode: Web Speech API + DentalGemma
const recognition = new SpeechRecognition();
recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: transcript })
  });
  const data = await response.json();
  const utterance = new SpeechSynthesisUtterance(data.response);
  speechSynthesis.speak(utterance);
};

// Enhanced Mode: Gemini 2.5 Flash Native Audio GA
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
const session = await ai.live.connect({
  model: 'gemini-live-2.5-flash-native-audio',
  config: {
    responseModalities: ['AUDIO', 'TEXT'],
    systemInstruction: `You are DentalGemma, an expert dental AI assistant
      trained on 98 dental conditions. Provide accurate, evidence-based
      dental information. Always recommend consulting a licensed dentist
      for clinical diagnosis.`
  }
});

await session.send({
  realtimeInput: { audio: audioBuffer, mimeType: 'audio/pcm;rate=16000' }
});

for await (const response of session.receive()) {
  if (response.text) { /* Display transcription */ }
  if (response.audio) { /* Play audio response */ }
}
```

---

## 📱 PWA & Offline Features

While the core AI model runs in the cloud for maximum performance, the application is built as a Progressive Web App (PWA) with significant offline utility.

### Offline Capabilities
- 💾 Cached clinical guidelines and dental knowledge base (pre-embedded JSON, 98 conditions)
- 🔍 Offline search through dental conditions database
- 📊 Treatment progress tracking (localStorage)
- 📋 Dental symptom checker (rule-based + cached model responses)
- 🦷 Interactive dental anatomy explorer (SVG/Canvas)
- 🗣️ Voice TTS (Web Speech API works offline)

### PWA Features
- Installable on Mobile and Desktop
- Service Worker for asset caching
- Graceful degradation when offline (AI features disabled, static features available)

---

## 🤖 Agentic Diagnostic Workflow

### Multi-Agent System Overview

The agentic diagnostic workflow deploys multiple AI agents that work together to provide comprehensive dental analysis. This system reimagines the dental diagnostic workflow through intelligent orchestration.

**Framework:** Vercel AI SDK 6 (released December 2025) — native Agent abstractions, streaming-first architecture, type-safe structured outputs, human-in-the-loop tool execution.

### Workflow Execution

```
Patient Input: "45M with severe pain in tooth #14, X-ray attached"

Agent Workflow:
┌─────────────────────────────────────────────────────────┐
│ 1. Coordinator Agent                                     │
│    ✓ Detected: X-ray image present + symptom description │
│    ✓ Plan: Analyze X-ray → Assess → Research → Refer    │
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
│ 3. Clinical Assessor Agent                               │
│    ✓ Tool: assessCase(combined_data)                    │
│    ✓ Diagnosis: Acute periapical abscess                │
│    ✓ Urgency: URGENT (within 24 hours)                  │
│    ✓ Treatment: Root canal + Amoxicillin 500mg TID      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Research Synthesizer Agent                            │
│    ✓ Tool: searchResearch("periapical abscess")         │
│    ✓ Found: 5 relevant clinical guidelines              │
│    ✓ Synthesized: Evidence-based treatment protocols    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Referral Agent                                        │
│    ✓ Tool: findSpecialist("endodontist", user_location) │
│    ✓ Found: 3 nearby endodontists, sorted by rating     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Report Synthesis Agent                                │
│    ✓ Combined all findings into comprehensive report    │
│    ✓ Generated downloadable PDF                         │
│    ✓ Included: Diagnosis, treatment, research, referrals│
└─────────────────────────────────────────────────────────┘
```

### Agent Tools

| Tool | Function | Source |
|:-----|:---------|:-------|
| `analyzeXray` | X-ray image analysis | DentalGemma Multimodal (Modal) |
| `assessCase` | Clinical case assessment | DentalGemma Multimodal (Modal) |
| `searchResearch` | Evidence-based literature search | PubMed E-Utils API |
| `findSpecialist` | Locate nearby dental specialists | Google Places API |
| `generateReport` | Comprehensive PDF report generation | Client-side (jsPDF) |
| `checkGuidelines` | Clinical guideline lookup | Cached knowledge base |

### User Interface
- Workflow visualization with animated step-by-step progress
- Agent activity log with full transparency (user sees each decision)
- Tool call history with inputs and outputs
- Confidence scores per agent step
- Override options (user can guide the workflow)
- Export complete workflow trace as PDF
- Streaming display (real-time as each step completes)

---

## 🔵 Additional Features

### 4. 🗺️ Find Nearby Dentists

**Google Places API integration with interactive mapping.**

**Search Capabilities:**
- 📍 Location-based search (address, city, or GPS coordinates)
- 🔍 Radius filter (1, 5, 10, 25 miles)
- 🏥 Specialty filter: General, Orthodontics, Endodontics, Periodontics, Oral Surgery, Pediatric, Prosthodontics, Cosmetic
- ⭐ Rating filter (4+, 4.5+ stars)
- 💰 Price level filter
- 🕐 Open now filter

**Display:** Interactive Leaflet.js map with clustered markers, split-view (map 60% + list 40%), contact info, hours, reviews, ratings, directions link. Save favorites to localStorage.

---

### 5. 📊 Treatment Progress Tracker

**Visual dashboard for tracking dental treatment journeys.**

- Interactive charts (Recharts) — treatment timeline, progress bars, cost tracking
- Treatment milestones with completion status
- Color-coded progress indicators
- Data persisted in localStorage (works offline)
- Export/share capability

---

### 6. 🔬 Dental Research Dashboard

**Evidence-based research powered by PubMed E-Utils API (free, no API key required).**

**Search Capabilities:**
- 🧠 Semantic search through dental and medical literature
- 📚 Source filtering:
  - PubMed / MEDLINE
  - Dental journals
  - Clinical guidelines
  - University research (.edu domains)
- 📅 Date range filter (last 6 months, 1 year, 5 years, all time)
- 🏷️ Content type filter:
  - Research papers
  - Clinical trials
  - Systematic reviews
  - Case reports
  - Guidelines

**Display Information:**
- 📄 Article title (clickable to PubMed)
- ✍️ Authors and affiliations
- 📅 Publication date
- 📰 Journal/source name
- 📝 Abstract/summary
- 🔗 Full-text link (if available)
- 📚 Citation count (if available via PubMed)
- 🏷️ Keywords/MeSH terms
- 💾 Save to reading list (localStorage)
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

---

### 7. 📚 Patient Education Portal

**AI-generated patient education materials powered by DentalGemma.**

- Condition-specific education pages (98 conditions from training data)
- Interactive dental anatomy explorer (SVG/Canvas)
- Pre/post-procedure guidance with visual aids
- Simplified explanations from clinical terminology
- Sharable education cards
- Multi-language support via browser translation API

---

### 8. 📋 Dental Symptom Checker

**Interactive guided assessment for patients.**

- Step-by-step questionnaire (decision tree)
- AI-powered differential diagnosis (DentalGemma for complex cases, rule-based for offline)
- Urgency assessment with color-coded recommendations
- Action guidance: see dentist ASAP vs. home care vs. monitor
- Works fully offline (cached decision trees + rules engine)

---

### 9. ℹ️ About DentalGemma Model

- Model architecture: MedGemma 1.5 4B IT + SigLIP vision encoder + LoRA fine-tuning
- Training data: 6 datasets, 4,148 samples (1,654 VQA + 2,494 instruct)
- 98 dental conditions covered
- Capabilities showcase with example inputs/outputs
- Links to HuggingFace model and datasets
- Performance metrics and benchmarks

---

### 10. 📈 Interactive Dashboard

**Central hub for all platform activity.**

- Quick stats cards: analyses performed, cases assessed, research papers found, dentists located
- Recent activity timeline
- Condition distribution chart (pie chart)
- Urgency breakdown (bar chart)
- Usage over time (line chart)
- Quick action cards for all features
- Quick action cards for all features

---

## ⚙️ Technology Stack

### Frontend

| Component | Technology | Details |
|:----------|:-----------|:--------|
| Framework | **Next.js 16** (App Router) | Latest stable (Oct 2025). Turbopack default bundler, React 19.2, View Transitions, Cache Components |
| Language | **TypeScript** | Type safety throughout |
| Styling | **Tailwind CSS v4** | Oxide engine (Rust), CSS-first config with `@theme` directive, P3 color palette, container queries, `@starting-style` transitions |
| UI Components | **shadcn/ui** (latest) | Visual project builder, Radix + Base UI support, RTL, accessible |
| Charts | **Recharts** | React-native, lightweight |
| Maps | **Leaflet.js + react-leaflet** | Free tiles (OpenStreetMap), no API key for rendering |
| Icons | **Lucide React** | Consistent, tree-shakeable |
| Animations | **Framer Motion** | Smooth micro-animations, View Transitions |
| Forms | **React Hook Form + Zod** | Validation, performance |
| State | **Zustand** | Minimal boilerplate |
| Markdown | **react-markdown** | Render AI responses |
| PDF | **jsPDF + html2canvas** | Report generation |

### Backend / APIs

| Component | Technology | Details |
|:----------|:-----------|:--------|
| Model Serving | **Modal.com** | GPU inference (H100/A10G), serverless, GPU snapshotting for 10x faster cold starts |
| AI/Agent Framework | **Vercel AI SDK 6** | Agent abstractions, streaming-first, MCP support, type-safe (Dec 2025) |
| Gemini SDK | **@google/genai v1.41+** | Official GA SDK (replaces deprecated `@google/generative-ai`) |
| Voice (default) | **Web Speech API** | Browser-native, free, offline TTS |
| Voice (enhanced) | **Gemini 2.5 Flash Native Audio GA** | 30 HD voices, affective dialog, native audio processing (GA Dec 2025) |
| Location | **Google Places API** | Dentist finder |
| Research | **PubMed E-Utils API** | Free, no API key required |
| API Routes | **Next.js API Routes** | Serverless on Vercel |

### Edge / Offline
| Component | Technology | Details |
|:----------|:-----------|:--------|
| Offline Support | **Service Worker + Cache API** | PWA offline capability |
| Local Data | **localStorage** | Preferences, treatment tracking |

### DevOps

| Component | Technology | Details |
|:----------|:-----------|:--------|
| Hosting | **Vercel** (Free tier) | Auto-deploy, global edge CDN |
| CI/CD | **Vercel Git Integration** | Auto-deploy on push |
| Version Control | **GitHub** | Public repository |

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
│   │   ├── xray-analysis/page.tsx
│   │   ├── clinical-assessment/page.tsx
│   │   ├── voice-consultation/page.tsx
│   │   ├── find-dentists/page.tsx
│   │   ├── research/page.tsx
│   │   ├── agentic-workflow/page.tsx
│   │   ├── symptom-checker/page.tsx
│   │   ├── education/page.tsx
│   │   ├── progress-tracker/page.tsx
│   │   ├── model-info/page.tsx
│   │   ├── settings/page.tsx
│   │   └── history/page.tsx
│   ├── api/
│   │   ├── analyze-xray/route.ts
│   │   ├── assess-case/route.ts
│   │   ├── chat/route.ts
│   │   ├── agent/diagnose/route.ts
│   │   ├── research/search/route.ts
│   │   ├── dentists/nearby/route.ts
│   │   └── health/route.ts
│   ├── manifest.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                               # shadcn/ui
│   ├── xray/
│   │   ├── xray-uploader.tsx
│   │   ├── xray-viewer.tsx
│   │   ├── analysis-results.tsx
│   │   └── sample-xrays.tsx
│   ├── case/
│   │   ├── case-form.tsx
│   │   ├── assessment-report.tsx
│   │   └── pdf-export.tsx
│   ├── voice/
│   │   ├── voice-interface.tsx
│   │   ├── audio-visualizer.tsx
│   │   └── transcript-viewer.tsx
│   ├── dentist/
│   │   ├── dentist-map.tsx
│   │   ├── dentist-list.tsx
│   │   ├── dentist-card.tsx
│   │   └── filter-panel.tsx
│   ├── research/
│   │   ├── search-bar.tsx
│   │   ├── research-results.tsx
│   │   ├── paper-card.tsx
│   │   └── citation-export.tsx
│   ├── agentic/
│   │   ├── workflow-visualizer.tsx
│   │   ├── agent-card.tsx
│   │   ├── tool-call-log.tsx
│   │   └── workflow-controls.tsx
│   ├── education/
│   │   ├── condition-page.tsx
│   │   └── anatomy-explorer.tsx
│   ├── symptom-checker/
│   │   ├── questionnaire.tsx
│   │   └── results-display.tsx
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   ├── activity-timeline.tsx
│   │   └── charts.tsx
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── shared/
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       └── disclaimer.tsx
├── lib/
│   ├── api/
│   │   ├── modal-client.ts
│   │   ├── gemini-client.ts
│   │   ├── places-client.ts
│   │   └── pubmed-client.ts
│   ├── agentic/
│   │   ├── agent-coordinator.ts
│   │   ├── tools.ts
│   │   └── workflow-engine.ts
│   ├── voice/
│   │   ├── web-speech.ts
│   │   └── gemini-live.ts
│   ├── utils.ts
│   ├── constants.ts
│   └── validations.ts
├── hooks/
│   ├── use-xray-analysis.ts
│   ├── use-case-assessment.ts
│   ├── use-voice-session.ts
│   ├── use-dentist-search.ts
│   ├── use-research.ts
│   └── use-agentic-workflow.ts
├── store/
│   └── app-store.ts
├── types/
│   └── index.ts
├── public/
│   ├── sample-xrays/
│   ├── icons/
│   └── sw.js
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Modal.com Deployment

### Unified DentalGemma Endpoint

```python
# modal_dentalgemma.py
import modal

app = modal.App("dentalgemma")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "transformers>=4.50.0",
        "torch>=2.5.0",
        "pillow>=10.0.0",
        "accelerate>=1.0.0",
        "bitsandbytes>=0.41.0",
    )
)

@app.cls(
    image=image,
    gpu="A10G",
    secrets=[modal.Secret.from_name("huggingface-secret")],
    timeout=300,
    container_idle_timeout=300,
    enable_memory_snapshot=True,
)
class DentalGemmaModel:
    @modal.enter()
    def load_models(self):
        """Load models at container startup (cached via GPU snapshot)."""
        from transformers import AutoProcessor, AutoModelForImageTextToText
        import torch

        model_id = "naazimsnh02/dentalgemma-1.5-4b-it"
        self.processor = AutoProcessor.from_pretrained(model_id)
        self.model = AutoModelForImageTextToText.from_pretrained(
            model_id, torch_dtype=torch.bfloat16, device_map="auto"
        )

    @modal.web_endpoint(method="POST")
    def analyze_xray(self, data: dict):
        """VQA inference for dental X-ray analysis."""
        import time, base64, io, torch
        from PIL import Image

        start_time = time.time()
        image_data = base64.b64decode(data["image"])
        image = Image.open(io.BytesIO(image_data))

        question = data.get("question", "Analyze this dental X-ray image.")
        messages = [{"role": "user", "content": [
            {"type": "image", "image": image},
            {"type": "text", "text": question}
        ]}]

        inputs = self.processor.apply_chat_template(
            messages, add_generation_prompt=True,
            tokenize=True, return_dict=True, return_tensors="pt"
        ).to(self.model.device, dtype=torch.bfloat16)

        with torch.inference_mode():
            generation = self.model.generate(**inputs, max_new_tokens=2000, do_sample=False)
            generation = generation[0][inputs["input_ids"].shape[-1]:]

        return {
            "success": True,
            "analysis": self.processor.decode(generation, skip_special_tokens=True),
            "processing_time": time.time() - start_time
        }

    @modal.web_endpoint(method="POST")
    def assess_case(self, data: dict):
        """Clinical case assessment using instruct model."""
        import time, torch

        start_time = time.time()
        case_text = f"""Please evaluate this dental patient:
PATIENT: {data['patient']['age']}yo {data['patient']['gender']}
CHIEF COMPLAINT: {data['chief_complaint']}
CLINICAL FINDINGS: {data['clinical_findings']}
RADIOGRAPHIC FINDINGS: {data['radiographic_findings']}
MEDICAL HISTORY: {data['medical_history']}"""

        messages = [
            {"role": "system", "content": "You are an expert dental clinician. Provide comprehensive clinical assessments with diagnosis, management plan, and evidence-based recommendations."},
            {"role": "user", "content": case_text}
        ]

        inputs = self.processor.apply_chat_template(
            messages, add_generation_prompt=True,
            tokenize=True, return_tensors="pt"
        ).to(self.model.device)

        with torch.inference_mode():
            outputs = self.model.generate(inputs, max_new_tokens=2000, do_sample=False)

        return {
            "success": True,
            "assessment": self.processor.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True),
            "processing_time": time.time() - start_time
        }
```

**Deployment Commands:**
```bash
pip install modal
modal token new
modal deploy modal_dentalgemma.py
modal app list  # Get endpoint URLs
```

---

## 🔌 External API Integrations

### 1. Gemini Live API (Enhanced Voice Mode)

```bash
npm install @google/genai    # v1.41+ — official GA SDK
```

```typescript
// lib/voice/gemini-live.ts
import { GoogleGenAI } from '@google/genai';

export class GeminiVoiceClient {
  private ai: GoogleGenAI;
  private session: any;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect() {
    this.session = await this.ai.live.connect({
      model: 'gemini-live-2.5-flash-native-audio',
      config: {
        responseModalities: ['AUDIO', 'TEXT'],
        systemInstruction: `You are DentalGemma, an expert dental AI assistant...`
      }
    });
    return this.session;
  }

  async sendAudio(audioBuffer: ArrayBuffer) {
    await this.session.send({
      realtimeInput: { audio: audioBuffer, mimeType: 'audio/pcm;rate=16000' }
    });
  }

  async *receiveResponses() {
    for await (const response of this.session.receive()) {
      yield response;
    }
  }
}
```

### 2. Google Places API

```bash
npm install @googlemaps/google-maps-services-js
```

**Pricing:** $200 free credit/month (Nearby Search: $32/1K requests, Place Details: $17/1K).

### 3. PubMed E-Utils API (Free)

```typescript
// lib/api/pubmed-client.ts
export async function searchPubMed(query: string, maxResults = 10) {
  const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  const searchRes = await fetch(
    `${baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`
  );
  const { esearchresult } = await searchRes.json();

  if (!esearchresult.idlist.length) return [];

  const summaryRes = await fetch(
    `${baseUrl}/esummary.fcgi?db=pubmed&id=${esearchresult.idlist.join(',')}&retmode=json`
  );
  const { result } = await summaryRes.json();

  return Object.values(result).filter((r: any) => r.uid);
}

export async function findSimilarPapers(pmid: string) {
  const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  
  const response = await fetch(
    `${baseUrl}/elink.fcgi?dbfrom=pubmed&db=pubmed&id=${pmid}&retmode=json`
  );
  const data = await response.json();
  
  return data.linksets[0]?.linksetdbs || [];
}
```

**No API key required.** Rate limit: 3 requests/second (10/s with optional API key).

---

## 🎨 UI/UX Design System

### Design Principles
- **Medical-grade trust** — Clean, professional, clinical aesthetic
- **Dark mode default** — Easier on eyes during clinical use
- **Glassmorphism accents** — Modern premium feel
- **Micro-animations** — Framer Motion for smooth transitions and View Transitions
- **Color-coded urgency** — Intuitive visual communication across all features

### Color Palette (Tailwind v4 CSS-First Configuration)

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.65 0.15 180);          /* Medical Teal */
  --color-primary-foreground: oklch(0.98 0 0);
  --color-accent: oklch(0.60 0.15 240);            /* Clinical Blue */
  --color-urgent: oklch(0.63 0.25 25);              /* Red */
  --color-moderate: oklch(0.75 0.18 85);            /* Amber */
  --color-elective: oklch(0.70 0.18 155);           /* Green */
  --color-background: oklch(0.15 0.01 260);         /* Dark Background */
  --color-surface: oklch(0.20 0.01 260);
  --color-surface-elevated: oklch(0.25 0.02 260);
}
```

### Typography
- **Headings:** Inter (700, 600) — loaded via `next/font`
- **Body:** Inter (400, 500)
- **Monospace:** JetBrains Mono (code, data displays)

### Accessibility
- ✅ WCAG 2.1 AA compliance (contrast ≥ 4.5:1)
- ✅ Keyboard navigation with focus indicators
- ✅ ARIA labels and screen reader support
- ✅ Semantic HTML structure
- ✅ Responsive: Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- ✅ Lighthouse score target > 90

---

## 📄 Key Pages

### Sitemap

```
/ ............................ Landing page (hero + feature showcase)
/xray ........................ X-Ray Analyzer
/assessment .................. Clinical Case Assessment
/voice ....................... Voice Consultation (Hybrid)
/agent ....................... Agentic Diagnostic Workflow
/dentist-finder .............. Find Nearby Dentists
/progress .................... Treatment Progress Tracker
/research .................... Dental Research Dashboard
/education ................... Patient Education Portal
/symptom-checker ............. Dental Symptom Checker
/model-info .................. About DentalGemma Model
/settings .................... App Settings
/history ..................... Analysis History
```

### Landing Page (`/`)
- **Hero Section:** Animated gradient background, headline "AI-Powered Dental Diagnostics with Fine-Tuned MedGemma", tagline "Novel task adaptation for dental X-ray analysis and clinical assessment", CTA "Try Demo"
- **Features Grid:** 11 feature cards with icons, descriptions, and links
- **How It Works:** 3-step visual: Upload → Analyze → Get Results
- **Model Information:** Fine-tuning details, dataset statistics (4,148 samples, 98 conditions), performance metrics
- **Challenge Context:** MedGemma Impact Challenge badge and track coverage (Main + Novel Task + Agentic)
- **Demo Video:** Embedded 3-minute walkthrough
- **Footer:** Links, disclaimer, contact

### Dashboard Layout
All feature pages share a consistent layout:
- Collapsible sidebar navigation with feature icons
- Top bar with global search
- Main content area with breadcrumbs
- Medical disclaimer footer
- Quick stats overview

### X-Ray Analysis Page (`/xray`)
**Layout:** Two-column (upload left 40%, results right 60%) - stacked on mobile

**Upload Section:**
- Drag-and-drop zone with visual feedback
- File browser button
- Sample X-rays gallery (6-8 demo images, click to analyze)
- Analysis type selector dropdown:
  - Cavity Detection
  - OPG Classification
  - Tooth Identification
  - General Assessment

**Results Section:**
- Image viewer with zoom/pan controls
- Analysis text (formatted with markdown)
- Confidence scores with animated progress bars
- Visual overlays (if bounding boxes available)
- Export buttons (PDF with professional formatting, JSON for developers)
- Save to history button
- Share button (copy link)

### Clinical Assessment Page (`/assessment`)
**Multi-step Form with Progress Bar:**
- Step 1: Patient Info (age, gender, patient ID optional)
- Step 2: Chief Complaint (textarea, duration, pain scale 1-10, triggers)
- Step 3: Clinical Findings (intraoral, extraoral, soft tissue, periodontal)
- Step 4: Radiographic Findings (description, optional X-ray upload with multimodal integration, bone loss, periapical status)
- Step 5: Medical History (medications, allergies, systemic conditions checkboxes, previous treatments)

**Features:**
- Auto-save indicator (saves every 30 seconds to localStorage)
- Field validation with inline error messages
- Optional X-ray upload that integrates with Multimodal model
- Previous/Next navigation buttons
- Submit button on final step with loading state

**Results Page:**
- Comprehensive report with 8 collapsible sections
- Print-friendly layout
- Export as PDF with professional medical formatting
- Share via email (optional)
- Save to history
- Edit/revise option

### Voice Consultation Page (`/voice`)
**Layout:** Centered interface with focus on conversation

**Features:**
- Large microphone button (animated when active)
- Mode toggle: "Standard" (Web Speech + DentalGemma) ↔ "Enhanced" (Gemini Native Audio)
- Push-to-talk or continuous mode selector
- Real-time audio waveform visualization (Web Audio API + Canvas)
- Live transcription display (scrolling, both user and AI with timestamps)
- Conversation history panel (collapsible)
- Export transcript as text/PDF
- Clear conversation button
- Voice settings (speed, language selection)
- Connection status indicator
- Background noise level indicator

### Agentic Workflow Page (`/agent`)
**Layout:** Full-width with workflow visualization

**Features:**
- Workflow visualization with animated step-by-step progress
- Agent activity log with full transparency (user sees each decision)
- Tool call history with inputs and outputs (expandable)
- Confidence scores per agent step
- Override options (user can guide the workflow)
- Export complete workflow trace as PDF
- Streaming display (real-time as each step completes)
- Pause/resume workflow controls

### Find Dentists Page (`/dentist-finder`)
**Layout:** Split view - Map (60% left) + List (40% right) - stacked on mobile

**Search Panel:**
- Location input with autocomplete (Google Places Autocomplete)
- Radius slider (1-25 miles)
- Specialty dropdown (8 specialties)
- Rating filter (4+, 4.5+ stars)
- Price level filter ($-$$$$)
- Open now checkbox
- Search button

**Map:**
- Interactive Leaflet map with OpenStreetMap tiles
- Dentist markers with clustering for dense areas
- Click marker to highlight in list
- Zoom controls
- Current location button

**List:**
- Dentist cards with name, specialty, rating, distance, phone, website, hours
- "Get Directions" button (opens Google Maps)
- Save to favorites (localStorage)
- Pagination or infinite scroll

### Research Dashboard Page (`/research`)
**Layout:** Search bar at top, filter panel (left sidebar, collapsible), results grid (main area)

**Search Bar:**
- Large input field with autocomplete
- Advanced options toggle
- Recent searches dropdown

**Filter Panel:**
- Date range picker (last 6 months, 1 year, 5 years, all time)
- Content type radio buttons (research papers, trials, reviews, case reports, guidelines)
- Number of results slider (10-50)

**Results Grid:**
- Paper cards with title, authors, date, abstract preview, save button, export citation button
- Load more button
- Grid/list view toggle

**Saved Papers:**
- Sidebar or separate tab
- Export all citations (BibTeX, APA, MLA)

---

### Treatment Progress Tracker Page (`/progress`)
**Layout:** Dashboard-style with cards and charts

**Features:**
- Treatment timeline visualization (horizontal timeline with milestones)
- Progress cards for each treatment phase:
  - Status indicator (Not Started, In Progress, Completed)
  - Completion percentage
  - Next appointment date
  - Notes section
- Interactive charts (Recharts):
  - Treatment progress over time (line chart)
  - Cost tracking (bar chart)
  - Milestone completion (progress bars)
- Color-coded progress indicators:
  - 🔴 Overdue
  - 🟡 Upcoming
  - 🟢 Completed
- Add/edit treatment entries
- Upload related documents/images
- Export progress report as PDF
- Data persisted in localStorage (works offline)
- Share progress with dentist (export link)

---

### Patient Education Portal Page (`/education`)
**Layout:** Grid of condition cards with search and filter

**Features:**
- Search bar for conditions (98 dental conditions from training data)
- Category filters:
  - Preventive Care
  - Restorative Procedures
  - Periodontal Conditions
  - Endodontic Issues
  - Oral Surgery
  - Orthodontics
  - Pediatric Dentistry
  - Emergency Care
- Condition cards with:
  - Condition name and icon
  - Brief description
  - "Learn More" button

**Individual Condition Page:**
- Condition overview (AI-generated by DentalGemma)
- Symptoms and signs
- Causes and risk factors
- Treatment options
- Prevention tips
- Interactive dental anatomy explorer (SVG/Canvas with hover tooltips)
- Pre/post-procedure guidance with visual aids
- Simplified explanations (patient-friendly language)
- Related conditions
- Sharable education cards (social media format)
- Multi-language support via browser translation API
- Print-friendly format

---

### Dental Symptom Checker Page (`/symptom-checker`)
**Layout:** Step-by-step questionnaire with progress indicator

**Features:**
- Welcome screen with disclaimer
- Interactive questionnaire (decision tree):
  - Step 1: Location (which tooth/area?)
  - Step 2: Type of pain (sharp, dull, throbbing, constant)
  - Step 3: Duration (hours, days, weeks)
  - Step 4: Triggers (hot, cold, sweet, pressure)
  - Step 5: Associated symptoms (swelling, bleeding, fever)
  - Step 6: Medical history (relevant conditions)
- AI-powered differential diagnosis:
  - Complex cases: DentalGemma analysis
  - Simple cases: Rule-based engine (offline capable)
- Results page:
  - Possible conditions (ranked by likelihood)
  - Urgency assessment with color-coded recommendations:
    - 🔴 **Emergency** - Seek immediate care (ER/urgent care)
    - 🟡 **Urgent** - See dentist within 24-48 hours
    - 🟢 **Routine** - Schedule regular appointment
    - 🔵 **Home Care** - Monitor and self-care
  - Action guidance with specific steps
  - Home care recommendations
  - When to seek emergency care (red flags)
- Works fully offline (cached decision trees + rules engine)
- Save results to history
- Share with dentist (export PDF)

---

### About DentalGemma Model Page (`/model-info`)
**Layout:** Single-page with sections and interactive elements

**Sections:**
1. **Model Overview**
   - Architecture: MedGemma 1.5 4B IT + SigLIP vision encoder
   - Fine-tuning approach: LoRA
   - Training infrastructure: Modal.com GPU (A100)

2. **Training Data**
   - 6 datasets, 4,148 total samples
   - VQA: 1,654 dental X-ray samples
     - Cavity Detection: ~418 samples
     - OPG Classification: ~517 samples
     - Tooth Identification: ~64 samples
     - General Assessment: ~655 samples
   - Instruct: 2,494 clinical cases
     - 98 dental conditions covered
     - Expert-validated responses
   - Data sources and licensing information

3. **Capabilities Showcase**
   - Interactive demo with example inputs/outputs
   - Sample X-ray analysis (before/after)
   - Sample clinical case assessment
   - Confidence scores and accuracy metrics

4. **Performance Metrics**
   - Accuracy benchmarks per task
   - Inference speed metrics
   - Model size and memory requirements
   - Comparison with baseline models

5. **Technical Details**
   - Model card (HuggingFace format)
   - Training hyperparameters
   - Evaluation methodology
   - Limitations and known issues

6. **Links & Resources**
   - HuggingFace model repository
   - Dataset repositories
   - Training code (GitHub)
   - Research paper (if available)
   - API documentation

---

### Settings Page (`/settings`)
**Layout:** Tabbed interface with organized sections

**Tabs:**

1. **Voice Settings**
   - Voice mode: Standard (Web Speech) vs Enhanced (Gemini)
   - Speech recognition language
   - Text-to-speech voice selection
   - Speech rate slider (0.5x - 2x)
   - Pitch adjustment
   - Test voice button

2. **Display Preferences**
   - Theme: Light / Dark / System
   - Font size: Small / Medium / Large
   - Reduce animations toggle
   - High contrast mode
   - Color-blind friendly mode

3. **Privacy & Data**
   - Clear localStorage button
   - Clear analysis history
   - Clear saved items
   - Export all data (JSON)
   - Data retention settings
   - Analytics opt-out

4. **Notifications**
   - Browser notifications toggle
   - Email notifications (if accounts added)
   - Notification preferences per feature

5. **About**
   - App version
   - Last updated date
   - License information
   - Privacy policy link
   - Terms of service link
   - Contact support

---

### Analysis History Page (`/history`)
**Layout:** Timeline view with filters and search

**Features:**
- Timeline of all analyses (reverse chronological)
- Filter by type:
  - X-Ray Analysis
  - Clinical Assessment
  - Voice Consultation
  - Agentic Workflow
  - Symptom Check
- Date range filter
- Search by keywords
- Sort options (date, type, urgency)
- History cards with:
  - Thumbnail/icon
  - Type and date
  - Brief summary
  - Urgency indicator
  - "View Details" button
  - Delete button
- Bulk actions:
  - Select multiple
  - Export selected
  - Delete selected
- Export all history as PDF/JSON
- Clear all history (with confirmation)
- Data stored in localStorage
- Pagination or infinite scroll

---

### Main Dashboard Page (`/dashboard`)
**Layout:** Grid of widgets and quick actions

**Content:**

1. **Welcome Section**
   - Personalized greeting
   - Quick stats summary

2. **Quick Stats Cards** (4 cards in grid)
   - Total analyses performed
   - Cases assessed
   - Research papers found
   - Dentists located
   - Each with icon and trend indicator

3. **Recent Activity Timeline**
   - Last 10 activities
   - Type, date, brief description
   - Click to view details

4. **Quick Action Cards** (Large, prominent buttons)
   - Analyze X-Ray
   - Assess Clinical Case
   - Voice Consultation
   - Find Dentist
   - Search Research
   - Run Agentic Workflow
   - Check Symptoms
   - View Education
   - Track Progress
   - Each with icon and description

5. **Analytics Charts**
   - Condition distribution (pie chart)
     - Top 5 conditions analyzed
     - Percentage breakdown
   - Urgency breakdown (bar chart)
     - Emergency, Urgent, Routine, Home Care
     - Count per category
   - Usage over time (line chart)
     - Last 30 days
     - Analyses per day
     - Trend line

6. **Notifications Panel** (if any)
   - System updates
   - Feature announcements
   - Tips and tricks

---

### Shared Layout Components

**Sidebar Navigation:**
- Logo and app name
- Collapse/expand button
- Navigation items with icons:
  - Dashboard (home icon)
  - X-Ray Analysis (image icon)
  - Clinical Assessment (clipboard icon)
  - Voice Consultation (microphone icon)
  - Agentic Workflow (network icon)
  - Find Dentists (map icon)
  - Progress Tracker (chart icon)
  - Research (book icon)
  - Education (graduation cap icon)
  - Symptom Checker (stethoscope icon)
  - Model Info (info icon)
  - Settings (gear icon)
  - History (clock icon)
- Active state highlighting
- Tooltips on hover (when collapsed)

**Top Bar:**
- Breadcrumbs navigation
- Search bar (global search across features)
- Notifications bell icon
- User menu (if accounts added)
- Help/documentation link

**Medical Disclaimer Footer:**
```
⚠️ IMPORTANT DISCLAIMER
This application is for educational and research purposes only.
It is NOT intended for clinical diagnosis or patient care.
AI-generated assessments must be validated by licensed dental professionals.
Do not upload real patient data. This application is not HIPAA compliant.
```
- Displayed on every page
- Collapsible but always visible
- Links to full disclaimer, privacy policy, terms of service

---

## 🔒 Security & Compliance

### Data Privacy
- **No server-side data storage** — All analyses are ephemeral
- **No user accounts required** — Zero personal data collection
- **Optional localStorage** for convenience (user can clear anytime)
- **HTTPS only** — Enforced by Vercel
- **API keys** stored exclusively in environment variables

### Medical Disclaimer (Displayed on Every Page)
```
⚠️ IMPORTANT DISCLAIMER
This application is for educational and research purposes only.
It is NOT intended for clinical diagnosis or patient care.
AI-generated assessments must be validated by licensed dental professionals.
Do not upload real patient data. This application is not HIPAA compliant.
```

### Rate Limiting
```typescript
// Vercel Edge Middleware — IP-based rate limiting
// 10 requests/minute for AI endpoints
// Generous limits for static content
```

### Error Handling
- Try-catch blocks for all API calls
- User-friendly error messages (no raw stack traces)
- Fallback UI for failed requests
- Retry with exponential backoff
- Graceful degradation (cloud → cached)

---

## 🏆 Challenge Alignment

### Evaluation Criteria Coverage

| Criterion | Weight | How DentalGemma Addresses It |
|-----------|--------|------------------------------|
| **Effective use of HAI-DEF models** | 20% | Fine-tuned MedGemma 1.5 4B IT for novel dental domain (4,148 samples across 98 conditions). Cloud deployment via Modal.com demonstrating effective model serving. |
| **Problem domain** | 15% | Clear dental diagnostic workflow improvement. Reduces diagnostic time from hours to minutes. Automates complex multi-step workflows. Improves accessibility for underserved areas. |
| **Impact potential** | 15% | Free web-based PWA accessible globally. Offline capability for key resources in low-connectivity regions. Educational tool for dental students. |
| **Product feasibility** | 20% | Production deployment on Vercel + Modal.com. 11 integrated features. Real external APIs. Professional UI. Performance optimized. PWA installable. |
| **Execution & communication** | 30% | Professional demo videos (3). Comprehensive documentation. Clean codebase. User-friendly interface. Technical innovation across all four prize tracks. |

### Prize Eligibility

| Prize | Amount | Key Evidence |
|:------|:-------|:-------------|
| **🏆 Main Track** | $75,000 | Full-featured production application, 11 features, professional deployment, comprehensive documentation |
| **🏆 Novel Task** | $10,000 | MedGemma not originally trained on dental data; 6 datasets, 4,148 samples; dual VQA + Instruct fine-tuning; 98 dental conditions |
| **🏆 Agentic Workflow** | $10,000 | Vercel AI SDK 6 agent with 6-step autonomous diagnostic pipeline, transparent reasoning, tool calling |

---

## 📅 Implementation Timeline

### Phase 1: Foundation (Days 1–2)
- [ ] Initialize Next.js 16 project with TypeScript
- [ ] Set up Tailwind CSS v4 (CSS-first) + shadcn/ui
- [ ] Create layout: sidebar + main content + dark mode
- [ ] Design and implement landing page
- [ ] Set up Vercel deployment pipeline
- [ ] Configure project structure (components, hooks, lib, types)
- [ ] Set up PWA manifest and service worker

### Phase 2: Core AI Features (Days 3–5)
- [ ] **X-Ray Analyzer** — Upload UI + Modal API integration + results display
- [ ] **Clinical Assessment** — Multi-step form + validation + Modal API + structured report
- [ ] **Voice Consultation** — Web Speech API + DentalGemma chat + Gemini Live toggle

### Phase 3: Modal Backend (Days 5–6)
- [ ] Write unified Modal endpoint (VQA + Instruct)
- [ ] Deploy with GPU snapshotting for fast cold starts
- [ ] Integrate with Next.js API routes
- [ ] Error handling, retries, keep-alive pings

### Phase 4: Agentic Workflow (Days 6–7)
- [ ] Set up Vercel AI SDK 6 agent with tool definitions
- [ ] Implement 6-step diagnostic workflow
- [ ] Build streaming workflow visualization UI
- [ ] PDF report generation
- [ ] End-to-end testing

### Phase 5: Additional Features (Days 7–8)
- [ ] Dentist Finder (Google Places + Leaflet map)
- [ ] Treatment Progress Tracker (Recharts + localStorage)
- [ ] Research Dashboard (PubMed E-Utils)
- [ ] Patient Education Portal
- [ ] Dental Symptom Checker
- [ ] About DentalGemma Model page
- [ ] Dashboard with statistics

### Phase 6: Polish & Submission (Days 9–10)
- [ ] UI polish, animations (Framer Motion), responsive design
- [ ] Performance optimization (Turbopack, code splitting, image optimization)
- [ ] Cross-browser + mobile testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Record demo videos (main 3 min + Agentic 2 min)
- [ ] Write submission document (3 pages)
- [ ] Final deployment and verification

---

## 💰 Cost Estimation

### Development Phase

| Service | Usage | Cost |
|---------|-------|------|
| Vercel (Hobby plan) | Hosting + CDN | $0 |
| Next.js, React, Tailwind, shadcn/ui | Open source | $0 |
| Transformers.js, WebGPU | Open source | $0 |
| Modal.com | GPU testing (~30 hours A10G) | ~$10–15 |
| Google AI Studio | Gemini Live testing | ~$5–10 |
| Google Places API | Dentist search testing | $0 (within $200/month free credit) |
| PubMed E-Utils | Research search | $0 (free, no key) |
| **Total Development** | | **~$15–25** |

### Demo Period (1 month)

| Service | Estimated Cost |
|---------|---------------|
| Modal.com | ~$15 |
| Google AI Studio | ~$10–20 |
| Google Places API | $0 (free tier) |
| PubMed E-Utils | $0 (free, no key) |
| Vercel | $0 |
| **Total Demo Period** | **~$25–35** |

### Production Scale (1,000 users/month, optional)

| Service | Estimated Cost |
|---------|---------------|
| Modal.com | ~$300–400 |
| Google AI Studio | ~$100–200 |
| Google Places API | ~$50–100 |
| PubMed E-Utils | $0 (free, no key) |
| Vercel Pro | $20/month |
| **Total Production** | **~$320–520/month** |

---

## ⚠️ Risk Mitigation

| Risk | Impact | Mitigation Strategy |
|:-----|:-------|:-------------------|
| Modal cold starts | Slow first request UX | GPU snapshotting (10x faster starts) + keep-alive pings every 5 min + loading skeleton UI |
| Gemini Live API issues | Enhanced voice broken | Web Speech API is primary and always available; Gemini Live is optional toggle |
| Google Places API cost | Budget exceeded | Use free tier ($200/month credit); cache results aggressively |
| Vercel free tier limits | App availability | Static pages for most content; edge functions are generous; monitor usage |
| Model quality edge cases | Poor demo experience | Curate demo inputs that showcase strengths; pre-loaded sample data; demo mode |
| PubMed rate limits | Research feature slow | Respect 3 req/s limit; cache results; optional API key for 10 req/s |

---

## 📝 Submission Deliverables

### Demo Videos

1. **Main Demo** (3 minutes) — Complete feature walkthrough, cloud architecture overview, impact statement
2. **Agentic Workflow Demo** (2 minutes) — Multi-step diagnostic agent, tool calling visualization, transparent reasoning, PDF report

### Demo Video Script (Main - 3 minutes)

**0:00-0:30 - Introduction & Problem Statement**

*Visual:* Landing page, dental clinic footage  
*Narration:*
> "Dental diagnostics face significant challenges: time-consuming analysis, limited access to specialists, and the need for evidence-based decision-making. What if AI could assist dentists in providing faster, more accurate diagnoses?"

**0:30-1:00 - Solution Overview**

*Visual:* Architecture diagram, model training visualization  
*Narration:*
> "Introducing DentalGemma - a fine-tuned MedGemma 1.5 4B model specifically adapted for dental diagnostics. We trained it on 1,654 dental X-ray images and 2,494 clinical cases covering 98 dental conditions. This is a novel task adaptation, as MedGemma was not originally trained on dental data."

**1:00-1:45 - Live Demo**

*Visual:* Screen recording of app  
*Narration:*
> "Let me show you how it works. First, X-ray analysis - upload an image and get instant cavity detection, pathology classification, and tooth identification. Next, clinical case assessment - input patient information and receive a comprehensive diagnosis with treatment plan, urgency classification, and evidence-based recommendations. Finally, our voice system - use Web Speech API with DentalGemma by default, or toggle to Gemini 2.5 Flash Native Audio for enhanced conversational experience."

**1:45-2:15 - Additional Features & Innovation**

*Visual:* Dentist finder map, research dashboard, edge AI toggle  
*Narration:*
> "But that's not all. Find nearby dentists with ratings and reviews using Google Places API. Access evidence-based research through PubMed. And here's the innovation - our multi-agent system orchestrates complex diagnostic workflows automatically."

**2:15-2:45 - Technical Details**

*Visual:* Code snippets, deployment diagram, architecture  
*Narration:*
> "Built with Next.js 16 and Tailwind CSS v4, deployed on Vercel with Modal.com handling GPU inference. Vercel AI SDK 6 powers our agentic workflow system. The fine-tuned models achieve high accuracy on dental-specific tasks, demonstrating the power of domain adaptation for medical AI."

**2:45-3:00 - Impact & Conclusion**

*Visual:* Impact statistics, call to action  
*Narration:*
> "DentalGemma makes AI-powered dental diagnostics accessible to professionals worldwide. Intelligent with agentic workflows, and comprehensive with 11 integrated features. Try it now at dentalgemma.vercel.app. Together, we're building the future of dental care."

### Written Documentation

- **Submission Writeup** (3 pages) — Project name, problem statement, solution overview, technical details, results, impact
- **README.md** — Comprehensive with quick start, tech stack, features, deployment guide
- **ARCHITECTURE.md** — System diagrams, data flow, API documentation
- **DATASETS.md** — Training data overview, VQA + Instruct details, preprocessing, licensing

### Deployment Artifacts

- **Live Demo:** `dentalgemma.vercel.app`
- **Model:** HuggingFace (DentalGemma VQA + Instruct fine-tuned models)
- **Code Repository:** Public GitHub with comprehensive documentation

---

## 🔮 Future Enhancements (Post-Challenge)

### Phase 2: Advanced Features
- Batch X-ray processing
- Before/after comparison mode
- 3D tooth visualization (Three.js)
- Periodontal charting
- DICOM format support
- Treatment timeline visualization

### Phase 3: Integration
- EHR integration (HL7 FHIR)
- Practice management system connectors
- Imaging software plugins

### Phase 4: Collaboration & Scale
- User accounts and team workspaces
- Case sharing and collaboration
- Comments and annotations
- Multi-language support (Spanish, French, Portuguese, Arabic)
- Mobile app (React Native / Capacitor)
- Custom model training pipeline for individual clinics
- Analytics dashboard
- Usage tracking and performance monitoring
- User feedback collection
- A/B testing capabilities

---

## 📚 Documentation Deliverables

### 1. README.md (Main Repository)
- Project overview
- Features list
- Tech stack
- Quick start guide
- Environment variables
- Deployment instructions
- Contributing guidelines
- License

### 2. ARCHITECTURE.md
- System architecture diagram
- Component breakdown
- Data flow
- API endpoints
- Security considerations
- Cloud architecture details

### 3. API.md
- Endpoint documentation
- Request/response formats
- Authentication
- Rate limiting
- Error codes
- Example requests

### 4. DATASETS.md
- Training data overview
- VQA dataset details (1,654 samples)
- Instruct dataset details (2,494 samples)
- Data preprocessing
- Licensing information

### 5. DEPLOYMENT.md
- Prerequisites
- Modal.com setup
- Vercel deployment
- Environment configuration
- Troubleshooting

### 6. USER_GUIDE.md
- Getting started
- Feature walkthroughs
- Tips and best practices
- FAQ
- Support contact

### 7. SUBMISSION.md (Challenge Writeup)
- Project name and team
- Problem statement
- Solution overview
- Technical details
- Results and impact
- Future work

---

## ✅ Pre-Launch Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] No console.log in production
- [ ] Environment variables documented

### Testing
- [ ] All features tested manually
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] API endpoints tested with edge cases
- [ ] Error handling verified

### Performance
- [ ] Images optimized (WebP, lazy loading)
- [ ] Bundle size optimized (code splitting, tree shaking)
- [ ] Lighthouse audit passed (> 90)
- [ ] Loading states implemented throughout
- [ ] Caching configured appropriately

### Security
- [ ] API keys in environment variables only
- [ ] Rate limiting active
- [ ] HTTPS enforced
- [ ] Input validation on all forms
- [ ] XSS protection enabled

### Legal
- [ ] Medical disclaimers on every page
- [ ] Privacy policy drafted
- [ ] Terms of service created
- [ ] License file included
- [ ] Dataset attributions complete

### Deployment
- [ ] Vercel project configured
- [ ] Environment variables set in Vercel dashboard
- [ ] Modal endpoints deployed and verified
- [ ] PWA manifest and service worker functional

### Submission
- [ ] Demo videos recorded and edited (2 videos)
- [ ] Writeup completed (3 pages)
- [ ] Code repository public on GitHub
- [ ] Live demo URL functional
- [ ] All submission links verified

---

## 📞 Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel AI SDK 6](https://ai-sdk.dev/)
- [Modal.com Docs](https://modal.com/docs)
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
- [Google Places API](https://developers.google.com/maps/documentation/places)
- [PubMed E-Utils](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [MedGemma Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge)

---

*Built for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge) 🏥*

*Bringing dental diagnostics into the age of medical foundation models* 🦷✨
