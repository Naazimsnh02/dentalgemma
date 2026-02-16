# Requirements Document

## Introduction

DentalGemma is a production-ready dental AI diagnostic platform that leverages the fine-tuned **DentalGemma 1.5 4B IT (Multimodal)** model to provide comprehensive dental diagnostics, clinical assessments, and evidence-based treatment recommendations. The DentalGemma model combines visual understanding of dental X-rays (intraoral and panoramic radiographs) with clinical reasoning for diagnosis, treatment planning, and patient counseling, following evidence-based dental protocols.

The platform features a cloud-first architecture, multi-agent diagnostic workflows, and real-time voice consultation capabilities. It integrates with external APIs (Google Places, PubMed) to provide dentist location services and evidence-based research access.

The application targets dental professionals, students, researchers, and patients (for educational purposes), providing 11 core features including X-ray analysis, clinical case assessment, voice consultation, agentic diagnostic workflows, dentist finder, treatment tracking, research dashboard, patient education, symptom checker, model information, and an interactive dashboard.

## Glossary

- **DentalGemma_System**: The complete web application including frontend, backend, and AI model
- **DentalGemma_Model**: The fine-tuned DentalGemma 1.5 4B IT (Multimodal) model for dental diagnostics, combining visual understanding of dental X-rays with clinical reasoning for diagnosis, treatment planning, and patient counseling
- **Cloud_Inference**: GPU-based model inference on Modal.com servers
- **Agentic_Workflow**: Multi-agent system that orchestrates diagnostic tasks autonomously
- **Hybrid_Voice**: Voice consultation system supporting both Web Speech API and Gemini Native Audio
- **Analysis_Report**: Structured output containing diagnosis, findings, and recommendations
- **Urgency_Level**: Classification of medical urgency (Emergency, Urgent, Routine, Home Care)
- **User**: Any person interacting with the application (dental professional, student, or patient)
- **Clinical_Case**: Complete patient information including symptoms, findings, and medical history
- **X-Ray_Image**: Dental radiographic image in supported formats (JPEG, PNG, DICOM)

## Requirements

### Requirement 1: X-Ray Analysis Suite

**User Story:** As a dental professional, I want to analyze dental X-ray images using AI, so that I can quickly identify cavities, pathologies, and tooth structures with confidence scores.

#### Acceptance Criteria

1. WHEN a User uploads an X-Ray_Image, THE DentalGemma_System SHALL accept JPEG, PNG, and DICOM formats
2. WHEN a User selects cavity detection analysis, THE DentalGemma_Model SHALL return cavity count (0-3+), classification (normal/cavity), and confidence scores
3. WHEN a User selects OPG classification analysis, THE DentalGemma_Model SHALL classify the image into one of 6 pathology categories (Healthy, Caries, Impacted, BDC-BDR, Infection, Fractured)
4. WHEN a User selects tooth identification analysis, THE DentalGemma_Model SHALL return total tooth count and 8-class type classification
5. WHEN a User selects general radiographic assessment, THE DentalGemma_Model SHALL generate a systematic evaluation report with clinical findings
6. WHEN analysis is complete, THE DentalGemma_System SHALL display results with confidence scores, visual overlays, and color-coded indicators
7. WHEN a User requests export, THE DentalGemma_System SHALL generate a downloadable PDF report with professional formatting
8. WHEN a User requests JSON export, THE DentalGemma_System SHALL provide raw analysis data in JSON format
9. WHEN analysis processing time exceeds 2 seconds, THE DentalGemma_System SHALL display a progress indicator
10. WHEN a User uploads an invalid image format, THE DentalGemma_System SHALL display an error message and prevent submission


### Requirement 2: Clinical Case Assessment

**User Story:** As a dental professional, I want to input comprehensive patient information and receive AI-generated clinical assessments, so that I can make evidence-based diagnostic and treatment decisions.

#### Acceptance Criteria

