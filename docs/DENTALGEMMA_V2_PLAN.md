# DentalGemma v2 — Complete Retraining & UI Update Plan

> **Scope**: VQA (image) finetuning overhaul + frontend UI consolidation.
> The text-instruct finetune is working well and needs NO changes.

---

## Table of Contents

1. [What Is Wrong (Summary)](#1-what-is-wrong-summary)
2. [VQA Finetuning Plan](#2-vqa-finetuning-plan)
   - [Dataset 1: Clinical Photo Analysis (was "Cavity Detection")](#dataset-1-clinical-photo-analysis-was-cavity-detection)
   - [Dataset 2: OPG Classification (Improved)](#dataset-2-opg-classification-improved)
   - [Dataset 3: Dental Radiography — DROP](#dataset-3-dental-radiography--drop)
   - [Dataset 4: Panoramic Dental Xray (Improved)](#dataset-4-panoramic-dental-xray-improved)
   - [Dataset 5: OPG Object Detection (NEW)](#dataset-5-opg-object-detection-new)
   - [Compositional Answer Generation](#compositional-answer-generation)
   - [Build Dataset Changes](#build-dataset-changes)
   - [Training Changes](#training-changes)
3. [UI Update Plan](#3-ui-update-plan)
   - [Type System Changes](#type-system-changes)
   - [Analysis Results Component](#analysis-results-component)
   - [X-Ray Analysis Page](#x-ray-analysis-page)
   - [Sample Images Component](#sample-images-component)
   - [Modal Client Changes](#modal-client-changes)
   - [Backend (Modal) Changes](#backend-modal-changes)
4. [File Change Summary](#4-file-change-summary)
5. [Implementation Order](#5-implementation-order)

---

## 1. What Is Wrong (Summary)

### VQA Training Problems

| Problem | File | Details |
|---------|------|---------|
| Clinical photos called "X-rays" | `process_cavity_detection.py` | All questions say "dental X-ray" but images are mouth/teeth PHOTOS (with lips, gums, etc.) |
| Trivial counting answers | `process_cavity_detection.py` | Answers like "2 cavity region(s) detected" — no clinical reasoning |
| One static answer per class | `process_opg_classification.py` | Every "Caries" image gets the exact same paragraph. 6 answers total for 517 images |
| One identical answer for ALL images | `process_dental_radiography.py` | The `ANSWER` constant is used for ALL 655 images regardless of content |
| Raw tooth counting | `process_panoramic.py` | "shows approximately 27 identifiable teeth" — not clinically useful |
| Best dataset unused | (no file) | OPG Object Detection (232 images with YOLO bounding boxes for 6 pathology classes) is never processed |
| No-label dataset included | `process_dental_radiography.py` | 655 images with zero labels = model learns to ignore image content |

### UI Problems

| Problem | File | Details |
|---------|------|---------|
| 3 modes don't match model capabilities | `xray-analysis/page.tsx` | cavity/opg/general modes but model can't really do "general" (no-label training) |
| cavityCount/classification badges | `analysis-results.tsx` | Artifacts of bad counting-based training |
| Rigid JSON schema prompts | `modal-client.ts` | Model struggles to output exact JSON; prompts are fragile |
| Backend demands JSON output | `modal_dentalgemma.py` | `structured_prompts` dict forces rigid JSON the model can't reliably produce |

---

## 2. VQA Finetuning Plan

### Dataset 1: Clinical Photo Analysis (was "Cavity Detection")

**File to change**: `finetune/preprocessing/process_cavity_detection.py`

**What the data actually is**: ~418 clinical PHOTOGRAPHS of mouths/teeth with YOLO OBB bounding box labels (`cavity` / `normal` class per region). Filenames like `healthy_teeth_100`, `unhealthy_teeth_0`.

**What to change**:

1. **Rename the concept** — this is "Clinical Photo Analysis", never "X-ray" analysis
2. **Replace all questions** — remove every mention of "X-ray" and "radiograph"
3. **Replace all answer templates** — stop counting cavities, start clinical reasoning
4. **Pick 1-2 questions per image randomly** (currently picks 1 question per image)

**New question types** (pick 1-2 randomly per image):

```
TYPE 1 — Binary Classification:
  Question: "Does this clinical dental photograph show any signs of cavities or tooth decay?"
  Answer if cavities: "Yes, this clinical photograph shows visible signs of dental caries..."
  Answer if no cavities: "No, the teeth in this photograph appear clinically healthy..."

TYPE 2 — Clinical Description:
  Question: "Describe the oral health condition visible in this dental photograph."
  Answer: Describe based on cavity/normal regions detected

TYPE 3 — Severity Assessment:
  Question: "Assess the severity of dental issues visible in this image."
  Answer based on cavity count:
    0 cavities → "No visible issues"
    1-2 cavities → "Mild decay"
    3-5 cavities → "Moderate decay requiring multiple restorations"
    6+ cavities → "Severe decay requiring urgent comprehensive treatment"

TYPE 4 — Image Type Identification:
  Question: "What type of dental image is this, and what can you assess from it?"
  Answer: "This is a clinical photograph..."

TYPE 5 — Treatment Recommendation:
  Question: "Based on this clinical photograph, what follow-up would you recommend?"
  Answer: Based on severity — routine care / fillings / root canal / urgent referral
```

**Key rules for the new script**:
- NEVER use the words "X-ray", "radiograph", or "radiographic" anywhere
- Always call them "clinical photograph" or "dental photograph"
- Use `_parse_label_file()` (existing function) to get cavity/normal counts
- Use filename prefix (`healthy_teeth` vs `unhealthy_teeth`) as additional signal
- Use compositional answer generation (see section below) so no two answers are identical
- Each image gets 1-2 question-answer pairs (randomly chosen types)

**Expected output**: ~836 VQA pairs (418 images × 2 questions average)

---

### Dataset 2: OPG Classification (Improved)

**File to change**: `finetune/preprocessing/process_opg_classification.py`

**What the data actually is**: ~517 panoramic X-rays (OPG) in 6 class folders: Healthy Teeth (223), Caries (119), Impacted teeth (87), BDC-BDR (52), Infection (23), Fractured Teeth (13). Two dataset versions get deduplicated.

**What to change**:

1. **Delete `CLASS_ANSWERS` dict** — the static one-answer-per-class templates
2. **Add compositional answer generation** — same-class images get different answers
3. **Add more question types** — currently only has open-ended questions
4. **Generate 2-3 questions per image** (currently generates 1)

**New question types** (pick 2-3 randomly per image):

```
TYPE 1 — Open-Ended Diagnosis:
  Question: "Analyze this panoramic dental radiograph and describe your findings."
  Answer: Compositionally generated (see below)

TYPE 2 — Yes/No Pathology Screening:
  Question: "Does this OPG show signs of [specific condition]?"
  Answer: "Yes..." or "No, this OPG shows [actual condition] instead..."
  (Sometimes ask about the correct condition, sometimes ask about a wrong one)

TYPE 3 — Differential Diagnosis:
  Question: "What are the possible diagnoses for this panoramic X-ray?"
  Answer: List ground-truth as primary + 1-2 plausible alternatives

TYPE 4 — Clinical Urgency:
  Question: "How urgent is the condition shown in this dental X-ray?"
  Answer: Map condition to urgency level with reasoning:
    Healthy → routine follow-up
    Caries → moderate (schedule treatment)
    Infection → urgent (same-day/next-day evaluation)
    Fractured → emergency (immediate care)
    Impacted → elective (planned surgical consult)
    BDC-BDR → moderate to urgent

TYPE 5 — Healthy vs Abnormal Comparison:
  Question: "Is this a healthy or abnormal dental panoramic radiograph?"
  Answer: "healthy" or "abnormal" with reasoning
```

**Key rules**:
- Use compositional answer generation (see section below)
- Every answer must sound different even for same-class images
- Use varied clinical terminology (caries/decay/cavitation, radiolucency/dark area, etc.)

**Expected output**: ~1,300 VQA pairs (517 images × 2.5 questions average)

---

### Dataset 3: Dental Radiography — DROP

**File to change**: `finetune/preprocessing/process_dental_radiography.py`

**What the data actually is**: ~655 panoramic X-rays with NO labels at all. Every image currently gets the exact same `ANSWER` string.

**What to do**: **REMOVE this dataset from training entirely.**

**Why**:
- Zero labels = zero learnable signal
- Every image gets identical answer = teaches model to ignore image content
- This actively hurts training by rewarding copy-paste behavior

**Changes needed**:
- In `build_dataset.py`: Remove the call to `process_dental_radiography()` and its import
- The file `process_dental_radiography.py` can be kept but should not be called
- Remove the "3/5 — Dental Radiography Dataset" section from `_collect_vqa_samples()`

---

### Dataset 4: Panoramic Dental Xray (Improved)

**File to change**: `finetune/preprocessing/process_panoramic.py`

**What the data actually is**: ~64 panoramic X-rays in 2 parts:
- **Firstpart** (~107 images): VIA polygon annotations for tooth segmentation (tooth count)
- **Secondpart** (~60 images): COCO annotations with 8 tooth type classes

**What to change**:

1. **Stop asking counting questions** — "how many teeth?" is not clinically useful
2. **Ask about tooth types present**, dentition completeness, anatomical overview
3. **Generate 2 questions per image** (currently generates 1)

**New question types** (pick 2 randomly per image):

```
TYPE 1 — Tooth Type Identification (for secondpart only):
  Question: "What types of teeth are visible in this panoramic radiograph?"
  Answer: Use COCO tooth type annotations to describe morphology

TYPE 2 — Dentition Completeness:
  Question: "Assess the completeness of the dentition in this panoramic X-ray."
  Answer based on tooth count:
    28-32 teeth → "complete/near-complete adult dentition"
    15-27 teeth → "partial dentition with some missing teeth"
    <15 teeth → "significant tooth loss is evident"

TYPE 3 — Anatomical Overview:
  Question: "Describe the dental anatomy visible in this OPG."
  Answer: Tooth types + arch symmetry + bone levels + visible structures
```

**Key rules**:
- Don't ask "how many teeth?" as the primary question
- Focus on clinical significance, not raw numbers
- Include clinical context (why missing teeth matter, what tooth types indicate)

**Expected output**: ~128 VQA pairs (64 images × 2 questions)

---

### Dataset 5: OPG Object Detection (NEW)

**File to create**: `finetune/preprocessing/process_opg_detection.py`

**What the data actually is**: 232 original images + 604 augmented images with YOLO bounding box annotations for 6 pathology classes. Located at: `datasets/Dental OPG Xray Dataset/Dental OPG (Object Detection)/`

The YOLO annotation format per line: `class_id center_x center_y width height` (all normalized 0-1).

Classes (from data.yaml):
- 0: BDC-BDR
- 1: Caries
- 2: Fractured Teeth
- 3: Healthy Teeth
- 4: Impacted teeth
- 5: Infection

**What to build**:

A new preprocessing script that:
1. Reads YOLO bounding box annotations
2. Converts bounding box coordinates to anatomical region descriptions
3. Generates location-aware VQA pairs
4. Uses only original images (not augmented, to avoid data leakage)

**Location mapping** (convert YOLO normalized coordinates to dental regions):

```python
def get_dental_region(center_x: float, center_y: float) -> str:
    """Convert normalized bbox center to dental region description.
    
    OPG layout (patient's perspective — radiograph is mirrored):
      Left side of image = patient's RIGHT side
      Right side of image = patient's LEFT side
      Top half = maxilla (upper jaw)
      Bottom half = mandible (lower jaw)
    """
    # Horizontal: left third / center / right third
    if center_x < 0.33:
        horizontal = "right"    # Patient's right (left side of image)
    elif center_x < 0.67:
        horizontal = "anterior" # Front teeth area
    else:
        horizontal = "left"     # Patient's left (right side of image)
    
    # Vertical: upper jaw / lower jaw
    vertical = "maxillary" if center_y < 0.5 else "mandibular"
    
    return f"{horizontal} {vertical} region"
```

**New question types** (pick 2-3 randomly per image):

```
TYPE 1 — Localized Findings:
  Question: "Describe any pathological findings in this panoramic radiograph and their locations."
  Answer: Parse all bounding boxes, group by region, describe each finding with location.
  Example: "In the right mandibular region, there is evidence of dental caries. The left
            posterior area shows an impacted third molar. The anterior maxillary region
            appears healthy with intact tooth structure."

TYPE 2 — Condition Presence Yes/No:
  Question: "Are there any impacted teeth visible in this X-ray?"
  Answer: "Yes, in the [location]..." or "No, this radiograph does not show impacted teeth.
           The findings include [what IS actually present]..."

TYPE 3 — Structured Radiographic Report:
  Question: "Provide a radiographic report for this dental OPG."
  Answer: Structured report listing all annotated findings by region:
    "Radiographic Report:
     - Right posterior region: Caries detected in molar area
     - Left mandibular region: Impacted third molar
     - Anterior region: Healthy dentition
     - Overall: Multiple pathologies requiring clinical evaluation"

TYPE 4 — Region-Specific Query:
  Question: "What findings are present in the posterior regions of this panoramic X-ray?"
  Answer: Filter bounding boxes by location, describe only posterior findings
```

**Key rules**:
- Only use ORIGINAL images (not augmented) — deduplicate by taking images without augmentation suffixes
- Use `get_dental_region()` to convert every bounding box to a region description
- Group findings by region for multi-finding reports
- Use compositional answer generation for variety

**Expected output**: ~580 VQA pairs (232 images × 2.5 questions average)

---

### Compositional Answer Generation

This is the core technique to ensure answer diversity. Instead of static template strings, build answers by randomly combining sentence components.

**Create a new shared utility file**: `finetune/preprocessing/answer_builder.py`

```python
"""Compositional answer generation for diverse VQA training data."""
import random

# ─── INTRO SENTENCES ───
OPG_INTROS = [
    "This panoramic radiograph reveals",
    "Upon examination of this OPG,",
    "This dental X-ray demonstrates",
    "Radiographic assessment shows",
    "This panoramic dental radiograph displays",
    "Analysis of this orthopantomogram indicates",
    "This OPG examination reveals",
]

PHOTO_INTROS = [
    "This clinical photograph shows",
    "Upon visual examination,",
    "This dental photograph reveals",
    "Clinical assessment of this image shows",
    "This intraoral photograph demonstrates",
]

# ─── CONDITION-SPECIFIC FINDINGS ───
# Each condition has multiple varied descriptions
FINDINGS = {
    "caries": [
        "dental caries with visible areas of demineralization and cavitation",
        "tooth decay appearing as dark radiolucent areas suggesting enamel and dentin breakdown",
        "carious lesions indicating progressive tooth decay",
        "areas of dental decay with potential dentin involvement",
    ],
    "infection": [
        "periapical radiolucency suggesting abscess formation",
        "signs of dental infection with periapical pathology",
        "evidence of periapical infection requiring clinical attention",
        "radiolucent areas at the root apex consistent with periapical abscess",
    ],
    # ... similar lists for: healthy, impacted, bdc_bdr, fractured
}

# ─── CLINICAL CONTEXT ───
CONTEXTS = [
    "This finding is clinically significant as it may indicate {implication}.",
    "The extent of involvement suggests {severity_desc}.",
    "Clinical correlation with patient symptoms is recommended.",
    "The {structure} appears {condition_adj}, warranting further evaluation.",
]

# ─── RECOMMENDATIONS ───
RECOMMENDATIONS = [
    "Clinical correlation and further evaluation are recommended.",
    "Follow-up with periapical radiographs is advised.",
    "Referral to a specialist should be considered.",
    "Prompt clinical evaluation is warranted.",
    "A comprehensive treatment plan should be developed.",
]

def build_answer(condition: str, severity: str = "moderate",
                 location: str | None = None, rng: random.Random = None) -> str:
    """Build a compositionally varied answer.
    
    Args:
        condition: One of 'healthy', 'caries', 'infection', etc.
        severity: 'mild', 'moderate', 'severe'
        location: Optional region string like "right mandibular region"
        rng: Random instance for reproducibility
    
    Returns:
        A unique-sounding clinical answer string.
    """
    rng = rng or random.Random()
    
    intro = rng.choice(OPG_INTROS)
    finding = rng.choice(FINDINGS[condition])
    
    if location:
        finding = f"in the {location}, {finding}"
    
    context = rng.choice(CONTEXTS).format(
        implication="...",
        severity_desc=severity,
        structure="affected area",
        condition_adj="compromised"
    )
    recommendation = rng.choice(RECOMMENDATIONS)
    
    return f"{intro} {finding}. {context} {recommendation}"
```

**The key point**: With 7 intros × 4 findings × 4 contexts × 5 recommendations = **560 unique combinations** per condition. Same-class images will get different-sounding answers.

All preprocessing scripts should import and use this shared module.

---

### Build Dataset Changes

**File to change**: `finetune/preprocessing/build_dataset.py`

Changes needed:

1. **Remove** the import and call to `process_dental_radiography`
2. **Add** import and call to new `process_opg_detection` function
3. **Update** the progress numbering (was "1/5 to 4/5", becomes "1/4 to 4/4" for VQA sources)
4. **Update** dataset paths for OPG Object Detection

**Specific changes in `_collect_vqa_samples()`**:

```python
def _collect_vqa_samples() -> list[dict]:
    all_samples = []

    # 1. Clinical Photo Analysis (was Cavity Detection)
    print("1/4 — Clinical Photo Analysis (Dental Cavity Detection)")
    all_samples.extend(process_cavity_detection(cavity_path))

    # 2. OPG Classification (v1 + v4)
    print("2/4 — OPG Classification (v1 + v4)")
    all_samples.extend(process_opg_classification(opg_v1, opg_v4))

    # 3. Panoramic Dental Xray
    print("3/4 — Panoramic Dental Xray")
    all_samples.extend(process_panoramic(pano_path))

    # 4. OPG Object Detection (NEW)
    print("4/4 — OPG Object Detection (Localized Diagnosis)")
    all_samples.extend(process_opg_detection(opg_det_path))

    # NOTE: Dental Radiography REMOVED (no labels = no learning signal)
    
    return all_samples
```

---

### Training Changes

The training notebook/script itself needs minimal changes. The data format stays the same (image + messages JSON). Only the content of the messages changes.

- **Same HuggingFace Dataset format**: `image`, `messages`, `source`, `condition`
- **Same chat template**: system/user/assistant
- **Same system prompt**
- **Same training hyperparameters** (start with same settings, adjust if needed)
- **Same 90/10 train/validation split**

The only difference is the data quality — which is what this entire plan addresses.

**After retraining**: Push new model to HuggingFace as `naazimsnh02/dentalgemma-1.5-4b-it` (overwrite existing). Then redeploy on Modal with `modal deploy scripts/modal_dentalgemma.py`.

---

## 3. UI Update Plan

The frontend currently has 3 image analysis modes: `cavity`, `opg`, `general`. After retraining, we consolidate to 2 modes: `photo` (clinical photographs) and `xray` (any dental radiograph).

### Type System Changes

**File to change**: `dentalgemma-app/types/index.ts`

#### Change 1: Update `AnalysisType`

```typescript
// OLD (line 10):
export type AnalysisType = 'cavity' | 'opg' | 'tooth-id' | 'general';

// NEW:
export type AnalysisType = 'photo' | 'xray';
```

#### Change 2: Replace `CavityAnalysis` interface

```typescript
// OLD (lines 61-66):
export interface CavityAnalysis extends XRayAnalysisBase {
  type: 'cavity';
  cavityCount: '0' | '1' | '2' | '3+';
  classification: 'normal' | 'cavity';
  perToothConfidence?: Record<string, number>;
}

// NEW:
export interface PhotoAnalysis extends XRayAnalysisBase {
  type: 'photo';
  condition: 'healthy' | 'decay' | 'other';
  severity?: 'mild' | 'moderate' | 'severe';
}
```

#### Change 3: Replace `OPGAnalysis` and `GeneralAnalysis` with unified `XRayImageAnalysis`

```typescript
// OLD (lines 68-83):
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

// NEW:
export interface XRayImageAnalysis extends XRayAnalysisBase {
  type: 'xray';
  pathologyClass?: 'Healthy' | 'Caries' | 'Impacted' | 'BDC-BDR' | 'Infection' | 'Fractured';
  differentialDiagnosis?: string[];
}
```

#### Change 4: Update union type

```typescript
// OLD (line 85):
export type XRayAnalysis = CavityAnalysis | OPGAnalysis | ToothIDAnalysis | GeneralAnalysis;

// NEW:
export type XRayAnalysis = PhotoAnalysis | XRayImageAnalysis;
```

---

### Analysis Results Component

**File to change**: `dentalgemma-app/components/xray/analysis-results.tsx`

Replace the `renderTypeSpecificInfo()` switch statement to handle only 2 cases:

```tsx
const renderTypeSpecificInfo = () => {
  switch (analysis.type) {
    case 'photo':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Condition:
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
              analysis.condition === 'decay'
                ? 'bg-destructive text-destructive-foreground border-destructive'
                : analysis.condition === 'other'
                ? 'bg-orange-100 text-orange-800 border-orange-300'
                : 'bg-success text-success-foreground border-success'
            }`}>
              {analysis.condition === 'decay' ? 'Decay Detected' 
                : analysis.condition === 'other' ? 'Other Finding' 
                : 'Healthy'}
            </span>
          </div>
          {analysis.severity && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Severity:
              </span>
              <span className="text-sm font-medium text-foreground capitalize">
                {analysis.severity}
              </span>
            </div>
          )}
        </div>
      );

    case 'xray':
      return (
        <div className="space-y-2">
          {analysis.pathologyClass && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Primary Pathology:
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground border border-primary">
                {analysis.pathologyClass}
              </span>
            </div>
          )}
          {analysis.differentialDiagnosis && analysis.differentialDiagnosis.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Differential Diagnosis:
              </span>
              <ul className="mt-1 space-y-1">
                {analysis.differentialDiagnosis.map((dx, i) => (
                  <li key={i} className="text-sm text-foreground flex items-center gap-2">
                    <span className="text-muted-foreground">•</span> {dx}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
  }
};
```

Also update the "Analysis Type" display label (line 127):
```tsx
// OLD:
<p className="text-sm text-muted-foreground mt-1">
  Analysis Type: {analysis.type.toUpperCase()}
</p>

// NEW:
<p className="text-sm text-muted-foreground mt-1">
  Analysis Type: {analysis.type === 'photo' ? 'Clinical Photo' : 'X-Ray Analysis'}
</p>
```

---

### X-Ray Analysis Page

**File to change**: `dentalgemma-app/app/(dashboard)/xray-analysis/page.tsx`

#### Change 1: Update default analysis type (line 18)

```typescript
// OLD:
const [analysisType, setAnalysisType] = useState<AnalysisType>('general');

// NEW:
const [analysisType, setAnalysisType] = useState<AnalysisType>('xray');
```

#### Change 2: Update analysis type selector (lines 190-209)

Replace the 3 buttons with 2 buttons:

```tsx
{[
  { value: 'photo', label: 'Clinical Photo Analysis', desc: 'Analyze clinical photographs of teeth and gums' },
  { value: 'xray', label: 'X-Ray Analysis', desc: 'Analyze dental radiographs (OPG, bitewing, periapical)' },
].map((type) => (
  // ... same button rendering code
))}
```

#### Change 3: Update the training note (lines 225-231)

```tsx
<p className="text-sm text-amber-800 dark:text-amber-300">
  <strong>Note:</strong> Clinical Photo Analysis is designed for photographs of teeth and gums.
  X-Ray Analysis is designed for dental radiographs (panoramic, bitewing, periapical).
  For best results, match your image type to the appropriate analysis mode.
</p>
```

#### Change 4: Update history save summary (line 111)

```typescript
// OLD:
summary: `${analysis.type.toUpperCase()} Analysis - ${analysis.urgency} priority`,

// NEW:
summary: `${analysis.type === 'photo' ? 'Clinical Photo' : 'X-Ray'} Analysis - ${analysis.urgency} priority`,
```

---

### Sample Images Component

**File to change**: `dentalgemma-app/components/xray/sample-xrays.tsx`

#### Change 1: Update `SAMPLE_XRAYS` array

Relabel existing samples to use new 2-mode types:

```typescript
const SAMPLE_XRAYS: SampleXRay[] = [
  // Clinical Photos (was "cavity")
  {
    id: 'photo-1',
    name: 'Clinical Photo - Dental Assessment',
    description: 'Clinical photograph for cavity and decay detection',
    imageUrl: '/samples/cavity-sample.jpg',
    analysisType: 'photo',
    thumbnail: '/samples/cavity-sample.jpg',
  },
  {
    id: 'photo-2',
    name: 'Clinical Photo - Intraoral View',
    description: 'Intraoral photograph for oral health assessment',
    imageUrl: '/samples/cavity-sample-2.jpg',
    analysisType: 'photo',
    thumbnail: '/samples/cavity-sample-2.jpg',
  },
  {
    id: 'photo-3',
    name: 'Clinical Photo - Decay Patterns',
    description: 'Clinical photograph showing dental condition',
    imageUrl: '/samples/cavity-sample-3.jpg',
    analysisType: 'photo',
    thumbnail: '/samples/cavity-sample-3.jpg',
  },
  // X-Rays (was "opg" and "general")
  {
    id: 'xray-1',
    name: 'Panoramic X-Ray - Caries',
    description: 'Panoramic radiograph showing dental caries',
    imageUrl: '/samples/opg-caries.jpg',
    analysisType: 'xray',
    thumbnail: '/samples/opg-caries.jpg',
  },
  {
    id: 'xray-2',
    name: 'Panoramic X-Ray - Impacted Teeth',
    description: 'Panoramic radiograph showing impacted wisdom teeth',
    imageUrl: '/samples/opg-impacted.jpg',
    analysisType: 'xray',
    thumbnail: '/samples/opg-impacted.jpg',
  },
  {
    id: 'xray-3',
    name: 'Panoramic X-Ray - Infection',
    description: 'Panoramic radiograph showing dental infection',
    imageUrl: '/samples/opg-infection.jpg',
    analysisType: 'xray',
    thumbnail: '/samples/opg-infection.jpg',
  },
  {
    id: 'xray-4',
    name: 'Dental Radiograph - Intraoral',
    description: 'Intraoral radiograph for dental assessment',
    imageUrl: '/samples/general-sample.jpg',
    analysisType: 'xray',
    thumbnail: '/samples/general-sample.jpg',
  },
  {
    id: 'xray-5',
    name: 'Dental Radiograph - Bitewing',
    description: 'Bitewing radiograph for clinical evaluation',
    imageUrl: '/samples/general-sample-2.jpg',
    analysisType: 'xray',
    thumbnail: '/samples/general-sample-2.jpg',
  },
];
```

#### Change 2: Update label/color maps

```typescript
const analysisTypeLabels: Record<AnalysisType, string> = {
  photo: 'Clinical Photo',
  xray: 'X-Ray Analysis',
};

const analysisTypeColors: Record<AnalysisType, string> = {
  photo: 'bg-green-500 dark:bg-green-600 text-white border border-black',
  xray: 'bg-blue-500 dark:bg-blue-600 text-white border border-black',
};
```

---

### Modal Client Changes

**File to change**: `dentalgemma-app/lib/api/modal-client.ts`

#### Change 1: Update question prompts (lines 278-283)

Replace rigid JSON-demanding prompts with natural language prompts:

```typescript
const questions: Record<AnalysisType, string> = {
  photo: 'Analyze this clinical dental photograph. Describe the condition of the teeth and gums visible. Note any signs of decay, discoloration, or other abnormalities. Assess the severity and recommend follow-up actions.',
  xray: 'Analyze this dental radiograph. Describe any pathological findings and their locations. Provide your assessment of the condition, possible differential diagnoses, and clinical recommendations.',
};
```

#### Change 2: Update `createTypedAnalysisFromJSON()` (lines 570-608)

```typescript
private createTypedAnalysisFromJSON(
  type: AnalysisType,
  base: any,
  jsonData: any
): XRayAnalysis {
  switch (type) {
    case 'photo':
      return {
        ...base,
        type: 'photo',
        condition: this.extractPhotoCondition(jsonData, base.findings),
        severity: this.extractSeverity(jsonData, base.findings),
      };

    default: // 'xray'
      return {
        ...base,
        type: 'xray',
        pathologyClass: this.validateOPGClass(jsonData.pathologyClass) || undefined,
        differentialDiagnosis: Array.isArray(jsonData.differentialDiagnosis)
          ? jsonData.differentialDiagnosis
          : undefined,
      };
  }
}
```

#### Change 3: Add helper methods to extract condition/severity from narrative text

```typescript
private extractPhotoCondition(data: any, findings: string[]): 'healthy' | 'decay' | 'other' {
  const text = [data?.condition, ...findings].join(' ').toLowerCase();
  if (text.includes('decay') || text.includes('caries') || text.includes('cavity')) return 'decay';
  if (text.includes('healthy') || text.includes('normal') || text.includes('no abnormalities')) return 'healthy';
  return 'other';
}

private extractSeverity(data: any, findings: string[]): 'mild' | 'moderate' | 'severe' | undefined {
  const text = [data?.severity, ...findings].join(' ').toLowerCase();
  if (text.includes('severe')) return 'severe';
  if (text.includes('moderate')) return 'moderate';
  if (text.includes('mild')) return 'mild';
  return undefined;
}
```

#### Change 4: Remove old validator methods

Delete these methods that are no longer needed:
- `validateCavityCount()` (lines 610-616)
- `validateClassification()` (lines 618-623)

#### Change 5: Update `createTypedAnalysis()` fallback method

The fallback text-parsing method also needs updating to return `PhotoAnalysis` or `XRayImageAnalysis` instead of old types.

#### Change 6: Update `determineUrgency()` method

Change analysis type references from `'cavity'`/`'opg'`/`'general'` to `'photo'`/`'xray'`.

---

### Backend (Modal) Changes

**File to change**: `scripts/modal_dentalgemma.py`

#### Change 1: Update analysis type detection (lines 153-157)

```python
# OLD:
analysis_type = "general"
if "cavity" in question.lower() or "cavities" in question.lower():
    analysis_type = "cavity"
elif "opg" in question.lower() or "panoramic" in question.lower():
    analysis_type = "opg"

# NEW:
analysis_type = "xray"  # default
if "photograph" in question.lower() or "clinical photo" in question.lower():
    analysis_type = "photo"
```

#### Change 2: Replace `structured_prompts` dict (lines 160-262)

Replace the rigid JSON-demanding prompts with natural language prompts:

```python
structured_prompts = {
    "photo": (
        "Analyze this clinical dental photograph. "
        "Describe the visible condition of the teeth and gums. "
        "Note any signs of decay, discoloration, gum inflammation, or other abnormalities. "
        "Assess the overall oral health and severity of any issues found. "
        "Recommend appropriate follow-up actions."
    ),
    "xray": (
        "Analyze this dental radiograph in detail. "
        "Identify and describe any pathological findings and their approximate locations "
        "(e.g., left/right, upper/lower jaw, anterior/posterior). "
        "Provide your primary assessment, possible differential diagnoses, "
        "and clinical recommendations. "
        "Comment on the urgency of any findings."
    ),
}
```

#### Change 3: Update system prompt (line 272)

```python
# OLD:
"You are an expert dental clinician and radiologist AI assistant. When asked to provide JSON output, respond with ONLY the JSON object..."

# NEW:
"You are an expert dental clinician and radiologist AI assistant. Provide detailed, clinically accurate analyses using proper dental terminology. Structure your response with clear findings, assessment, and recommendations."
```

#### Change 4: Update JSON parsing fallback (lines 306-340)

Since we no longer demand JSON output, the backend should return the raw model text. The frontend will parse findings/recommendations from the narrative text (which it already does as a fallback in `extractFindings()` and `extractRecommendations()`).

Keep the existing `xray_result` JSON parsing as optional — if the model happens to output JSON, use it. Otherwise, return the raw analysis text.

---

## 4. File Change Summary

### Finetuning Files (in `finetune/preprocessing/`)

| File | Action | Description |
|------|--------|-------------|
| `process_cavity_detection.py` | **REWRITE** | Remove all "X-ray" mentions, add 5 question types, add compositional answers |
| `process_opg_classification.py` | **REWRITE** | Remove `CLASS_ANSWERS` dict, add 5 question types, add compositional answers |
| `process_dental_radiography.py` | **NO CHANGE** (but stop calling it) | Keep file but remove its call from `build_dataset.py` |
| `process_panoramic.py` | **MODIFY** | Replace counting questions with clinical questions, add 3 question types |
| `process_opg_detection.py` | **CREATE NEW** | New script: read YOLO annotations, map to regions, generate location-aware VQA |
| `answer_builder.py` | **CREATE NEW** | Shared compositional answer generation utility |
| `build_dataset.py` | **MODIFY** | Remove dental_radiography call, add opg_detection call, update numbering |

### Frontend Files (in `dentalgemma-app/`)

| File | Action | Description |
|------|--------|-------------|
| `types/index.ts` | **MODIFY** | Change `AnalysisType`, replace analysis interfaces (lines 10, 61-85) |
| `components/xray/analysis-results.tsx` | **MODIFY** | Replace `renderTypeSpecificInfo()` switch cases (lines 52-113) |
| `app/(dashboard)/xray-analysis/page.tsx` | **MODIFY** | Change type selector from 3→2 buttons, update default type (lines 18, 190-231) |
| `components/xray/sample-xrays.tsx` | **MODIFY** | Relabel samples from cavity/opg/general to photo/xray (lines 21-100) |
| `lib/api/modal-client.ts` | **MODIFY** | Update prompts, type handlers, remove old validators (lines 278-631) |

### Backend Files

| File | Action | Description |
|------|--------|-------------|
| `scripts/modal_dentalgemma.py` | **MODIFY** | Update analysis type detection, replace structured prompts, update system prompt (lines 153-272) |

### Documentation Files

| File | Action | Description |
|------|--------|-------------|
| `finetune/preprocessing/README_vqa.md` | **UPDATE** | Update sample counts, sources table, remove dental radiography |
| `finetune/model_card.md` | **UPDATE** | Update training data section, VQA sample count, capabilities table |

---

## 5. Implementation Order

### Phase 1: VQA Preprocessing Scripts (do first)

```
Step 1: Create finetune/preprocessing/answer_builder.py
        (shared compositional answer generation utility)

Step 2: Rewrite finetune/preprocessing/process_cavity_detection.py
        (clinical photos, correct terminology, diverse questions)

Step 3: Rewrite finetune/preprocessing/process_opg_classification.py
        (compositional answers, diverse questions)

Step 4: Modify finetune/preprocessing/process_panoramic.py
        (clinical questions instead of counting)

Step 5: Create finetune/preprocessing/process_opg_detection.py
        (new dataset: YOLO → region-aware VQA)

Step 6: Modify finetune/preprocessing/build_dataset.py
        (remove dental_radiography, add opg_detection)
```

### Phase 2: Generate Dataset & Retrain

```
Step 7: Run build_dataset.py to generate new VQA dataset
        Verify: ~2,800-3,000 pairs, high answer diversity

Step 8: Retrain VQA model using existing training notebook
        Monitor validation loss (target: < 0.025)

Step 9: Push retrained model to HuggingFace
        Redeploy on Modal: modal deploy scripts/modal_dentalgemma.py
```

### Phase 3: Frontend UI Updates (can start in parallel with Phase 2)

```
Step 10: Update dentalgemma-app/types/index.ts
         (AnalysisType + analysis interfaces)

Step 11: Update dentalgemma-app/components/xray/analysis-results.tsx
         (2-mode rendering)

Step 12: Update dentalgemma-app/app/(dashboard)/xray-analysis/page.tsx
         (2-mode selector)

Step 13: Update dentalgemma-app/components/xray/sample-xrays.tsx
         (relabel samples)

Step 14: Update dentalgemma-app/lib/api/modal-client.ts
         (new prompts, type handlers)
```

### Phase 4: Backend + Docs

```
Step 15: Update scripts/modal_dentalgemma.py
         (natural language prompts, type detection)

Step 16: Update finetune/preprocessing/README_vqa.md
Step 17: Update finetune/model_card.md
```

### Phase 5: Verify Everything Works

```
Step 18: Run npm run build (check for TypeScript errors)
Step 19: Run npm test (check for test failures)  
Step 20: Test end-to-end: upload photo → get "photo" analysis
Step 21: Test end-to-end: upload X-ray → get "xray" analysis
Step 22: Verify sample images work with new types
```

---

## Expected Outcome

| Metric | VQA v1 (current) | VQA v2 (planned) |
|--------|------------------|-------------------|
| Total VQA pairs | ~1,654 | ~2,844 |
| Unique answer templates | ~15 | ~2,000+ |
| Correct image terminology | ❌ | ✅ |
| Location-aware diagnosis | ❌ | ✅ |
| Clinical reasoning variety | Low | High |
| Datasets with zero learning | 1 (Radiography) | 0 |
| UI analysis modes | 3 (cavity/opg/general) | 2 (photo/xray) |
| Backend prompt style | Rigid JSON schemas | Natural language |
