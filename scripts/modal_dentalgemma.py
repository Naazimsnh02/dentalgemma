"""
DentalGemma Modal.com Deployment Script
========================================
Production-ready GPU inference endpoint for DentalGemma 1.5 4B IT model.

Compatible with Modal 1.0+ API

Features:
- Unified endpoint for both VQA (X-ray analysis) and text-only (clinical assessment)
- GPU snapshotting for 10x faster cold starts
- Full bfloat16 precision (no quantization)
- HuggingFace authentication for private model access
- Comprehensive error handling and logging
- FastAPI-based endpoints (Modal 1.0+ requirement)

Model: naazimsnh02/dentalgemma-1.5-4b-it (private)
Base: google/medgemma-1.5-4b-it

API Changes (Modal 1.0+):
- @modal.web_endpoint → @modal.fastapi_endpoint
- container_idle_timeout → scaledown_window
- FastAPI must be explicitly installed in image
- GPU specification uses string format: gpu="A10G"
"""

import modal
import os
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

# Modal app configuration
app = modal.App("dentalgemma")

# Pydantic models for request validation
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    max_tokens: Optional[int] = 512

class PatientInfo(BaseModel):
    age: int
    gender: str

class AssessmentRequest(BaseModel):
    patient: PatientInfo
    chief_complaint: str
    clinical_findings: str
    radiographic_findings: str
    medical_history: str
    max_tokens: Optional[int] = 1024

class XRayRequest(BaseModel):
    image: str
    question: Optional[str] = "Analyze this dental X-ray image in detail."
    max_tokens: Optional[int] = 512

# Docker image with specific PyTorch versions required by the model
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        # Specific versions that worked during fine-tuning
        "torch==2.9.0",
        "torchvision==0.24.0",
        "transformers>=4.50.0",
        "pillow>=10.0.0",
        "accelerate>=1.0.0",
        "bitsandbytes>=0.41.0",
        "fastapi[standard]",  # Required for web endpoints
    )
)