1. WHEN a User enters patient information, THE DentalGemma_System SHALL collect age, gender, and optional patient ID
2. WHEN a User describes chief complaint, THE DentalGemma_System SHALL collect complaint description, duration, pain level (1-10), and symptom triggers
3. WHEN a User enters clinical findings, THE DentalGemma_System SHALL collect intraoral, extraoral, soft tissue, and periodontal status information
4. WHEN a User enters radiographic findings, THE DentalGemma_System SHALL accept text descriptions and optional X-Ray_Image uploads
5. WHEN a User enters medical history, THE DentalGemma_System SHALL collect medications, allergies, systemic conditions, and previous treatments
6. WHEN a User submits a Clinical_Case, THE DentalGemma_Model SHALL generate a primary diagnosis with ICD-10 code and confidence level
7. WHEN a diagnosis is generated, THE DentalGemma_Model SHALL provide differential diagnoses (top 3 alternatives)
8. WHEN a diagnosis is generated, THE DentalGemma_Model SHALL classify Urgency_Level as Emergency, Urgent, Routine, or Home Care
9. WHEN a diagnosis is generated, THE DentalGemma_Model SHALL provide a management plan with step-by-step protocol
10. WHEN antibiotics are indicated, THE DentalGemma_Model SHALL recommend drug, dosage, duration, and evidence-based rationale
11. WHEN a diagnosis is generated, THE DentalGemma_Model SHALL provide follow-up schedule with monitoring parameters
12. WHEN a diagnosis is generated, THE DentalGemma_Model SHALL generate patient counseling in simple language
13. WHEN a diagnosis is generated, THE DentalGemma_Model SHALL reference relevant clinical guidelines with evidence level (A/B/C)
14. WHEN form data is entered, THE DentalGemma_System SHALL auto-save to localStorage every 30 seconds
15. WHEN a User requests export, THE DentalGemma_System SHALL generate a PDF report with professional medical formatting

### Requirement 3: Hybrid Voice Consultation

**User Story:** As a dental professional, I want to conduct hands-free voice consultations with AI, so that I can get clinical information during procedures without touching devices.

#### Acceptance Criteria

1. WHEN a User activates voice mode, THE Hybrid_Voice SHALL use Web Speech API for speech recognition by default
2. WHEN a User activates voice mode, THE Hybrid_Voice SHALL use Web Speech API for text-to-speech by default
3. WHEN a User toggles enhanced mode, THE Hybrid_Voice SHALL use Gemini 2.5 Flash Native Audio for audio processing
4. WHEN a User speaks in default mode, THE DentalGemma_System SHALL transcribe speech, send to DentalGemma_Model, and speak response
5. WHEN a User speaks in enhanced mode, THE DentalGemma_System SHALL process audio natively through Gemini with dental expertise system prompt
6. WHEN voice consultation is active, THE DentalGemma_System SHALL display real-time audio waveform visualization
7. WHEN voice consultation is active, THE DentalGemma_System SHALL display live transcription for both User and AI
8. WHEN a User requests transcript export, THE DentalGemma_System SHALL generate downloadable text or PDF transcript
9. WHEN voice settings are changed, THE DentalGemma_System SHALL apply speech rate, pitch, and language preferences
10. WHEN background noise exceeds threshold, THE DentalGemma_System SHALL display noise level indicator

### Requirement 4: Agentic Diagnostic Workflow

**User Story:** As a dental professional, I want an autonomous multi-agent system to orchestrate complex diagnostic workflows, so that I can receive comprehensive analysis without manual coordination.

#### Acceptance Criteria

1. WHEN a User initiates agentic workflow, THE Agentic_Workflow SHALL analyze input to determine required steps
2. WHEN X-Ray_Image is present, THE Agentic_Workflow SHALL invoke X-Ray Analyzer Agent with analyzeXray tool
3. WHEN clinical data is present, THE Agentic_Workflow SHALL invoke Clinical Assessor Agent with assessCase tool
4. WHEN diagnosis is complete, THE Agentic_Workflow SHALL invoke Research Synthesizer Agent with searchResearch tool
5. WHEN specialist referral is needed, THE Agentic_Workflow SHALL invoke Referral Agent with findSpecialist tool
6. WHEN all agents complete, THE Agentic_Workflow SHALL invoke Report Synthesis Agent with generateReport tool
7. WHEN workflow executes, THE DentalGemma_System SHALL display animated step-by-step progress visualization
8. WHEN agents make decisions, THE DentalGemma_System SHALL log all tool calls with inputs and outputs
9. WHEN workflow completes, THE DentalGemma_System SHALL generate comprehensive PDF report combining all findings
10. WHEN a User requests override, THE DentalGemma_System SHALL allow manual guidance of workflow steps


### Requirement 5: Dentist Finder with Location Services

**User Story:** As a patient, I want to find nearby dental specialists with ratings and contact information, so that I can schedule appointments with qualified professionals.

#### Acceptance Criteria

