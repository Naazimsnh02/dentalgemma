# Prompt for Updating DentalGemma Mobile App

## Context
The DentalGemma web app has been simplified to show only raw AI model output without any parsing, metadata displays, or complex formatting. The mobile app needs the same updates.

## Current Web App Implementation (Reference)

### 1. Image Analysis Results Display
**File**: `dentalgemma-app/components/xray/analysis-results.tsx`

**What it does:**
- Shows a single "Clinical Analysis" card with plain text
- Strips all markdown formatting (bold, bullets, headers, etc.)
- No metadata displays (no confidence, urgency, processing time, timestamp)
- Only shows export buttons (PDF and JSON)

**Key function:**
```typescript
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')      // Remove bold
    .replace(/\*(.+?)\*/g, '$1')           // Remove italic
    .replace(/^#{1,6}\s+/gm, '')           // Remove headers
    .replace(/^\s*[-*+]\s+/gm, '')         // Remove bullets
    .replace(/^\s*\d+\.\s+/gm, '')         // Remove numbered lists
    .replace(/```[\s\S]*?```/g, '')        // Remove code blocks
    .replace(/`(.+?)`/g, '$1')             // Remove inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')    // Remove links, keep text
    .replace(/\n{3,}/g, '\n\n')            // Clean extra newlines
    .trim();
}
```

**UI Structure:**
```tsx
<View>
  <Card>
    <Text style={styles.title}>Clinical Analysis</Text>
    <Text style={styles.analysis}>{plainText}</Text>
  </Card>
  
  <View style={styles.exportButtons}>
    <Button onPress={exportPDF}>Export PDF</Button>
    <Button onPress={exportJSON}>Export JSON</Button>
  </View>
</View>
```

### 2. Model Client (API/Inference)
**File**: `dentalgemma-app/lib/api/modal-client.ts`

**What it does:**
- Stores raw analysis text in `rawAnalysis` field
- Cleans response text (removes thought traces, special tokens)
- Returns simple analysis object with minimal metadata

**Key changes:**
```typescript
// Return structure
return {
  id: crypto.randomUUID(),
  imageId: crypto.randomUUID(),
  type: analysisType,
  rawAnalysis: cleanedAnalysis,  // Full raw text
  findings: this.extractFindings(cleanedAnalysis),  // For backward compatibility
  confidence: this.extractConfidence(cleanedAnalysis),  // Not displayed
  urgency: this.determineUrgency(cleanedAnalysis, analysisType),  // Not displayed
  recommendations: this.extractRecommendations(cleanedAnalysis),  // Not displayed
  processingTime,  // Not displayed
  timestamp: new Date(),  // Not displayed
};
```

### 3. PDF Export
**File**: `dentalgemma-app/app/(dashboard)/xray-analysis/page.tsx`

**What it includes:**
```
DentalGemma Analysis Report
Generated on [date]
─────────────────────────

Clinical Analysis
[Plain text from AI without markdown]

Disclaimer: [standard disclaimer]
```

**What it does NOT include:**
- ❌ Analysis type
- ❌ Processing time
- ❌ Confidence
- ❌ Urgency
- ❌ Severity
- ❌ Pathology class
- ❌ Separate findings/recommendations sections

### 4. JSON Export
**File**: `dentalgemma-app/app/(dashboard)/xray-analysis/page.tsx`

**Structure:**
```json
{
  "id": "uuid",
  "timestamp": "2026-02-22T...",
  "clinicalAnalysis": "Full raw text from AI model..."
}
```

**What it does NOT include:**
- ❌ type field
- ❌ processingTime field
- ❌ metadata object
- ❌ confidence
- ❌ urgency
- ❌ findings array
- ❌ recommendations array

### 5. Model Prompts
**File**: `scripts/modal_dentalgemma.py`

**Photo Analysis Prompt:**
```
Analyze this clinical dental photograph. Describe the condition of the 
teeth and gums visible. Note any signs of decay, discoloration, or other 
abnormalities. Assess the severity and recommend follow-up actions. 
Provide a clear, professional clinical description. Avoid repeating the 
same information.
```