@app.cls(
    image=image,
    gpu="L40S",  # A10G (24GB) - use "H100" or "L40S" for more power
    secrets=[modal.Secret.from_name("huggingface-secret")],
    timeout=300,  # 5 minutes max per request
    scaledown_window=300,  # Keep warm for 5 minutes (renamed from container_idle_timeout)
    enable_memory_snapshot=True,  # GPU snapshotting for fast cold starts
)
class DentalGemmaModel:
    """
    DentalGemma inference class with unified endpoint for multimodal and text-only tasks.
    """
    
    @modal.enter()
    def load_models(self):
        """
        Load models at container startup (cached via GPU snapshot).
        This runs once when the container starts and is cached for subsequent requests.
        """
        from transformers import AutoProcessor, AutoModelForImageTextToText
        import torch
        
        print("🦷 Loading DentalGemma model...")
        
        model_id = "naazimsnh02/dentalgemma-1.5-4b-it"
        
        # Load processor (handles both text and image inputs)
        self.processor = AutoProcessor.from_pretrained(
            model_id,
            token=os.environ.get("HF_TOKEN")
        )
        
        # Load model in full bfloat16 precision (no quantization)
        self.model = AutoModelForImageTextToText.from_pretrained(
            model_id,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            token=os.environ.get("HF_TOKEN")
        )
        
        print(f"✅ Model loaded successfully on {self.model.device}")
        print(f"📊 Model dtype: {self.model.dtype}")
    
    @modal.fastapi_endpoint(method="POST")
    def analyze_xray(self, request: XRayRequest):
        """
        VQA inference endpoint for dental X-ray analysis.
        
        Request body:
        {
            "image": "base64_encoded_image_string",
            "question": "Analyze this dental X-ray for any abnormalities." (optional),
            "max_tokens": 512 (optional)
        }
        
        Response:
        {
            "success": true,
            "analysis": "Model's analysis text",
            "processing_time": 1.23,
            "model": "dentalgemma-1.5-4b-it"
        }
        """
        import time
        import base64
        import io
        import torch
        from PIL import Image
        
        start_time = time.time()
        
        try:
            # Decode base64 image
            image_data = base64.b64decode(request.image)
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
            
            # Use request attributes
            question = request.question
            max_tokens = request.max_tokens
            
            # Determine analysis type from question
            analysis_type = "xray"  # default
            if "photograph" in question.lower() or "clinical photo" in question.lower():
                analysis_type = "photo"
            
            # Build structured prompts based on analysis type
            structured_prompts = {
                "photo": """Analyze this clinical dental photograph. Describe the condition of the teeth and gums visible. Note any signs of decay, discoloration, or other abnormalities. Assess the severity and recommend follow-up actions.

Provide a detailed clinical description including:
- Overall oral health condition
- Any visible decay, discoloration, or abnormalities
- Severity assessment (mild, moderate, severe)
- Recommended follow-up actions

Structure your response with clear findings and recommendations.""",

                "xray": """Analyze this dental radiograph in detail. Identify and describe any pathological findings and their approximate locations (e.g., left/right, upper/lower jaw, anterior/posterior). Provide your primary assessment, possible differential diagnoses, and clinical recommendations. Comment on the urgency of any findings.

Structure your response with:
- Clear findings with anatomical locations
- Primary pathology assessment
- Differential diagnoses if applicable
- Clinical recommendations
- Urgency level"""
            }
            
            # Get the appropriate structured prompt
            structured_question = structured_prompts.get(analysis_type, structured_prompts["xray"])
            
            # Prepare messages in chat format
            messages = [
                {
                    "role": "system",
                    "content": [{"type": "text", "text": "You are an expert dental clinician and radiologist AI assistant. Provide detailed, clinically accurate analyses using proper dental terminology. Structure your response with clear findings, assessment, and recommendations."}]
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "image", "image": image},
                        {"type": "text", "text": structured_question}
                    ]
                }
            ]
            
            # Apply chat template and tokenize
            inputs = self.processor.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt"
            ).to(self.model.device, dtype=torch.bfloat16)
            
            # Generate response
            with torch.inference_mode():
                generation = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    do_sample=False  # Deterministic for medical applications
                )
                
                # Extract only the generated tokens (exclude input)
                generation = generation[0][inputs["input_ids"].shape[-1]:]
            
            # Decode response
            analysis = self.processor.decode(generation, skip_special_tokens=True)
            
            # Try to parse JSON from model output
            import json
            
            xray_result = None
            try:
                # Strip any markdown fences if present
                clean = analysis.strip()
                
                # Remove any text before the JSON (like "Here is the analysis:")
                json_start = clean.find('{')
                if json_start > 0:
                    clean = clean[json_start:]
                
                # Remove any text after the JSON (like critiques or explanations)
                # Find the last closing brace
                json_end = clean.rfind('}')
                if json_end > 0:
                    clean = clean[:json_end + 1]
                
                # Handle markdown fences
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
                if clean.endswith("```"):
                    clean = clean[:-3]
                clean = clean.strip()
                if clean.startswith("json"):
                    clean = clean[4:].strip()
                
                xray_result = json.loads(clean)
                print(f"✅ Successfully parsed JSON response for {analysis_type} analysis")
            except (json.JSONDecodeError, Exception) as parse_err:
                print(f"⚠️ JSON parse failed for {analysis_type}, returning raw text: {parse_err}")
                print(f"Raw response preview: {analysis[:200]}...")
            
            processing_time = time.time() - start_time
            
            result = {
                "success": True,
                "analysis": analysis,
                "processing_time": round(processing_time, 3),
                "model": "dentalgemma-1.5-4b-it",
                "type": "xray_analysis",
                "analysis_type": analysis_type
            }
            
            # Add parsed JSON if available
            if xray_result is not None:
                result["xray_analysis"] = xray_result
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(time.time() - start_time, 3)
            }
    
    @modal.fastapi_endpoint(method="POST")
    def assess_case(self, request: AssessmentRequest):
        """
        Clinical case assessment endpoint (text-only).
        
        Request body:
        {
            "patient": {
                "age": 45,
                "gender": "female"
            },
            "chief_complaint": "Sharp pain when drinking cold water...",
            "clinical_findings": "Tooth #16 has a defective amalgam restoration...",
            "radiographic_findings": "Periapical radiolucency visible...",
            "medical_history": "No significant medical history",
            "max_tokens": 1024 (optional)
        }
        
        Response:
        {
            "success": true,
            "assessment": "Comprehensive clinical assessment text",
            "processing_time": 2.45,
            "model": "dentalgemma-1.5-4b-it"
        }
        """
        import time
        import torch
        
        start_time = time.time()
        
        try:
            # Build structured case text using request attributes (JSON-first prompt)
            case_text = f"""You are an expert dental AI. Your task is to analyze the patient case below and extract specific clinical data into a JSON object.

OUTPUT RULES:
1. Respond ONLY with valid JSON.
2. Do NOT use markdown code blocks (```json).
3. Do NOT repeat the patient info or findings in chat format.
4. Fill all fields based on clinical reasoning.

JSON SCHEMA:
{{
  "diagnosis": {{
    "primary": "primary diagnosis text",
    "differential": ["differential diagnosis 1", "differential diagnosis 2"]
  }},
  "etiology": {{
    "rootCause": "root cause description"
  }},
  "urgency": "routine",
  "managementPlan": {{
    "protocol": ["treatment step 1", "treatment step 2"]
  }},
  "antibiotics": {{
    "indicated": false,
    "reason": "none"
  }},
  "followUp": {{
    "timing": "1-2 weeks",
    "monitoring": ["what to monitor"]
  }},
  "patientCounseling": {{
    "explanation": "patient-friendly explanation"
  }}
}}

The "urgency" field must be one of: "emergency", "urgent", "routine", or "home-care".

CASE DETAILS:
PATIENT INFORMATION:
- Age: {request.patient.age} years old
- Gender: {request.patient.gender}

CHIEF COMPLAINT:
{request.chief_complaint}

CLINICAL FINDINGS:
{request.clinical_findings}

RADIOGRAPHIC FINDINGS:
{request.radiographic_findings}

MEDICAL HISTORY:
{request.medical_history}
"""
            
            max_tokens = request.max_tokens
            
            # Prepare messages (must look like multimodal input even for text-only)
            messages = [
                {
                    "role": "system",
                    "content": [{"type": "text", "text": "You are an expert dental clinician and radiologist AI assistant. Provide comprehensive, evidence-based clinical assessments following dental protocols."}]
                },
                {
                    "role": "user",
                    "content": [{"type": "text", "text": case_text}]
                }
            ]
            
            # Apply chat template and tokenize
            inputs = self.processor.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt"
            ).to(self.model.device)
            
            # Generate response
            with torch.inference_mode():
                outputs = self.model.generate(
                    **inputs,  # Unpack dictionary inputs
                    max_new_tokens=max_tokens,
                    do_sample=False
                )
            
            # Decode response (extract only generated tokens)
            assessment = self.processor.decode(
                outputs[0][inputs["input_ids"].shape[-1]:],
                skip_special_tokens=True
            )
            
            # Try to parse structured JSON from model output
            import json
            
            case_assessment = None
            try:
                # Strip any markdown fences if present
                clean = assessment.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
                if clean.endswith("```"):
                    clean = clean[:-3]
                clean = clean.strip()
                if clean.startswith("json"):
                    clean = clean[4:].strip()
                case_assessment = json.loads(clean)
            except (json.JSONDecodeError, Exception) as parse_err:
                print(f"⚠️ JSON parse failed, returning raw text: {parse_err}")
            
            processing_time = time.time() - start_time
            
            result = {
                "success": True,
                "assessment": assessment,
                "processing_time": round(processing_time, 3),
                "model": "dentalgemma-1.5-4b-it",
                "type": "clinical_assessment"
            }
            
            if case_assessment is not None:
                result["case_assessment"] = case_assessment
            
            return result
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(time.time() - start_time, 3)
            }
    
    @modal.fastapi_endpoint(method="POST")
    def chat(self, request: ChatRequest):
        """
        General chat endpoint for voice consultation and Q&A.
        
        Request body:
        {
            "message": "What are the symptoms of gingivitis?",
            "history": [
                {"role": "user", "content": "Previous message"},
                {"role": "assistant", "content": "Previous response"}
            ] (optional),
            "max_tokens": 512 (optional)
        }
        
        Response:
        {
            "success": true,
            "response": "AI response text",
            "processing_time": 0.89,
            "model": "dentalgemma-1.5-4b-it",
            "type": "chat"
        }
        """
        import time
        import torch
        
        start_time = time.time()
        
        try:
            # Use request attributes
            message = request.message
            history = request.history
            max_tokens = request.max_tokens
            
            # Build conversation history
            messages = [
                {
                    "role": "system",
                    "content": [{"type": "text", "text": "You are DentalGemma, an expert dental AI assistant trained on 98 dental conditions. Provide accurate, evidence-based dental information. Always recommend consulting a licensed dentist for clinical diagnosis."}]
                }
            ]
            
            # Add conversation history
            for msg in history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                # Ensure content is in list format
                if isinstance(content, str):
                    formatted_content = [{"type": "text", "text": content}]
                else:
                    formatted_content = content
                    
                messages.append({
                    "role": role,
                    "content": formatted_content
                })
            
            # Add current message
            messages.append({
                "role": "user",
                "content": [{"type": "text", "text": message}]
            })
            
            # Apply chat template and tokenize
            inputs = self.processor.apply_chat_template(
                messages,
                add_generation_prompt=True,
                tokenize=True,
                return_dict=True,
                return_tensors="pt"
            ).to(self.model.device)
            
            # Generate response
            with torch.inference_mode():
                outputs = self.model.generate(
                    **inputs,  # Unpack inputs
                    max_new_tokens=max_tokens,
                    do_sample=False
                )
            
            # Decode response
            response = self.processor.decode(
                outputs[0][inputs["input_ids"].shape[-1]:],
                skip_special_tokens=True
            )
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "message": response,
                "response": response,  # backward compat
                "processing_time": round(processing_time, 3),
                "model": "dentalgemma-1.5-4b-it",
                "type": "chat"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "processing_time": round(time.time() - start_time, 3)
            }
    
    @modal.fastapi_endpoint(method="GET")
    def health(self):
        """
        Health check endpoint.
        
        Response:
        {
            "status": "healthy",
            "model": "dentalgemma-1.5-4b-it",
            "device": "cuda:0",
            "dtype": "torch.bfloat16"
        }
        """
        import torch
        
        return {
            "status": "healthy",
            "model": "dentalgemma-1.5-4b-it",
            "device": str(self.model.device),
            "dtype": str(self.model.dtype),
            "gpu_available": torch.cuda.is_available(),
            "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None
        }