1. WHEN a User enters a location, THE DentalGemma_System SHALL accept address, city, or GPS coordinates
2. WHEN a User searches for dentists, THE DentalGemma_System SHALL query Google Places API with location and radius
3. WHEN a User applies filters, THE DentalGemma_System SHALL filter by specialty (General, Orthodontics, Endodontics, Periodontics, Oral Surgery, Pediatric, Prosthodontics, Cosmetic)
4. WHEN a User applies filters, THE DentalGemma_System SHALL filter by rating (4+, 4.5+ stars) and price level
5. WHEN search results are returned, THE DentalGemma_System SHALL display results on interactive Leaflet map with clustered markers
6. WHEN search results are returned, THE DentalGemma_System SHALL display list with name, specialty, rating, distance, phone, website, and hours
7. WHEN a User clicks a map marker, THE DentalGemma_System SHALL highlight corresponding dentist in list
8. WHEN a User requests directions, THE DentalGemma_System SHALL open Google Maps with dentist location
9. WHEN a User saves a dentist, THE DentalGemma_System SHALL persist favorite to localStorage
10. WHEN no results are found, THE DentalGemma_System SHALL display helpful message with suggestions

### Requirement 6: Treatment Progress Tracker

**User Story:** As a patient, I want to track my dental treatment progress over time, so that I can monitor milestones, costs, and upcoming appointments.

#### Acceptance Criteria

1. WHEN a User adds a treatment, THE DentalGemma_System SHALL collect treatment name, phase, status, completion percentage, and next appointment date
2. WHEN a User views progress, THE DentalGemma_System SHALL display horizontal timeline visualization with milestones
3. WHEN a User views progress, THE DentalGemma_System SHALL display interactive charts for progress over time and cost tracking
4. WHEN a treatment is overdue, THE DentalGemma_System SHALL display red color-coded indicator
5. WHEN a treatment is upcoming, THE DentalGemma_System SHALL display yellow color-coded indicator
6. WHEN a treatment is completed, THE DentalGemma_System SHALL display green color-coded indicator
7. WHEN a User uploads documents, THE DentalGemma_System SHALL associate files with treatment entries
8. WHEN a User requests export, THE DentalGemma_System SHALL generate PDF progress report
9. WHEN treatment data is modified, THE DentalGemma_System SHALL persist changes to localStorage
10. WHEN offline, THE DentalGemma_System SHALL allow full access to treatment tracking features

### Requirement 7: Dental Research Dashboard

**User Story:** As a dental professional, I want to search evidence-based research from PubMed, so that I can access scientific literature to support clinical decisions.

#### Acceptance Criteria

1. WHEN a User enters a search query, THE DentalGemma_System SHALL query PubMed E-Utils API with search terms
2. WHEN a User applies filters, THE DentalGemma_System SHALL filter by date range (last 6 months, 1 year, 5 years, all time)
3. WHEN a User applies filters, THE DentalGemma_System SHALL filter by content type (research papers, clinical trials, systematic reviews, case reports, guidelines)
4. WHEN search results are returned, THE DentalGemma_System SHALL display article title, authors, publication date, journal, and abstract
5. WHEN a User clicks an article, THE DentalGemma_System SHALL open PubMed page in new tab
6. WHEN a User saves an article, THE DentalGemma_System SHALL add to reading list in localStorage
7. WHEN a User exports citations, THE DentalGemma_System SHALL generate BibTeX, APA, or MLA format
8. WHEN a User searches similar papers, THE DentalGemma_System SHALL use PubMed eLink API to find related articles
9. WHEN search terms are entered, THE DentalGemma_System SHALL highlight matching terms in results
10. WHEN API rate limit is approached, THE DentalGemma_System SHALL throttle requests to 3 per second

### Requirement 8: Patient Education Portal

**User Story:** As a patient, I want to learn about dental conditions and procedures in simple language, so that I can understand my oral health and treatment options.

#### Acceptance Criteria

