# DentalGemma UI Parsing Issues Report

## Executive Summary
Testing revealed several critical issues where the model provides proper responses but the UI cannot parse them correctly, or where the model response format needs improvement.

---

## ✅ FIXES APPLIED (Feb 22, 2026)

### Deduplication Logic
**Files Modified:**
- `dentalgemma-app/lib/api/modal-client.ts`
- `dentalgemma-app/app/api/symptom-check/route.ts`

**Changes:**
1. Added `deduplicateItems()` method in modal-client that normalizes text to detect duplicates
2. Applied to findings, recommendations, home care tips, and red flags
3. Uses case-insensitive comparison with punctuation removal

**Impact:** Eliminates repetitive content in X-Ray analysis and symptom checker

### Improved Prompts (Token-Efficient)
**Files Modified:**
- `scripts/modal_dentalgemma.py`
- `dentalgemma-app/app/api/symptom-check/route.ts`

**Changes:**
1. Simplified prompts with clearer structure
2. Added explicit "List each finding once" instructions
3. Reduced verbose explanations while maintaining clarity
4. Token reduction: ~15-20% fewer tokens in prompts

**Impact:** Better response quality, less repetition, lower token costs

---

## 🔴 CRITICAL ISSUES (Original Report)

### 1. Image Analysis - Complete Failure (500 Error)
**Status**: BROKEN ❌  
**Endpoints**: `/api/analyze-xray` (Next.js route)

**Problem**:
```
Status Code: 500
Error: "Failed to process image source: Failed to parse URL from /9j/4AAQ..."
```

**Root Cause**: 
- Images are being sent as base64 strings
- Backend expects URL or proper multipart/form-data format
- The route handler is trying to parse base64 as a URL

**Fix Required**:
```typescript
// In dentalgemma-app/app/api/analyze-xray/route.ts
// Need to handle base64 image data properly:

if (imageSource.startsWith('data:image')) {
  // Extract base64 data
  const base64Data = imageSource.split(',')[1];
  // Send to Modal with proper encoding
} else if (imageSource.startsWith('/9j/')) {
  // Already base64, wrap it properly
  imageSource = `data:image/jpeg;base64,${imageSource}`;
}
```

**Impact**: X-Ray and Photo analysis features completely non-functional in UI

---

## ⚠️ HIGH PRIORITY ISSUES

### 2. Clinical Photo Analysis - Missing Structured Data
**Status**: DEGRADED ⚠️  
**Endpoints**: `/api/analyze-xray` with `analysis_type: "photo"`

**Model Response** (Modal Direct - Working):
```json
{
  "success": true,
  "analysis": "## Clinical Findings\n\n**Overall oral health condition:** Unhealthy\n**Visible abnormalities:** dental caries, dental infection\n**Severity:** Moderate\n**Recommendation:** Multiple teeth affected; comprehensive treatment needed."
}
```

**UI Parsing Issue**:
```
⚠️ Could not extract findings from text
⚠️ Could not extract recommendations from text
```

**Fix Required**:
Update `dentalgemma-app/components/xray/analysis-results.tsx` to parse markdown format:

```typescript
// Add markdown parser for photo analysis
function parsePhotoAnalysis(text: string) {
  const findings = [];
  const recommendations = [];
  
  // Extract "Visible abnormalities"
  const abnormalitiesMatch = text.match(/\*\*Visible abnormalities:\*\* (.+)/);
  if (abnormalitiesMatch) {
    findings.push(...abnormalitiesMatch[1].split(',').map(s => s.trim()));
  }
  
  // Extract "Recommendation"
  const recMatch = text.match(/\*\*Recommendation:\*\* (.+)/);
  if (recMatch) {
    recommendations.push(recMatch[1].trim());
  }
  
  return { findings, recommendations };
}
```

---

### 3. X-Ray Analysis - Repetitive Content
**Status**: DEGRADED ⚠️  
**Endpoints**: `/api/analyze-xray` with `analysis_type: "xray"`

**Problem**: Model repeats findings 12+ times
```
- Right mandibular region: periapical abscess detected.
- Right maxillary region: periapical abscess detected.
[... same content repeated 12 times ...]
```

**Fix Required**:
Add deduplication in the UI parsing:

```typescript
// In analysis-results.tsx
function deduplicateFindings(findings: string[]): string[] {
  return [...new Set(findings)];
}
```

**Alternative**: Update Modal prompt to explicitly request non-repetitive output:
```python
# In scripts/modal_dentalgemma.py
prompt = f"""Analyze this dental radiograph. Provide a CONCISE, NON-REPETITIVE analysis.
List each finding ONCE only. Format:
**Findings:** (list each region once)
**Assessment:** (overall assessment)
**Recommendations:** (clinical recommendations)
"""
```

---

### 4. Symptom Checker - Incorrect Urgency Parsing
**Status**: DEGRADED ⚠️  
**Endpoints**: `/api/symptom-check`

