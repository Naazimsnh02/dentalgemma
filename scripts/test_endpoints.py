import requests
import base64
import json
import os
import sys

# Endpoint URLs
ENDPOINTS = {
    "health": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-health.modal.run",
    "chat": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-chat.modal.run",
    "xray": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-analyze-xray.modal.run",
    "assess": "https://sumaiyanaazim--dentalgemma-dentalgemmamodel-assess-case.modal.run"
}

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
        response = requests.get(ENDPOINTS["health"])
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
        response = requests.post(ENDPOINTS["chat"], json=payload)
        print_result("Chat", response)
    except Exception as e:
        print(f"Chat Test Failed: {e}")

def test_assessment():
    print("\nTesting Clinical Assessment Endpoint...")
    payload = {
        "patient": {
            "age": 45,
            "gender": "male"
        },
        "chief_complaint": "Persistent throbbing pain in the upper right molar, especially at night.",
        "clinical_findings": "Deep caries on tooth #16, tender to percussion, no swelling.",
        "radiographic_findings": "Periapical radiolucency associated with the mesial root of tooth #16.",
        "medical_history": "Hypertension, controlled with medication.",
        "max_tokens": 1024
    }
    
    print(f"Assessment prompt (JSON payload) sent:\n{json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(ENDPOINTS["assess"], json=payload)
        print_result("Clinical Assessment", response)
    except Exception as e:
        print(f"Assessment Test Failed: {e}")

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
        
        response = requests.post(ENDPOINTS["xray"], json=payload)
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
    
    # 3. Test Assessment
    test_assessment()
    
    # 4. Test Image Analysis (Photo & X-Ray)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Test xray mode with dental_xray.jpg
    xray_image_path = os.path.join(script_dir, "dental_xray.jpg")
    test_image_analysis(xray_image_path, analysis_type='xray')
    
    # Test photo mode with dental_photo.jpg
    photo_image_path = os.path.join(script_dir, "dental_photo.jpg")
    test_image_analysis(photo_image_path, analysis_type='photo')
    
    print("\nTesting Complete.")