1. WHEN a User browses conditions, THE DentalGemma_System SHALL display 98 dental conditions from training data
2. WHEN a User filters conditions, THE DentalGemma_System SHALL filter by category (Preventive Care, Restorative Procedures, Periodontal Conditions, Endodontic Issues, Oral Surgery, Orthodontics, Pediatric Dentistry, Emergency Care)
3. WHEN a User selects a condition, THE DentalGemma_Model SHALL generate patient-friendly explanation with symptoms, causes, treatments, and prevention
4. WHEN a User views condition page, THE DentalGemma_System SHALL display interactive dental anatomy explorer with hover tooltips
5. WHEN a User views condition page, THE DentalGemma_System SHALL provide pre/post-procedure guidance with visual aids
6. WHEN a User requests translation, THE DentalGemma_System SHALL use browser translation API for multi-language support
7. WHEN a User shares education content, THE DentalGemma_System SHALL generate shareable education cards in social media format
8. WHEN a User prints content, THE DentalGemma_System SHALL apply print-friendly formatting
9. WHEN a User views related conditions, THE DentalGemma_System SHALL display links to similar conditions
10. WHEN content is generated, THE DentalGemma_Model SHALL use simple language avoiding complex medical terminology


### Requirement 9: Dental Symptom Checker

**User Story:** As a patient, I want to check my dental symptoms and receive urgency assessment, so that I can determine whether I need immediate care or can wait for a regular appointment.

#### Acceptance Criteria

1. WHEN a User starts symptom checker, THE DentalGemma_System SHALL display medical disclaimer
2. WHEN a User answers questions, THE DentalGemma_System SHALL collect location (which tooth/area), pain type (sharp, dull, throbbing, constant), duration, triggers, and associated symptoms
3. WHEN symptoms are simple, THE DentalGemma_System SHALL use rule-based engine for offline diagnosis
4. WHEN symptoms are complex, THE DentalGemma_Model SHALL analyze symptoms and generate differential diagnosis
5. WHEN diagnosis is complete, THE DentalGemma_System SHALL rank possible conditions by likelihood
6. WHEN diagnosis is complete, THE DentalGemma_System SHALL classify Urgency_Level with color-coded recommendations
7. WHEN Urgency_Level is Emergency, THE DentalGemma_System SHALL recommend immediate care (ER/urgent care)
8. WHEN Urgency_Level is Urgent, THE DentalGemma_System SHALL recommend dentist visit within 24-48 hours
9. WHEN Urgency_Level is Routine, THE DentalGemma_System SHALL recommend regular appointment scheduling
10. WHEN Urgency_Level is Home Care, THE DentalGemma_System SHALL provide self-care instructions and monitoring guidance
11. WHEN results are displayed, THE DentalGemma_System SHALL provide home care recommendations and red flag warnings
12. WHEN a User saves results, THE DentalGemma_System SHALL persist to history in localStorage
13. WHEN a User exports results, THE DentalGemma_System SHALL generate PDF report for dentist
14. WHEN offline, THE DentalGemma_System SHALL use cached decision trees and rules engine

### Requirement 10: Cloud-Only Inference Architecture

**User Story:** As a User, I want fast and accurate analysis from a cloud-based model, so that I can get high-quality diagnostic results without draining my device's battery or storage.

#### Acceptance Criteria

1. WHEN a User requests analysis, THE DentalGemma_System SHALL send requests to Modal.com GPU backend
2. WHEN inference is active, THE DentalGemma_System SHALL display a processing indicator
3. WHEN Cloud_Inference completes, THE DentalGemma_System SHALL return results with high confidence scores
4. WHEN offline, THE DentalGemma_System SHALL provide cached clinical guidelines and knowledge base access (no AI inference)
5. WHEN internet connection is lost, THE DentalGemma_System SHALL gracefully handle failures and prompt user to reconnect

### Requirement 11: Model Information and Transparency

**User Story:** As a User, I want to understand the DentalGemma model architecture, training data, and capabilities, so that I can assess its reliability and limitations.

#### Acceptance Criteria

1. WHEN a User views model information, THE DentalGemma_System SHALL display architecture details (MedGemma 1.5 4B IT + SigLIP vision encoder + LoRA fine-tuning)
2. WHEN a User views training data, THE DentalGemma_System SHALL display dataset statistics (6 datasets, 4,148 samples total: 1,654 X-ray images + 2,494 clinical cases, covering 98 dental conditions)
3. WHEN a User views training data, THE DentalGemma_System SHALL break down X-ray samples (1,654 total: 418 cavity, 517 OPG, 64 tooth ID, 655 general)
4. WHEN a User views training data, THE DentalGemma_System SHALL break down clinical case samples (2,494 cases covering 98 conditions)
5. WHEN a User views capabilities, THE DentalGemma_System SHALL provide interactive demo with example inputs and outputs
6. WHEN a User views performance metrics, THE DentalGemma_System SHALL display accuracy benchmarks per task
7. WHEN a User views performance metrics, THE DentalGemma_System SHALL display inference speed metrics
8. WHEN a User views technical details, THE DentalGemma_System SHALL provide model card in HuggingFace format
9. WHEN a User views limitations, THE DentalGemma_System SHALL clearly state known issues and edge cases
10. WHEN a User requests resources, THE DentalGemma_System SHALL provide links to HuggingFace models, datasets, and documentation

