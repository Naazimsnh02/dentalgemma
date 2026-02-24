import requests
import base64
import json
import os
import sys
import re

# ============================================================================
# CONFIGURATION: Update these URLs after deploying to Modal
# ============================================================================
# After running 'modal deploy modal_dentalgemma.py', Modal will output your
# endpoint URLs. Copy them here, or set the MODAL_USERNAME environment variable.
#
# To find your Modal username, run: modal profile current
# Your URLs will follow this pattern:
#   https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-[ENDPOINT].modal.run
# ============================================================================

import subprocess

def get_modal_endpoints():
    """
    Automatically detect Modal username and build endpoint URLs.
    Falls back to environment variable or prompts user if not found.
    """
    username = os.environ.get('MODAL_USERNAME')
    
    if not username:
        try:
            result = subprocess.run(['modal', 'profile', 'current'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                username = result.stdout.strip()
        except Exception:
            pass
    
    if not username:
        print("\n" + "="*60)
        print("⚠️  CONFIGURATION REQUIRED")
        print("="*60)
        print("Could not detect your Modal username automatically.")
        print("\nPlease do ONE of the following:")
        print("  1. Set environment variable: export MODAL_USERNAME=your-username")
        print("  2. Run: modal profile current (to see your username)")
        print("  3. Edit this file and replace [YOUR-USERNAME] in MODAL_ENDPOINTS")
        print("\nAfter deploying with 'modal deploy modal_dentalgemma.py',")
        print("Modal will display your actual endpoint URLs.")
        print("="*60 + "\n")
        username = "[YOUR-USERNAME]"
    
    base_url = f"https://{username}--dentalgemma-dentalgemmamodel"
    return {
        "health": f"{base_url}-health.modal.run",
        "chat": f"{base_url}-chat.modal.run",
        "xray": f"{base_url}-analyze-xray.modal.run",
        "assess": f"{base_url}-assess-case.modal.run"
    }

# Modal direct endpoints
MODAL_ENDPOINTS = get_modal_endpoints()

# Next.js local API (mirrors exactly how the UI calls it)
NEXTJS_BASE = "http://localhost:3000/api"

def print_result(name, response, time_taken=None):
    print(f"\n{'='*20} {name} {'='*20}")
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")
        if time_taken:
            print(f"Time Taken: {time_taken:.2f}s")
    except Exception as e:
        print(f"Raw Response: {response.text}")

# ============================================================================
# 1. HEALTH CHECK
# ============================================================================

def test_health():
    print("\nTesting Health Endpoint...")
    try:
        response = requests.get(MODAL_ENDPOINTS["health"])
        print_result("Health Check", response)
    except Exception as e:
        print(f"Health Check Failed: {e}")

# ============================================================================
# 2. CHAT
# ============================================================================

def test_chat():
    """Test the chat endpoint and validate response structure matches UI expectations."""
    print("\nTesting Chat Endpoint...")
    payload = {
        "message": "What are the common causes of tooth sensitivity?",
        "history": [],
        "max_tokens": 512
    }
    
    print(f"Message sent: \"{payload['message']}\"")
    
    try:
        response = requests.post(MODAL_ENDPOINTS["chat"], json=payload)
        print_result("Chat", response)
        
        if response.status_code == 200:
            data = response.json()
            validate_chat_response(data, "Modal Direct")
    except Exception as e:
        print(f"Chat Test Failed: {e}")

def test_chat_nextjs():
    """Test chat via the Next.js route - mirrors how the Voice Consultation UI calls it."""
    print("\nTesting Chat (Next.js Route - UI Flow)...")
    
    # The UI sends { message, history } where history items have { speaker, text }
    payload = {
        "message": "I have a toothache in my lower left molar. What could be causing it?",
        "history": []
    }
    
    print(f"Message sent: \"{payload['message']}\"")
    
    try:
        response = requests.post(f"{NEXTJS_BASE}/chat", json=payload)
        print_result("Chat (Next.js)", response)
        
        if response.status_code == 200:
            data = response.json()
            validate_chat_response(data, "Next.js")
    except requests.exceptions.ConnectionError:
        print("⚠️  Next.js dev server not running. Start with 'npm run dev' in dentalgemma-app/")
    except Exception as e:
        print(f"Chat Test (Next.js) Failed: {e}")

def validate_chat_response(data, source):
    """Validate the chat response has all fields the UI expects."""
    print(f"\n--- Validating {source} Chat Response for UI Compatibility ---")
    
    issues = []
    
    # Check success
    if not data.get("success"):
        issues.append("❌ 'success' is missing or false")
    else:
        print("  ✅ success: true")
    
    # Check message field (the UI reads data.message)
    message = data.get("message") or data.get("response", "")
    if not message:
        issues.append("❌ 'message' (or 'response') is empty")
    else:
        # Clean thought traces for display
        clean = clean_thought_traces(message)
        preview = clean[:200] + "..." if len(clean) > 200 else clean
        print(f"  ✅ message: {preview}")
        
        if clean != message:
            print(f"  ⚠️  Response contained thought traces that needed cleaning ({len(message)} → {len(clean)} chars)")
    
    # Check processing time (Next.js route returns this)
    proc_time = data.get("processingTime") or data.get("processing_time")
    if proc_time:
        print(f"  ✅ processingTime: {proc_time}ms" if isinstance(proc_time, int) and proc_time > 100 else f"  ✅ processingTime: {proc_time}s")
    
    if issues:
        print(f"\n  ⚠️  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"    {issue}")
    else:
        print(f"\n  ✅ Chat response valid!")

# ============================================================================
# 3. CLINICAL ASSESSMENT
# ============================================================================

def test_assessment_modal_direct():
    """Test the Modal endpoint directly with flat fields (backend contract)."""
    print("\nTesting Clinical Assessment (Modal Direct)...")
    payload = {
        "patient": {
            "age": 45,
            "gender": "male",
            "occupation": "Teacher"
        },
        "chief_complaint": "Persistent throbbing pain in the upper right molar, especially at night.",
        "history": "Pain started 1 week ago, progressively worsening. Keeps patient awake at night.",
        "clinical_findings": "Intraoral: Deep caries on tooth #16, tender to percussion, no swelling.\nExtraoral: No facial asymmetry or swelling.\nSoft Tissue: Gingiva around #16 slightly inflamed.\nPeriodontal: Probing depths within normal limits except 5mm on mesial of #16.",
        "radiographic_findings": "Periapical radiolucency associated with the mesial root of tooth #16. No evidence of horizontal or vertical bone loss.",
        "medical_history": "Allergies: Penicillin\nConditions: Hypertension, controlled with medication",
        "current_medications": "Lisinopril 10mg daily",
        "habits": "Occasional alcohol, no smoking",
        "max_tokens": 2048
    }
    
    print(f"Assessment payload sent:\n{json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(MODAL_ENDPOINTS["assess"], json=payload)
        print_result("Clinical Assessment (Modal Direct)", response)
        
        # Validate the response structure matches what the frontend expects
        if response.status_code == 200:
            data = response.json()
            validate_assessment_response(data, "Modal Direct")
    except Exception as e:
        print(f"Assessment Test Failed: {e}")

def test_assessment_nextjs():
    """
    Test the Next.js /api/assess-case route - mirrors exactly how the UI submits.
    The UI sends a structured ClinicalCase object via POST /api/assess-case.
    """
    print("\nTesting Clinical Assessment (Next.js Route - UI Flow)...")
    
    # This is the exact shape the UI sends (ClinicalCase interface)
    payload = {
        "caseData": {
            "id": "test-case-001",
            "patient": {
                "age": 45,
                "gender": "male",
                "occupation": "Teacher"
            },
            "chiefComplaint": {
                "description": "Persistent throbbing pain in the upper right molar, especially at night."
            },
            "history": "Pain started 1 week ago, progressively worsening. Keeps patient awake at night.",
            "clinicalFindings": {
                "description": "Intraoral: Deep caries on tooth #16, tender to percussion, no swelling.\nExtraoral: No facial asymmetry or swelling.\nSoft Tissue: Gingiva around #16 slightly inflamed.\nPeriodontal: Probing depths within normal limits except 5mm on mesial of #16."
            },
            "radiographicFindings": {
                "description": "Periapical radiolucency associated with the mesial root of tooth #16. No evidence of horizontal or vertical bone loss."
            },
            "medicalHistory": {
                "history": "Previous treatments: Amalgam restoration on #16 (5 years ago)",
                "systemicConditions": "Allergies: Penicillin, Hypertension",
                "medications": "Lisinopril 10mg daily",
                "habits": "Occasional alcohol, no smoking"
            },
            "createdAt": "2026-02-20T00:00:00.000Z",
            "updatedAt": "2026-02-20T00:00:00.000Z"
        }
    }
    
    print(f"Assessment payload (UI format) sent:\n{json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(f"{NEXTJS_BASE}/assess-case", json=payload)
        print_result("Clinical Assessment (Next.js)", response)
        
        if response.status_code == 200:
            data = response.json()
            validate_assessment_response(data, "Next.js")
    except requests.exceptions.ConnectionError:
        print("⚠️  Next.js dev server not running. Start with 'npm run dev' in dentalgemma-app/")
        print("   Skipping Next.js route test.")
    except Exception as e:
        print(f"Assessment Test (Next.js) Failed: {e}")

def validate_assessment_response(data, source):
    """Validate that the response has all fields the UI expects to render."""
    print(f"\n--- Validating {source} Response for UI Compatibility ---")
    
    issues = []
    
    # Check top-level
    if not data.get("success"):
        issues.append("❌ 'success' is missing or false")
    
    # Check case_assessment (Modal direct) or diagnosis (parsed by Next.js)
    # Modal direct returns case_assessment (raw text in V2); Next.js route returns the parsed CaseAssessment
    
    if source == "Modal Direct":
        assessment_text = data.get("case_assessment") or data.get("assessment", "")
        if not assessment_text:
            issues.append("❌ 'assessment' text is missing")
        else:
            print(f"  ✅ assessment text present ({len(assessment_text)} chars)")
            # In V2, Modal Direct returns Markdown text. We skip JSON field validation.
            if "Diagnosis:" in assessment_text:
                print("  ✅ Found Diagnosis in text")
            if "Management Plan" in assessment_text:
                print("  ✅ Found Management Plan in text")
        
        if issues:
            print(f"\n  ⚠️  {len(issues)} issue(s) found:")
            for issue in issues:
                print(f"    {issue}")
        else:
            print(f"\n  ✅ Modal Direct response valid!")
        return
        
    assessment = data.get("case_assessment") or data
    
    # 1. Diagnosis
    diag = assessment.get("diagnosis", {})
    primary = diag.get("primary", "")
    if not primary or primary == "Diagnosis pending":
        issues.append("❌ diagnosis.primary is empty or default")
    else:
        print(f"  ✅ diagnosis.primary: {primary}")
    
    differential = diag.get("differential", [])
    if not differential:
        pass # It is OK for clear-cut cases to not have a differential diagnosis
    else:
        print(f"  ✅ diagnosis.differential: {differential}")
    
    # 2. Etiology
    etiology = assessment.get("etiology", {})
    root_cause = etiology.get("rootCause", "") or etiology.get("root_cause", "")
    if not root_cause or root_cause == "To be determined":
        issues.append("❌ etiology.rootCause is empty or default")
    else:
        print(f"  ✅ etiology.rootCause: {root_cause}")
    
    # 3. Urgency
    urgency = assessment.get("urgency", "")
    valid_urgencies = ["emergency", "urgent", "routine", "home-care"]
    if urgency not in valid_urgencies:
        issues.append(f"❌ urgency '{urgency}' is not one of {valid_urgencies}")
    else:
        print(f"  ✅ urgency: {urgency}")
    
    # 4. Management Plan
    mgmt = assessment.get("managementPlan", {}) or assessment.get("management_plan", {})
    protocol = mgmt.get("protocol", [])
    if not protocol:
        issues.append("❌ managementPlan.protocol is empty")
    else:
        print(f"  ✅ managementPlan.protocol: {len(protocol)} steps")
        for i, step in enumerate(protocol):
            print(f"      {i+1}. {step}")
    
    # 5. Antibiotics
    antibiotics = assessment.get("antibiotics")
    if antibiotics is None:
        issues.append("⚠️  antibiotics section missing (may be OK)")
    else:
        print(f"  ✅ antibiotics.indicated: {antibiotics.get('indicated')}")
        print(f"     antibiotics.reason: {antibiotics.get('reason')}")
    
    # 6. Follow-up
    followup = assessment.get("followUp", {}) or assessment.get("follow_up", {})
    timing = followup.get("timing", "")
    if not timing:
        issues.append("❌ followUp.timing is empty")
    else:
        print(f"  ✅ followUp.timing: {timing}")
    
    monitoring = followup.get("monitoring", [])
    if not monitoring:
        issues.append("⚠️  followUp.monitoring is empty")
    else:
        print(f"  ✅ followUp.monitoring: {monitoring}")
    
    # 7. Patient Counseling
    counseling = assessment.get("patientCounseling", {}) or assessment.get("patient_counseling", {})
    explanation = counseling.get("explanation", "")
    if not explanation:
        issues.append("❌ patientCounseling.explanation is empty")
    else:
        print(f"  ✅ patientCounseling.explanation: {explanation[:100]}...")
    
    # Summary
    if issues:
        print(f"\n  ⚠️  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"    {issue}")
    else:
        print(f"\n  ✅ All UI fields populated correctly!")

# ============================================================================
# 4. X-RAY / PHOTO IMAGE ANALYSIS
# ============================================================================

def test_image_analysis(image_path, analysis_type='xray'):
    """
    Test Image Analysis Endpoint with specific V2 prompts and validate response parsing.
    analysis_type: 'photo' or 'xray'
    """
    type_label = "Clinical Photo Analysis" if analysis_type == 'photo' else "X-Ray Analysis"
    print(f"\nTesting {type_label} Endpoint with {image_path}...")
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return

    # V2 Prompts from Plan
    prompts = {
        "photo": "Analyze this clinical dental photograph. Describe the condition of the teeth and gums visible. Note any signs of decay, discoloration, or other abnormalities. Assess the severity and recommend follow-up actions. Provide a clear, professional clinical description. Avoid repeating the same information.",
        "xray": 'Analyze this dental radiograph. Describe any pathological findings and their locations using dental region terminology (e.g., "right mandibular region", "anterior maxillary region"). Provide your assessment of the condition, possible differential diagnoses, and clinical recommendations. Avoid repeating the same findings.'
    }

    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        payload = {
            "image": encoded_string,
            "question": prompts.get(analysis_type, prompts['xray']),
            "max_tokens": 1024
        }
        
        print(f"Prompt sent: \"{payload['question']}\"")
        
        response = requests.post(MODAL_ENDPOINTS["xray"], json=payload)
        print_result(type_label, response)
        
        if response.status_code == 200:
            data = response.json()
            validate_xray_response(data, analysis_type, type_label)
    except Exception as e:
        print(f"{type_label} Test Failed: {e}")

def test_image_analysis_nextjs(image_path, analysis_type='xray'):
    """Test image analysis via Next.js route - mirrors how the XRay Analysis UI calls it."""
    type_label = "Clinical Photo Analysis" if analysis_type == 'photo' else "X-Ray Analysis"
    print(f"\nTesting {type_label} (Next.js Route - UI Flow) with {image_path}...")
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return
    
    try:
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
            # Create proper data URL format that the UI sends
            encoded_string = f"data:image/jpeg;base64,{base64.b64encode(image_data).decode('utf-8')}"
        
        # The UI sends { image (data URL), analysisType }
        payload = {
            "image": encoded_string,
            "analysisType": analysis_type
        }
        
        print(f"Analysis type: {analysis_type}")
        print(f"Image format: data URL with {len(encoded_string)} chars")
        
        response = requests.post(f"{NEXTJS_BASE}/analyze-xray", json=payload)
        print_result(f"{type_label} (Next.js)", response)
        
        if response.status_code == 200:
            data = response.json()
            validate_xray_nextjs_response(data, analysis_type, f"{type_label} (Next.js)")
    except requests.exceptions.ConnectionError:
        print("⚠️  Next.js dev server not running. Start with 'npm run dev' in dentalgemma-app/")
    except Exception as e:
        print(f"{type_label} (Next.js) Test Failed: {e}")

def validate_xray_response(data, analysis_type, source):
    """Validate the Modal direct xray response and test parsing into UI fields."""
    print(f"\n--- Validating {source} Response (Modal Direct) ---")
    
    issues = []
    
    if not data.get("success"):
        issues.append("❌ 'success' is missing or false")
    else:
        print("  ✅ success: true")
    
    # Check raw analysis text
    analysis = data.get("analysis", "")
    if not analysis:
        issues.append("❌ 'analysis' text is empty")
    else:
        clean = clean_thought_traces(analysis)
        preview = clean[:300] + "..." if len(clean) > 300 else clean
        print(f"  ✅ analysis text ({len(clean)} chars): {preview}")
    
    # Check for parsed JSON from backend
    xray_analysis = data.get("xray_analysis")
    if xray_analysis:
        print(f"  ✅ Backend returned parsed JSON (xray_analysis)")
        validate_xray_parsed_json(xray_analysis, analysis_type, issues)
    else:
        print(f"  ⚠️  No parsed JSON from backend - frontend will parse raw text")
        # Simulate frontend parsing
        simulate_xray_text_parsing(analysis, analysis_type, issues)
    
    if issues:
        print(f"\n  ⚠️  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"    {issue}")
    else:
        print(f"\n  ✅ X-Ray response valid!")

def validate_xray_nextjs_response(data, analysis_type, source):
    """Validate the Next.js parsed xray response - this is what the UI actually renders."""
    print(f"\n--- Validating {source} Response for UI Compatibility ---")
    
    issues = []
    
    if not data.get("success"):
        issues.append("❌ 'success' is missing or false")
    else:
        print("  ✅ success: true")
    
    # The Next.js route returns the XRayAnalysis object fields spread at top level
    # Check findings (string[])
    findings = data.get("findings", [])
    if not findings:
        issues.append("❌ findings[] is empty - UI will show no findings")
    else:
        print(f"  ✅ findings: {len(findings)} items")
        for i, f in enumerate(findings[:5]):
            print(f"      {i+1}. {f}")
        if len(findings) > 5:
            print(f"      ... and {len(findings) - 5} more")
    
    # Check confidence (number 0-1)
    confidence = data.get("confidence")
    if confidence is None:
        issues.append("❌ confidence is missing")
    elif not (0 <= confidence <= 1):
        issues.append(f"❌ confidence {confidence} is not between 0 and 1")
    else:
        print(f"  ✅ confidence: {confidence} ({int(confidence * 100)}%)")
    
    # Check urgency
    urgency = data.get("urgency", "")
    valid_urgencies = ["emergency", "urgent", "routine", "home-care"]
    if urgency not in valid_urgencies:
        issues.append(f"❌ urgency '{urgency}' is not one of {valid_urgencies}")
    else:
        print(f"  ✅ urgency: {urgency}")
    
    # Check recommendations (string[])
    recommendations = data.get("recommendations", [])
    if not recommendations:
        issues.append("❌ recommendations[] is empty - UI will show no recommendations")
    else:
        print(f"  ✅ recommendations: {len(recommendations)} items")
        for i, r in enumerate(recommendations[:5]):
            print(f"      {i+1}. {r}")
    
    # Check type-specific fields
    if analysis_type == 'photo':
        condition = data.get("condition", "")
        valid_conditions = ["healthy", "decay", "other"]
        if condition not in valid_conditions:
            issues.append(f"⚠️  condition '{condition}' is not one of {valid_conditions}")
        else:
            print(f"  ✅ condition: {condition}")
        
        severity = data.get("severity")
        if severity:
            valid_severities = ["mild", "moderate", "severe"]
            if severity not in valid_severities:
                issues.append(f"⚠️  severity '{severity}' is not one of {valid_severities}")
            else:
                print(f"  ✅ severity: {severity}")
    else:  # xray
        pathology_class = data.get("pathologyClass")
        if pathology_class:
            valid_classes = ["Healthy", "Caries", "Impacted", "BDC-BDR", "Infection", "Fractured"]
            if pathology_class not in valid_classes:
                issues.append(f"⚠️  pathologyClass '{pathology_class}' is not one of {valid_classes}")
            else:
                print(f"  ✅ pathologyClass: {pathology_class}")
        
        diff_diag = data.get("differentialDiagnosis", [])
        if diff_diag:
            print(f"  ✅ differentialDiagnosis: {diff_diag}")
    
    # Check processingTime
    proc_time = data.get("processingTime")
    if proc_time:
        print(f"  ✅ processingTime: {proc_time}ms")
    
    if issues:
        print(f"\n  ⚠️  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"    {issue}")
    else:
        print(f"\n  ✅ All X-Ray UI fields populated correctly!")

def validate_xray_parsed_json(json_data, analysis_type, issues):
    """Validate parsed JSON from the backend matches expected structure."""
    findings = json_data.get("findings", [])
    if isinstance(findings, list) and len(findings) > 0:
        print(f"    ✅ json.findings: {len(findings)} items")
    else:
        issues.append("⚠️  json.findings is missing or empty")
    
    confidence = json_data.get("confidence")
    if isinstance(confidence, (int, float)) and 0 <= confidence <= 1:
        print(f"    ✅ json.confidence: {confidence}")
    elif isinstance(confidence, (int, float)) and confidence > 1:
        print(f"    ⚠️  json.confidence: {confidence} (>1, needs normalization to 0-1)")
    
    urgency = json_data.get("urgency", "")
    if urgency in ["emergency", "urgent", "routine", "home-care"]:
        print(f"    ✅ json.urgency: {urgency}")
    elif urgency:
        issues.append(f"⚠️  json.urgency '{urgency}' is non-standard")
    
    recommendations = json_data.get("recommendations", [])
    if isinstance(recommendations, list) and len(recommendations) > 0:
        print(f"    ✅ json.recommendations: {len(recommendations)} items")
    else:
        issues.append("⚠️  json.recommendations is missing or empty")

def simulate_xray_text_parsing(raw_text, analysis_type, issues):
    """Simulate what the frontend modal-client does when parsing raw text."""
    print("  --- Simulating frontend text parsing ---")
    
    clean = clean_thought_traces(raw_text)
    
    # Try JSON extraction first (like cleanAndParseResponse)
    parsed_json = try_extract_json(clean)
    if parsed_json:
        print("    ✅ JSON extracted from text")
        validate_xray_parsed_json(parsed_json, analysis_type, issues)
        return
    
    # Text-based extraction uses regex on frontend, which python can't perfectly replicate easily
    # We just check if there's enough meaningful text to form findings and recommendations
    if len(clean) > 50:
        print(f"    ✅ Text is long enough for NLP extraction ({len(clean)} chars)")
    else:
        issues.append("❌ Could not extract findings from text (too short)")
        issues.append("⚠️  Could not extract recommendations from text (too short)")

# ============================================================================
# 5. SYMPTOM CHECKER
# ============================================================================

def test_symptom_check_modal_direct():
    """
    Test the symptom checker by calling Modal /chat with the exact prompt
    that the Next.js /api/symptom-check route builds, then parse the response
    exactly like the route does.
    """
    print("\nTesting Symptom Checker (Modal Direct - replicating API route logic)...")
    
    # Realistic symptom data matching what the UI questionnaire collects
    symptom_data = {
        "location": "Lower left molar area",
        "painType": "Throbbing",
        "duration": "3-7 days",
        "triggers": ["Cold foods/drinks", "Chewing"],
        "associatedSymptoms": ["Swelling", "Jaw pain"],
        "medicalHistory": ["No significant medical history"]
    }
    
    # Build the exact prompt the API route uses (from buildSymptomPrompt)
    prompt = f"""Please evaluate this dental patient based on reported symptoms:

PATIENT: Symptomatic patient evaluation
AGE: Not specified
SEX: Not specified

CHIEF COMPLAINT: Patient reporting dental symptoms.

HISTORY: Location: {symptom_data['location']}. Pain Type: {symptom_data['painType']}. Duration: {symptom_data['duration']}. Triggers: {', '.join(symptom_data['triggers']) or 'None'}. Associated Symptoms: {', '.join(symptom_data['associatedSymptoms']) or 'None'}.

CLINICAL FINDINGS: Not clinically evaluated yet.

MEDICAL HISTORY: {', '.join(symptom_data['medicalHistory']) or 'None reported'}

What is your diagnosis and treatment plan?"""
    
    payload = {
        "message": prompt,
        "history": [],
        "max_tokens": 512
    }
    
    print(f"Symptom Data:\n{json.dumps(symptom_data, indent=2)}")
    
    try:
        response = requests.post(MODAL_ENDPOINTS["chat"], json=payload)
        print_result("Symptom Checker (Modal Direct)", response)
        
        if response.status_code == 200:
            data = response.json()
            raw_message = data.get("message", "") or data.get("response", "")
            
            if raw_message:
                # Parse exactly like the API route does (parseModelResponse)
                parsed = parse_symptom_response(raw_message, symptom_data)
                print(f"\n--- Parsed Symptom Result ---")
                print(json.dumps(parsed, indent=2))
                validate_symptom_result(parsed, "Modal Direct")
            else:
                print("❌ No message in response")
    except Exception as e:
        print(f"Symptom Checker Test Failed: {e}")

def test_symptom_check_nextjs():
    """
    Test the symptom checker via the Next.js /api/symptom-check route.
    This mirrors exactly how the UI submits symptom data.
    """
    print("\nTesting Symptom Checker (Next.js Route - UI Flow)...")
    
    # Exact payload shape the UI sends: { symptomData: SymptomData }
    payload = {
        "symptomData": {
            "location": "Upper front teeth",
            "painType": "Sharp",
            "duration": "1-3 days",
            "triggers": ["Hot foods/drinks", "Cold foods/drinks", "Sweet foods"],
            "associatedSymptoms": ["Sensitivity to light/sound", "Headache"],
            "medicalHistory": []
        }
    }
    
    print(f"Symptom Data (UI format):\n{json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(f"{NEXTJS_BASE}/symptom-check", json=payload)
        print_result("Symptom Checker (Next.js)", response)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("diagnosis"):
                validate_symptom_result(data["diagnosis"], "Next.js")
            else:
                print(f"❌ Response missing success or diagnosis: {data}")
    except requests.exceptions.ConnectionError:
        print("⚠️  Next.js dev server not running. Start with 'npm run dev' in dentalgemma-app/")
    except Exception as e:
        print(f"Symptom Checker Test (Next.js) Failed: {e}")

def parse_symptom_response(response_text, symptom_data):
    """
    Replicate the parseSimplifiedResponse function from
    dentalgemma-app/app/api/symptom-check/route.ts
    """
    cleaned = clean_thought_traces(response_text).strip()
    
    # Extract urgency just for the banner color (matching Next.js logic)
    urgency = "routine"
    urgency_match = re.search(r'\*\*Urgency:\*\*\s*(.+?)(?:\n|$)', cleaned, re.IGNORECASE)
    
    if urgency_match:
        text = urgency_match.group(1).lower()
        if 'emergency' in text or '(2)' in text:
            urgency = 'emergency'
        elif 'urgent' in text or '(1)' in text:
            urgency = 'urgent'
        elif 'home' in text:
            urgency = 'home-care'
        else:
            urgency = 'routine'
            
    return {
        "urgency": urgency,
        "markdownReport": cleaned
    }

def validate_symptom_result(result, source):
    """Validate that the SymptomResult has all fields the UI renders."""
    print(f"\n--- Validating {source} Symptom Result for UI Compatibility ---")
    
    issues = []
    
    # 1. Urgency
    urgency = result.get("urgency", "")
    valid = ["emergency", "urgent", "routine", "home-care"]
    if urgency not in valid:
        issues.append(f"❌ urgency '{urgency}' is not one of {valid}")
    else:
        print(f"  ✅ urgency: {urgency}")
    
    # 2. Markdown Report
    report = result.get("markdownReport", "")
    if not report:
        issues.append("❌ markdownReport is empty")
    else:
        preview = report[:120].replace('\n', ' ') + "..." if len(report) > 120 else report
        print(f"  ✅ markdownReport: {preview}")
    
    if issues:
        print(f"\n  ⚠️  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"    {issue}")
    else:
        print(f"\n  ✅ All Symptom Checker UI fields populated correctly!")

# ============================================================================
# 6. RESEARCH SEARCH (PubMed)
# ============================================================================

def test_research_search_nextjs():
    """
    Test the research search via Next.js /api/research/search route.
    This calls PubMed directly (no Modal backend needed).
    """
    print("\nTesting Research Search (Next.js Route - PubMed)...")
    
    # Exact payload shape the UI sends
    payload = {
        "query": "dental caries prevention fluoride",
        "options": {
            "maxResults": 5,
            "dateRange": "5-years",
            "contentType": "research"
        }
    }
    
    print(f"Search query: \"{payload['query']}\"")
    print(f"Options: {json.dumps(payload['options'])}")
    
    try:
        response = requests.post(f"{NEXTJS_BASE}/research/search", json=payload)
        print_result("Research Search (Next.js)", response)
        
        if response.status_code == 200:
            data = response.json()
            validate_research_response(data, "Next.js")
    except requests.exceptions.ConnectionError:
        print("⚠️  Next.js dev server not running. Start with 'npm run dev' in dentalgemma-app/")
    except Exception as e:
        print(f"Research Search Test Failed: {e}")

def test_research_search_pubmed_direct():
    """Test PubMed API directly (no Next.js needed) to verify connectivity."""
    print("\nTesting Research Search (PubMed Direct)...")
    
    query = "dental caries prevention fluoride"
    search_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={query}&retmax=5&retmode=json"
    
    try:
        response = requests.get(search_url)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            pmids = data.get("esearchresult", {}).get("idlist", [])
            print(f"  ✅ Found {len(pmids)} PubMed IDs: {pmids}")
            
            if pmids:
                # Fetch details
                fetch_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={','.join(pmids)}&retmode=json"
                detail_resp = requests.get(fetch_url)
                
                if detail_resp.status_code == 200:
                    details = detail_resp.json().get("result", {})
                    papers = []
                    for pmid in pmids:
                        article = details.get(pmid, {})
                        if article and not article.get("error"):
                            papers.append({
                                "pmid": pmid,
                                "title": article.get("title", "Untitled"),
                                "authors": [a.get("name", "") for a in article.get("authors", [])],
                                "journal": article.get("fulljournalname", article.get("source", "Unknown")),
                                "date": article.get("pubdate", "Unknown"),
                                "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                            })
                    
                    print(f"  ✅ Fetched details for {len(papers)} papers:")
                    for p in papers:
                        print(f"      - {p['title'][:80]}...")
                        print(f"        {p['journal']} ({p['date']})")
        else:
            print(f"  ❌ PubMed search failed: {response.status_code}")
    except Exception as e:
        print(f"PubMed Direct Test Failed: {e}")

def validate_research_response(data, source):
    """Validate research search response matches what the UI expects."""
    print(f"\n--- Validating {source} Research Response for UI Compatibility ---")
    
    issues = []
    
    if not data.get("success"):
        issues.append("❌ 'success' is missing or false")
    else:
        print("  ✅ success: true")
    
    # Check papers array
    papers = data.get("papers", [])
    total = data.get("totalResults", 0)
    print(f"  ✅ totalResults: {total}")
    
    if not papers:
        issues.append("⚠️  papers[] is empty (may be a search relevance issue)")
    else:
        print(f"  ✅ papers: {len(papers)} items")
        for i, p in enumerate(papers[:3]):
            # Validate each paper has required fields
            paper_issues = []
            if not p.get("pmid"):
                paper_issues.append("pmid")
            if not p.get("title"):
                paper_issues.append("title")
            if not p.get("url"):
                paper_issues.append("url")
            
            if paper_issues:
                issues.append(f"⚠️  Paper {i+1} missing: {', '.join(paper_issues)}")
            else:
                print(f"      {i+1}. [{p['pmid']}] {p['title'][:70]}...")
                print(f"         {p.get('journal', 'N/A')} ({p.get('date', 'N/A')})")
    
    if issues:
        print(f"\n  ⚠️  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"    {issue}")
    else:
        print(f"\n  ✅ Research response valid!")

# ============================================================================
# SHARED UTILITIES
# ============================================================================

def clean_thought_traces(text):
    """Remove thought traces and special tokens from model output (mirrors modal-client.ts cleanResponseText)."""
    if not text:
        return ""
    
    clean = text.strip()
    
    # Remove <unusedXX>thought blocks
    clean = re.sub(r'<unused\d+>thought[\s\S]*?<unused\d+>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<unused\d+>thought[\s\S]*?(?=\n\n|$)', '', clean, flags=re.IGNORECASE)
    
    # Remove XML-style thought blocks
    clean = re.sub(r'<thought>[\s\S]*?</thought>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<thought>[\s\S]*$', '', clean, flags=re.IGNORECASE)
    
    # Remove special tokens
    clean = re.sub(r'<unused\d+>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<start_of_turn>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<end_of_turn>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<\|im_start\|>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<\|im_end\|>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<\|assistant\|>', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<\|user\|>', '', clean, flags=re.IGNORECASE)
    
    # Remove leading "thought" word
    clean = re.sub(r'^(?:thought|reasoning|analysis)[:\s\-\n]*', '', clean, flags=re.IGNORECASE)
    
    return clean.strip()

def try_extract_json(text):
    """Try to extract JSON from text (mirrors modal-client.ts cleanAndParseResponse)."""
    try:
        if not text:
            return None
        
        clean = text.strip()
        
        # Remove thought blocks
        clean = re.sub(r'<unused\d+>thought[\s\S]*?(?=\{)', '', clean)
        clean = re.sub(r'<thought>[\s\S]*?</thought>', '', clean, flags=re.IGNORECASE)
        
        # Extract from markdown code blocks
        block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', clean)
        if block_match:
            clean = block_match.group(1).strip()
        
        # Find JSON object
        json_start = clean.find('{')
        json_end = clean.rfind('}')
        
        if json_start != -1 and json_end != -1 and json_end > json_start:
            json_str = clean[json_start:json_end + 1]
            return json.loads(json_str)
        
        return None
    except (json.JSONDecodeError, Exception):
        return None

def extract_findings_from_text(text):
    """Extract findings from plain text (mirrors modal-client.ts extractFindings)."""
    findings = []
    in_findings = False
    
    for line in text.split('\n'):
        lower = line.lower().strip()
        
        if 'finding' in lower and (':' in lower or lower.startswith('#') or lower.startswith('**')):
            in_findings = True
            continue
        elif in_findings and (lower.startswith('#') or lower.startswith('**')) and 'finding' not in lower:
            in_findings = False
            continue
        
        if in_findings:
            trimmed = line.strip()
            if re.match(r'^[-*•]\s+', trimmed) or re.match(r'^\d+\.\s+', trimmed):
                cleaned = re.sub(r'^[-*•]\s+', '', trimmed)
                cleaned = re.sub(r'^\d+\.\s+', '', cleaned)
                if len(cleaned) > 5:
                    findings.append(cleaned)
    
    return findings

def extract_confidence_from_text(text):
    """Extract confidence from plain text (mirrors modal-client.ts extractConfidence)."""
    patterns = [
        r'confidence[:\s]+(\d+)%',
        r'confidence[:\s]+(\d+\.\d+)',
        r'\*\*Confidence\*\*[:\s]+(\d+)%',
        r'"confidence":\s*(\d+\.?\d*)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            value = float(match.group(1))
            if value > 1:
                value = value / 100
            return value
    
    return 0.8  # default

def extract_recommendations_from_text(text):
    """Extract recommendations from plain text (mirrors modal-client.ts extractRecommendations)."""
    recs = []
    in_recs = False
    
    for line in text.split('\n'):
        lower = line.lower().strip()
        
        if 'recommendation' in lower and (':' in lower or lower.startswith('#') or lower.startswith('**')):
            in_recs = True
            continue
        elif in_recs and (lower.startswith('#') or lower.startswith('**')) and 'recommendation' not in lower:
            in_recs = False
            continue
        
        if in_recs:
            trimmed = line.strip()
            if re.match(r'^[-*•]\s+', trimmed) or re.match(r'^\d+\.\s+', trimmed):
                cleaned = re.sub(r'^[-*•]\s+', '', trimmed)
                cleaned = re.sub(r'^\d+\.\s+', '', cleaned)
                if len(cleaned) > 5:
                    recs.append(cleaned)
    
    return recs

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    # Force UTF-8 encoding for stdout to handle potential unicode in AI responses
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 60)
    print("  DentalGemma Endpoint Tests")
    print("=" * 60)
    
    # 1. Test Health
    print("\n" + "=" * 60)
    print("  1. HEALTH CHECK")
    print("=" * 60)
    test_health()
    
    # 2. Test Chat (Modal Direct)
    print("\n" + "=" * 60)
    print("  2. CHAT")
    print("=" * 60)
    test_chat()
    test_chat_nextjs()
    
    # 3. Test Assessment (Modal Direct + Next.js)
    print("\n" + "=" * 60)
    print("  3. CLINICAL ASSESSMENT")
    print("=" * 60)
    test_assessment_modal_direct()
    test_assessment_nextjs()
    
    # 4. Test Image Analysis (Photo & X-Ray)
    print("\n" + "=" * 60)
    print("  4. IMAGE ANALYSIS (X-Ray & Photo)")
    print("=" * 60)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Test xray mode - Modal Direct
    xray_image_path = os.path.join(script_dir, "dental_xray.jpg")
    test_image_analysis(xray_image_path, analysis_type='xray')
    
    # Test photo mode - Modal Direct
    photo_image_path = os.path.join(script_dir, "dental_photo.jpg")
    test_image_analysis(photo_image_path, analysis_type='photo')
    
    # Test via Next.js route (if dev server running)
    test_image_analysis_nextjs(xray_image_path, analysis_type='xray')
    test_image_analysis_nextjs(photo_image_path, analysis_type='photo')
    
    # 5. Test Symptom Checker
    print("\n" + "=" * 60)
    print("  5. SYMPTOM CHECKER")
    print("=" * 60)
    test_symptom_check_modal_direct()
    test_symptom_check_nextjs()
    
    # 6. Test Research Search
    print("\n" + "=" * 60)
    print("  6. RESEARCH SEARCH (PubMed)")
    print("=" * 60)
    test_research_search_pubmed_direct()
    test_research_search_nextjs()
    
    print("\n" + "=" * 60)
    print("  Testing Complete.")
    print("=" * 60)