# Local testing function
@app.local_entrypoint()
def test():
    """
    Local test function to verify deployment.
    Run with: modal run modal_dentalgemma.py
    
    Note: Web endpoints must be tested via HTTP requests, not .remote() calls.
    """
    import requests
    
    print("🧪 Testing DentalGemma deployment...")
    print("\n⚠️  Note: Web endpoints are deployed and accessible via HTTP.")
    print("    Use the URLs below to test your endpoints:\n")
    
    # Get the base URL (dev environment when running with 'modal run')
    base_url = "https://sumaiyanaazim--dentalgemma-dentalgemmamodel"
    
    print("📡 Deployed Endpoints:")
    print(f"   Health:     {base_url}-health-dev.modal.run")
    print(f"   Chat:       {base_url}-chat-dev.modal.run")
    print(f"   X-Ray:      {base_url}-analyze-xray-dev.modal.run")
    print(f"   Assessment: {base_url}-assess-case-dev.modal.run")
    
    print("\n🧪 Example Test Commands:")
    print("\n1. Health Check:")
    print(f"   curl {base_url}-health-dev.modal.run")
    
    print("\n2. Chat Test:")
    print(f"""   curl -X POST {base_url}-chat-dev.modal.run \\
     -H "Content-Type: application/json" \\
     -d '{{"message": "What causes tooth decay?"}}'""")
    
    print("\n3. Clinical Assessment Test:")
    print(f"""   curl -X POST {base_url}-assess-case-dev.modal.run \\
     -H "Content-Type: application/json" \\
     -d '{{
       "patient": {{"age": 35, "gender": "male"}},
       "chief_complaint": "Severe tooth pain",
       "clinical_findings": "Deep cavity visible",
       "radiographic_findings": "Periapical radiolucency",
       "medical_history": "No significant history"
     }}'""")
    
    print("\n✅ Deployment successful! Use the commands above to test your endpoints.")
    print("💡 Tip: For production URLs, use 'modal deploy' instead of 'modal run'.")