### Requirement 12: Interactive Dashboard

**User Story:** As a User, I want a central dashboard showing my activity and quick access to all features, so that I can efficiently navigate the application.

#### Acceptance Criteria

1. WHEN a User views dashboard, THE DentalGemma_System SHALL display quick stats (total analyses, cases assessed, research papers found, dentists located)
2. WHEN a User views dashboard, THE DentalGemma_System SHALL display recent activity timeline with last 10 activities
3. WHEN a User views dashboard, THE DentalGemma_System SHALL display quick action cards for all 11 features
4. WHEN a User views dashboard, THE DentalGemma_System SHALL display condition distribution pie chart with top 5 conditions
5. WHEN a User views dashboard, THE DentalGemma_System SHALL display urgency breakdown bar chart
6. WHEN a User views dashboard, THE DentalGemma_System SHALL display usage over time line chart for last 30 days
7. WHEN a User views dashboard, THE DentalGemma_System SHALL display notifications panel (if any)
8. WHEN a User clicks quick action card, THE DentalGemma_System SHALL navigate to corresponding feature page
9. WHEN a User clicks activity item, THE DentalGemma_System SHALL navigate to detailed view
10. WHEN dashboard data updates, THE DentalGemma_System SHALL persist statistics to localStorage


### Requirement 13: Analysis History and Data Management

**User Story:** As a User, I want to view, search, and manage my analysis history, so that I can reference past results and track my usage over time.

#### Acceptance Criteria

1. WHEN a User views history, THE DentalGemma_System SHALL display timeline of all analyses in reverse chronological order
2. WHEN a User filters history, THE DentalGemma_System SHALL filter by type (X-Ray Analysis, Clinical Assessment, Voice Consultation, Agentic Workflow, Symptom Check)
3. WHEN a User filters history, THE DentalGemma_System SHALL filter by date range
4. WHEN a User searches history, THE DentalGemma_System SHALL search by keywords in analysis content
5. WHEN a User views history item, THE DentalGemma_System SHALL display thumbnail, type, date, summary, and Urgency_Level indicator
6. WHEN a User selects multiple items, THE DentalGemma_System SHALL enable bulk export and delete operations
7. WHEN a User exports history, THE DentalGemma_System SHALL generate PDF or JSON format
8. WHEN a User deletes history, THE DentalGemma_System SHALL require confirmation before permanent deletion
9. WHEN history is modified, THE DentalGemma_System SHALL persist changes to localStorage
10. WHEN a User clears all history, THE DentalGemma_System SHALL display confirmation dialog with warning

### Requirement 14: User Interface and Accessibility

**User Story:** As a User, I want an accessible, responsive, and professional interface, so that I can use the application effectively on any device.

#### Acceptance Criteria

1. WHEN a User accesses the application, THE DentalGemma_System SHALL display collapsible sidebar navigation with feature icons
2. WHEN a User navigates pages, THE DentalGemma_System SHALL display breadcrumbs and active state highlighting
3. WHEN a User views any page, THE DentalGemma_System SHALL display medical disclaimer footer
4. WHEN a User resizes browser, THE DentalGemma_System SHALL adapt layout responsively (mobile 320px+, tablet 768px+, desktop 1024px+)
5. WHEN a User navigates with keyboard, THE DentalGemma_System SHALL provide focus indicators and full keyboard support
6. WHEN a User uses screen reader, THE DentalGemma_System SHALL provide ARIA labels and semantic HTML
7. WHEN a User views text, THE DentalGemma_System SHALL maintain WCAG 2.1 AA contrast ratio (≥ 4.5:1)
8. WHEN a User changes theme, THE DentalGemma_System SHALL apply light, dark, or system preference
9. WHEN a User adjusts accessibility settings, THE DentalGemma_System SHALL support font size adjustment, reduced animations, high contrast, and color-blind friendly modes
10. WHEN a User runs Lighthouse audit, THE DentalGemma_System SHALL achieve score > 90

### Requirement 15: Security and Privacy

**User Story:** As a User, I want my data to be secure and private, so that I can trust the application with sensitive health information.

#### Acceptance Criteria

