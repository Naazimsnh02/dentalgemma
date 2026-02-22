# Symptom Checker AI Usage Analysis

I have analyzed how the AI is currently being used in the Symptom Checker (`app/api/symptom-check/route.ts`) compared to the training data. 

## Will it work well?
**Short Answer:** No, it will likely suffer from the exact same issues as the Clinical Assessment (hallucinations, outputting literal placeholders like `[Condition name]`, and formatting errors).

## Detailed Breakdown

### 1. The Inference Prompt (What we are asking)
The symptom checker uses the following prompt structure:
```text
You are a dental AI assistant. A patient has reported the following symptoms:
Location: ...
Pain Type: ...
Duration: ...

Provide a concise analysis with these sections (use exact headers):
**1. Possible Dental Conditions:**
1. [Condition name] - [XX]%
2. [Condition name] - [XX]%

**2. Urgency Classification:** [emergency/urgent/routine/home-care]
...
```

### 2. The Training Data (What the model knows)
The model was fine-tuned on the `Wildstashdental 2.5k-instruct` dataset. In this dataset, there is **no training data** for the requested symptom checker format. 

Instead, all clinical cases were trained using this exact input format:
```text
Please evaluate this dental patient:

PATIENT: [Condition]
AGE: [Age]
SEX: [Gender]
...
CHIEF COMPLAINT: ...
HISTORY: ...
CLINICAL FINDINGS: ...
```

And the model was trained to *always* reply with this exact markdown format:
```markdown
## Patient Assessment
**Diagnosis:** ...
**Etiology:** ...
**Urgency:** ...
## Management Plan
...
```

### 3. Key Issues Identified

1. **Template Hallucination**: The prompt asks the model to fill in a template (`[Condition name] - [XX]%`). Because the model wasn't trained on this template format, it will often literally print `[Condition name]` instead of replacing it with a real diagnosis.
2. **Probability Percentages**: The prompt asks for percentage likelihoods (`[XX]%`). The model was **never trained** to assign numerical probabilities to diagnoses. It was trained to provide a single, definitive primary diagnosis. Forcing it to invent percentages will lead to highly unpredictable behavior.
3. **Format Mismatch**: The prompt forces the model to use headers like `**1. Possible Dental Conditions:**`, but the model's muscle memory strongly wants to output `## Patient Assessment`. This conflict causes the model to generate malformed text that breaks the Next.js regex parser.

## Recommended Solution

To fix the Symptom Checker, we need to adapt it using the same philosophy we used for the Clinical Assessment: **Let the model output the Markdown format it was trained on, and parse that Markdown on the backend.**

### Step 1: Align the Prompt
Change `buildSymptomPrompt` to map the symptom data into the training data's "Patient Evaluation" format:
```text
Please evaluate this dental patient:

CHIEF COMPLAINT: Patient reporting dental symptoms.
HISTORY: Location: {location}. Pain Type: {painType}. Duration: {duration}. Triggers: {triggers}. Associated Symptoms: {associatedSymptoms}.
MEDICAL HISTORY: {medicalHistory}
CLINICAL FINDINGS: Not clinically evaluated yet (patient-reported symptoms only).

What is your diagnosis and treatment plan?
```

### Step 2: Update the Parser
Update the `parseModelResponse` function to read the standard Markdown sections the model will naturally output:
- Read `**Diagnosis:**` as the primary condition.
- Read `**Urgency:**` (e.g., "Urgent (2)") and map it to `urgent`, `emergency`, etc.
- Read the `## Management Plan` and map it to `actionGuidance`.
- Read the `## Patient Counseling` and map it to `homeCareRecommendations` and `redFlags`.

### Limitation regarding "Differentials"
The UI currently expects 3 possible conditions with percentage likelihoods. Since the model is trained to provide a single `**Diagnosis:**`, we have two options:
1. **Change the UI** to show a single primary diagnosis instead of 3 differential percentages.
2. **Prompt Hack**: Add a line to the prompt: *"Under the Diagnosis section, please list the primary diagnosis followed by two differential diagnoses."* The model is smart enough to accommodate slight variations, but asking for *percentages* should be avoided entirely.