**Problem**: Urgency mismatch
```
Model says: "**2. Urgency Classification:** Urgent"
Parsed as: "urgency": "routine"
```

**Fix Required**:
```typescript
// In symptom-checker parsing logic
function parseUrgency(text: string): string {
  const urgencyMatch = text.match(/\*\*\d+\.\s*Urgency Classification:\*\*\s*(\w+)/i);
  if (urgencyMatch) {
    return urgencyMatch[1].toLowerCase();
  }
  return 'routine'; // default
}
```

**Additional Issue**: Duplicate content in response
- Same analysis appears twice in the response
- Need to truncate or deduplicate before parsing

---

### 5. Symptom Checker - Red Flags Parsing
**Status**: DEGRADED ⚠️

**Problem**: Non-warning items in red flags array
```json
"redFlags": [
  "**Systemic Symptoms:** High fever...",  // ✓ Valid
  "## DentalGemma Analysis",               // ✗ Invalid
  "**Obstruction:** If the infection..."   // ✓ Valid
]
```

**Fix Required**:
```typescript
function parseRedFlags(text: string): string[] {
  const redFlagsSection = text.match(/\*\*5\.\s*Red Flag Warnings:\*\*\s*([\s\S]+?)(?=\n\n##|\n\n\*\*|$)/);
  if (!redFlagsSection) return [];
  
  return redFlagsSection[1]
    .split('\n')
    .filter(line => line.trim().startsWith('*'))
    .map(line => line.replace(/^\*\s*/, '').trim())
    .filter(line => line.startsWith('**')); // Only keep formatted warnings
}
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. Research Search - Empty Results
**Status**: DEGRADED ⚠️  
**Endpoints**: `/api/research/search`

**Problem**: 
- Direct PubMed API works (returns 5 papers)
- Next.js route returns empty array

**Likely Cause**: API key or configuration issue in Next.js route

**Fix Required**:
Check `dentalgemma-app/app/api/research/search/route.ts`:
```typescript
// Ensure PUBMED_API_KEY is set
if (!process.env.PUBMED_API_KEY) {
  console.error('PUBMED_API_KEY not configured');
}

// Add error logging
try {
  const results = await fetchPubMed(query);
  console.log('PubMed results:', results.length);
} catch (error) {
  console.error('PubMed fetch error:', error);
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Immediate Actions (Critical)
- [ ] Fix image base64 handling in `/api/analyze-xray/route.ts`
- [ ] Test image upload flow end-to-end
- [ ] Add error handling for image format issues

### High Priority (This Week)
- [ ] Add markdown parser for photo analysis results
- [ ] Implement finding deduplication for X-ray analysis
- [ ] Fix urgency classification parsing in symptom checker
- [ ] Filter invalid items from red flags array
- [ ] Add duplicate content detection and removal

### Medium Priority (Next Sprint)
- [ ] Debug research search API integration
- [ ] Add comprehensive error logging
- [ ] Implement response validation schemas
- [ ] Add unit tests for parsing functions

---

## 🧪 TESTING RECOMMENDATIONS

### 1. Add Response Validation
```typescript
// Create schemas for each endpoint response
import { z } from 'zod';

const XRayAnalysisSchema = z.object({
  success: z.boolean(),
  analysis: z.string(),
  findings: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

// Validate before sending to UI
const validated = XRayAnalysisSchema.safeParse(response);
if (!validated.success) {
  console.error('Invalid response format:', validated.error);
}
```

### 2. Add Integration Tests
```typescript
// Test each parsing function
describe('Symptom Checker Parsing', () => {
  it('should correctly parse urgency', () => {
    const text = '**2. Urgency Classification:** Urgent';
    expect(parseUrgency(text)).toBe('urgent');
  });
  
  it('should filter invalid red flags', () => {
    const text = `**5. Red Flag Warnings:**
* **Systemic Symptoms:** High fever
* ## DentalGemma Analysis
* **Obstruction:** Blocking`;
    const flags = parseRedFlags(text);
    expect(flags).not.toContain('## DentalGemma Analysis');
  });
});
```

---

## 📊 SUMMARY

| Issue | Severity | Status | Fix Complexity |
|-------|----------|--------|----------------|
| Image Analysis 500 Error | 🔴 Critical | Broken | Medium |
| Photo Analysis Parsing | ⚠️ High | Degraded | Low |
| X-Ray Repetition | ⚠️ High | Degraded | Low |
| Symptom Urgency | ⚠️ High | Degraded | Low |
| Red Flags Parsing | ⚠️ High | Degraded | Low |
| Research Empty Results | 🟡 Medium | Degraded | Medium |

**Overall Assessment**: The model provides good responses, but UI parsing needs significant improvements to handle markdown formatting, deduplication, and proper data extraction.

---

## 🎯 NEXT STEPS

1. **Immediate**: Fix image analysis 500 error (blocks entire feature)
2. **This Week**: Implement all parsing improvements for existing features
3. **Next Sprint**: Add comprehensive testing and validation
4. **Future**: Consider asking model to return structured JSON instead of markdown