1. WHEN a User uploads data, THE DentalGemma_System SHALL not store data on servers (ephemeral processing only)
2. WHEN a User uploads data, THE DentalGemma_System SHALL ensure data is encrypted in transit
3. WHEN a User accesses the application, THE DentalGemma_System SHALL enforce HTTPS-only connections
4. WHEN API keys are used, THE DentalGemma_System SHALL store them exclusively in environment variables
5. WHEN a User makes API requests, THE DentalGemma_System SHALL implement rate limiting (10 requests/minute for AI endpoints)
6. WHEN errors occur, THE DentalGemma_System SHALL display user-friendly messages without exposing stack traces
7. WHEN a User views any page, THE DentalGemma_System SHALL display medical disclaimer stating educational purpose only
8. WHEN a User views disclaimer, THE DentalGemma_System SHALL state the application is not HIPAA compliant
9. WHEN a User views disclaimer, THE DentalGemma_System SHALL warn against uploading real patient data
10. WHEN a User clears data, THE DentalGemma_System SHALL remove all localStorage entries immediately

### Requirement 16: Performance and Reliability

**User Story:** As a User, I want fast, reliable performance with graceful error handling, so that I can depend on the application for time-sensitive clinical work.

#### Acceptance Criteria

1. WHEN Cloud_Inference is requested, THE DentalGemma_System SHALL complete analysis within 5 seconds under normal conditions
4. WHEN API requests fail after retries, THE DentalGemma_System SHALL fall back to cached data if available, or display an error
5. WHEN Modal.com cold start occurs, THE DentalGemma_System SHALL use GPU snapshotting for 10x faster initialization
6. WHEN images are loaded, THE DentalGemma_System SHALL use WebP format with lazy loading
7. WHEN JavaScript bundles are loaded, THE DentalGemma_System SHALL use code splitting and tree shaking
8. WHEN a User installs PWA, THE DentalGemma_System SHALL cache static assets for offline access
9. WHEN offline, THE DentalGemma_System SHALL provide cached knowledge base, symptom checker, and treatment tracker
10. WHEN errors occur, THE DentalGemma_System SHALL log errors for debugging while maintaining user privacy

### Requirement 17: External API Integration

**User Story:** As a developer, I want reliable integration with external APIs, so that the application can provide location services and research access.

#### Acceptance Criteria

1. WHEN Google Places API is called, THE DentalGemma_System SHALL use API key from environment variables
2. WHEN Google Places API rate limit is approached, THE DentalGemma_System SHALL cache results aggressively
3. WHEN Google Places API fails, THE DentalGemma_System SHALL display error message and suggest retry
4. WHEN PubMed E-Utils API is called, THE DentalGemma_System SHALL respect 3 requests/second rate limit
5. WHEN PubMed E-Utils API is called, THE DentalGemma_System SHALL not require API key (free tier)
6. WHEN Gemini Live API is called, THE DentalGemma_System SHALL use official @google/genai SDK v1.41+
7. WHEN Gemini Live API is called, THE DentalGemma_System SHALL inject dental expertise system prompt
8. WHEN Modal.com API is called, THE DentalGemma_System SHALL implement keep-alive pings every 5 minutes
9. WHEN Modal.com API fails, THE DentalGemma_System SHALL show a service unavailable message
10. WHEN any external API fails, THE DentalGemma_System SHALL log failure and provide user-friendly error message

### Requirement 18: Progressive Web App (PWA)

**User Story:** As a User, I want to install the application as a PWA, so that I can access it offline and use it like a native app.

#### Acceptance Criteria

1. WHEN a User visits the application, THE DentalGemma_System SHALL provide PWA manifest with app metadata
2. WHEN a User installs PWA, THE DentalGemma_System SHALL register service worker for offline support
3. WHEN offline, THE DentalGemma_System SHALL serve cached pages and assets
4. WHEN offline, THE DentalGemma_System SHALL provide cached clinical guidelines (98 conditions)
5. WHEN offline, THE DentalGemma_System SHALL enable symptom checker with rule-based engine
6. WHEN offline, THE DentalGemma_System SHALL enable treatment progress tracker
7. WHEN offline, THE DentalGemma_System SHALL enable voice TTS using Web Speech API
8. WHEN offline, THE DentalGemma_System SHALL display offline indicator in UI
9. WHEN connection is restored, THE DentalGemma_System SHALL sync pending operations if applicable
10. WHEN a User views PWA, THE DentalGemma_System SHALL provide app-like experience with no browser chrome

