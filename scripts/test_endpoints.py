import requests
import base64
import json
import os
import sys

# Endpoint URLs
# Modal direct endpoints
MODAL_ENDPOINTS = {
    "health": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-health.modal.run",
    "chat": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-chat.modal.run",
    "xray": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-analyze-xray.modal.run",
    "assess": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-assess-case.modal.run"
}

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

def test_health():
    print("\nTesting Health Endpoint...")
    try:
        response = requests.get(MODAL_ENDPOINTS["health"])
        print_result("Health Check", response)
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_chat():
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
    except Exception as e:
        print(f"Chat Test Failed: {e}")

def test_assessment_modal_direct():
    """Test the Modal endpoint directly with flat fields (backend contract)."""
    print("\nTesting Clinical Assessment (Modal Direct)...")
    payload = {
        "patient": {
            "age": 45,
            "gender": "male"
        },
        "chief_complaint": "Persistent throbbing pain in the upper right molar, especially at night.",
        "clinical_findings": "Intraoral: Deep caries on tooth #16, tender to percussion, no swelling.\nExtraoral: No facial asymmetry or swelling.\nSoft Tissue: Gingiva around #16 slightly inflamed.\nPeriodontal: Probing depths within normal limits except 5mm on mesial of #16.",
        "radiographic_findings": "Periapical radiolucency associated with the mesial root of tooth #16. No evidence of horizontal or vertical bone loss.",
        "medical_history": "Medications: Lisinopril 10mg daily\nAllergies: Penicillin\nConditions: Hypertension, controlled with medication",
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
                "gender": "male"
            },
            "chiefComplaint": {
                "description": "Persistent throbbing pain in the upper right molar, especially at night.",
                "duration": "1 week",
                "painLevel": 7,
                "triggers": ["cold drinks", "chewing", "lying down"]
            },
            "clinicalFindings": {
                "intraoral": "Deep caries on tooth #16, tender to percussion, no swelling.",
                "extraoral": "No facial asymmetry or swelling.",
                "softTissue": "Gingiva around #16 slightly inflamed, marginal redness noted.",
                "periodontal": "Probing depths within normal limits except 5mm on mesial of #16."
            },
            "radiographicFindings": {
                "description": "Periapical radiolucency associated with the mesial root of tooth #16. No evidence of horizontal or vertical bone loss.",
                "boneLoss": "None",
                "periapicalStatus": "Radiolucency at mesial root apex of #16"
            },
            "medicalHistory": {
                "medications": ["Lisinopril 10mg daily"],
                "allergies": ["Penicillin"],
                "systemicConditions": ["Hypertension"],
                "previousTreatments": ["Amalgam restoration on #16 (5 years ago)"]
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
    # Modal direct returns case_assessment; Next.js route returns the parsed CaseAssessment
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
        issues.append("⚠️  diagnosis.differential is empty (may be OK for clear-cut cases)")
    else:
        print(f"  ✅ diagnosis.differential: {differential}")
    
    # 2. Etiology
    etiology = assessment.get("etiology", {})
    root_cause = etiology.get("rootCause", "")
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
    mgmt = assessment.get("managementPlan", {})
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
    followup = assessment.get("followUp", {})
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
    counseling = assessment.get("patientCounseling", {})
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

def test_image_analysis(image_path, analysis_type='xray'):
    """
    Test Image Analysis Endpoint with specific V2 prompts.
    analysis_type: 'photo' or 'xray'
    """
    type_label = "Clinical Photo Analysis" if analysis_type == 'photo' else "X-Ray Analysis"
    print(f"\nTesting {type_label} Endpoint with {image_path}...")
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return

    # V2 Prompts from Plan
    prompts = {
        "photo": "Analyze this clinical dental photograph. Describe the condition of the teeth and gums visible. Note any signs of decay, discoloration, or other abnormalities. Assess the severity and recommend follow-up actions.",
        "xray": "Analyze this dental radiograph. Describe any pathological findings and their locations. Provide your assessment of the condition, possible differential diagnoses, and clinical recommendations."
    }

    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        payload = {
            "image": encoded_string,
            "question": prompts.get(analysis_type, prompts['xray']),
            "max_tokens": 512
        }
        
        print(f"Prompt sent: \"{payload['question']}\"")
        
        response = requests.post(MODAL_ENDPOINTS["xray"], json=payload)
        print_result(type_label, response)
    except Exception as e:
        print(f"{type_label} Test Failed: {e}")

if __name__ == "__main__":
    # Force UTF-8 encoding for stdout to handle potential unicode in AI responses
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("Starting DentalGemma Endpoint Tests...")
    
    # 1. Test Health
    test_health()
    
    # 2. Test Chat
    test_chat()
    
    # 3. Test Assessment (Modal Direct - matches how modal-client.ts calls it)
    test_assessment_modal_direct()
    
    # 4. Test Assessment (Next.js Route - matches exactly how the UI calls it)
    test_assessment_nextjs()
    
    # 5. Test Image Analysis (Photo & X-Ray)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Test xray mode with dental_xray.jpg
    xray_image_path = os.path.join(script_dir, "dental_xray.jpg")
    test_image_analysis(xray_image_path, analysis_type='xray')
    
    # Test photo mode with dental_photo.jpg
    photo_image_path = os.path.join(script_dir, "dental_photo.jpg")
    test_image_analysis(photo_image_path, analysis_type='photo')
    
    print("\nTesting Complete.")