**X-Ray Analysis Prompt:**
```
Analyze this dental radiograph. Describe any pathological findings and 
their locations using dental region terminology (e.g., "right mandibular 
region", "anterior maxillary region"). Provide your assessment of the 
condition, possible differential diagnoses, and clinical recommendations. 
Avoid repeating the same findings.
```

**System Prompt:**
```
You are an expert dental clinician and radiologist AI assistant. Analyze 
dental images and clinical information to provide accurate, evidence-based 
assessments. Always recommend clinical correlation and professional 
evaluation for definitive diagnosis.
```

### 6. Type Definitions
**File**: `dentalgemma-app/types/index.ts`

**Added field:**
```typescript
export interface XRayAnalysisBase {
  id: string;
  imageId: string;
  rawAnalysis?: string;  // NEW: Full raw text from model
  findings: string[];
  confidence: number;
  urgency: UrgencyLevel;
  recommendations: string[];
  visualData?: VisualAnnotations;
  processingTime: number;
  timestamp: Date;
}
```

## Task for Mobile App

Update the DentalGemma mobile app (`dentalgemma-mobile/`) to match the web app's simplified approach:

### Files to Update:

1. **`dentalgemma-mobile/src/components/image-analysis/ImageAnalysisResults.tsx`**
   - Remove all metadata displays (confidence, urgency, processing time, severity, pathology)
   - Show only one card: "Clinical Analysis" with plain text
   - Add `stripMarkdown()` function to remove all markdown formatting
   - Keep only export buttons

2. **`dentalgemma-mobile/src/hooks/useDentalGemma.ts`**
   - Add `rawAnalysis` field to store full text from model
   - Update the inference logic to save raw text before any parsing
   - Keep existing parsing for backward compatibility but don't display it

3. **`dentalgemma-mobile/src/screens/ImageAnalysisScreen.tsx`**
   - Update to pass only raw analysis text to results component
   - Remove any metadata displays from the screen

4. **Export Functions (if they exist)**
   - Update PDF export to show only: Header → Clinical Analysis → Disclaimer
   - Update JSON export to include only: id, timestamp, clinicalAnalysis

5. **Model Prompts (if configurable)**
   - Update prompts to match the web app prompts above
   - Add "Avoid repeating the same information/findings" instruction

### Key Principles:

1. **Show What AI Says, Nothing More**
   - Display the raw model output as plain text
   - Don't parse into sections
   - Don't extract or highlight metadata

2. **Strip Markdown**
   - Remove all markdown formatting before display
   - Keep the text readable but plain

3. **Minimal Metadata**
   - Don't show confidence, urgency, processing time, etc.
   - If AI naturally mentions these in its text, they'll appear as part of the narrative

4. **Consistent Exports**
   - PDF: Header + Plain Text + Disclaimer
   - JSON: Only id, timestamp, clinicalAnalysis

5. **Simple UI**
   - One card with the analysis text
   - Export buttons below
   - No complex layouts or sections

### Testing Checklist:

- [ ] Image analysis shows only one "Clinical Analysis" card
- [ ] No markdown formatting visible (no **, *, #, -, bullets)
- [ ] No metadata displays (confidence, urgency, time, etc.)
- [ ] PDF export shows only header, text, disclaimer
- [ ] JSON export has only 3 fields
- [ ] Text is readable and properly formatted (line breaks preserved)
- [ ] Export buttons work correctly

### Reference Implementation:

See these web app files for exact implementation:
- `dentalgemma-app/components/xray/analysis-results.tsx` - UI component
- `dentalgemma-app/app/(dashboard)/xray-analysis/page.tsx` - Export functions
- `dentalgemma-app/lib/api/modal-client.ts` - Data handling
- `FINAL_SIMPLIFICATION_SUMMARY.md` - Complete overview

### Expected Result:

The mobile app should have the same minimal, clean interface as the web app:
- One card showing plain text from the AI
- No parsing, no metadata, no complex formatting
- Simple exports with just the essential information

This creates a consistent experience across web and mobile platforms.
