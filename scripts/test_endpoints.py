import requests
import base64
import json
import os
import sys

# Endpoint URLs
ENDPOINTS = {
    "health": "https://naazimsnh02--dentalgemma-dentalgemmamodel-health.modal.run",
    "chat": "https://naazimsnh02--dentalgemma-dentalgemmamodel-chat.modal.run",
    "xray": "https://naazimsnh02--dentalgemma-dentalgemmamodel-analyze-xray.modal.run",
    "assess": "https://naazimsnh02--dentalgemma-dentalgemmamodel-assess-case.modal.run"
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
    
    try:
        response = requests.post(ENDPOINTS["assess"], json=payload)
        print_result("Clinical Assessment", response)
    except Exception as e:
        print(f"Assessment Test Failed: {e}")

def test_xray(image_path):
    print(f"\nTesting X-Ray Analysis Endpoint with {image_path}...")
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return

    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        payload = {
            "image": encoded_string,
            "question": "Describe the condition of the teeth and identify any pathologies.",
            "max_tokens": 512
        }
        
        response = requests.post(ENDPOINTS["xray"], json=payload)
        print_result("X-Ray Analysis", response)
    except Exception as e:
        print(f"X-Ray Test Failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting DentalGemma Endpoint Tests...")
    
    # 1. Test Health
    test_health()
    
    # 2. Test Chat
    test_chat()
    
    # 3. Test Assessment
    test_assessment()
    
    # 4. Test X-Ray
    # Assuming script is run from 'scripts' folder or root, adjust path accordingly
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_filename = "dental_xray.jpg"
    image_path = os.path.join(script_dir, image_filename)
    
    test_xray(image_path)
    
    print("\n✅ Testing Complete.")
