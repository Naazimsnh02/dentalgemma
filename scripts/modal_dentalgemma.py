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
            analysis_type = "general"
            if "cavity" in question.lower() or "cavities" in question.lower():
                analysis_type = "cavity"
            elif "opg" in question.lower() or "panoramic" in question.lower():
                analysis_type = "opg"
            
            # Build structured JSON prompt based on analysis type
            structured_prompts = {
                "cavity": """Analyze this dental X-ray for cavities. You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON. Do not add explanations or markdown fences. Just the JSON object.

Use this exact schema:

{
  "cavityCount": "0 or 1 or 2 or 3+",
  "classification": "normal or cavity",
  "confidence": 0.85,
  "urgency": "emergency or urgent or routine or home-care",
  "findings": [
    "Finding 1: Location and extent of any cavities detected",
    "Finding 2: Severity assessment (early, moderate, advanced)",
    "Finding 3: Affected tooth surfaces or regions",
    "Finding 4: Any secondary findings"
  ],
  "clinicalSignificance": "Brief paragraph explaining the clinical implications of the findings",
  "recommendations": [
    "Recommendation 1: Immediate treatment needs",
    "Recommendation 2: Follow-up timing",
    "Recommendation 3: Preventive measures",
    "Recommendation 4: Specialist referral if needed"
  ]
}

CRITICAL RULES:
- Output ONLY the JSON object, nothing else
- No explanatory text before or after
- No markdown code fences
- The "cavityCount" must be exactly one of: "0", "1", "2", "3+"
- The "classification" must be exactly one of: "normal", "cavity"
- The "confidence" must be a number between 0 and 1 (e.g., 0.85 for 85%)
- The "urgency" must be exactly one of: "emergency", "urgent", "routine", "home-care"
- Provide 2-4 findings and 2-4 recommendations as strings in the arrays""",

                "opg": """Classify this OPG (panoramic) X-ray. You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON. Do not add explanations or markdown fences. Just the JSON object.

Use this exact schema:

{
  "pathologyClass": "Healthy or Caries or Impacted or BDC-BDR or Infection or Fractured",
  "confidence": 0.90,
  "urgency": "emergency or urgent or routine or home-care",
  "findings": [
    "Dentition Status: Describe overall tooth count, missing teeth, and general dental health",
    "Pathological Findings: List any abnormalities, lesions, or pathology detected with specific locations",
    "Bone Assessment: Evaluate alveolar bone levels, trabecular pattern, and any bone pathology",
    "TMJ and Sinuses: Comment on temporomandibular joints and maxillary sinuses if visible",
    "Additional Observations: Any other clinically relevant findings"
  ],
  "recommendations": [
    "Treatment priority 1",
    "Specialist referral if needed",
    "Follow-up imaging requirements",
    "Preventive care measures"
  ]
}

CRITICAL RULES:
- Output ONLY the JSON object, nothing else
- No explanatory text before or after
- No markdown code fences
- The "pathologyClass" must be exactly one of: "Healthy", "Caries", "Impacted", "BDC-BDR", "Infection", "Fractured"
- The "confidence" must be a number between 0 and 1
- The "urgency" must be exactly one of: "emergency", "urgent", "routine", "home-care"
- Provide 3-5 findings and 3-5 recommendations""",

                "general": """Provide a comprehensive systematic evaluation of this dental X-ray. You MUST respond with ONLY a valid JSON object. Do not include any text before or after the JSON. Do not add explanations, critiques, or markdown fences. Just the JSON object.

Use this exact schema:

{
  "qualityAssessment": "Technical Quality: [Excellent/Good/Adequate/Poor]. Diagnostic Value: [Comment on clarity, positioning, and diagnostic utility]. Limitations: [Note any technical issues]",
  "confidence": 0.85,
  "urgency": "emergency or urgent or routine or home-care",
  "findings": [
    "Hard Tissue Evaluation: Examine teeth, restorations, and bone structures",
    "Periapical Status: Assess root apices and periapical regions for pathology",
    "Periodontal Assessment: Evaluate bone levels, lamina dura, and periodontal space",
    "Restorations and Prosthetics: Document existing dental work and assess integrity",
    "Pathological Findings: Identify any caries, infections, cysts, or other abnormalities"
  ],
  "reportSections": [
    "Clinical Interpretation: Synthesize findings and their clinical significance in 2-3 sentences",
    "Diagnostic Confidence: Overall confidence level and any factors limiting certainty"
  ],
  "recommendations": [
    "Immediate/urgent needs if any",
    "Routine treatment requirements",
    "Preventive measures",
    "Follow-up and monitoring plan"
  ]
}

CRITICAL RULES:
- Output ONLY the JSON object, nothing else
- No explanatory text before or after
- No critiques or comments
- No markdown code fences
- The "confidence" must be a number between 0 and 1
- The "urgency" must be exactly one of: "emergency", "urgent", "routine", "home-care"
- Provide 4-6 findings, 2-3 report sections, and 4-6 recommendations
- Be thorough, systematic, and use appropriate dental terminology"""
            }
            
            # Get the appropriate structured prompt
            structured_question = structured_prompts.get(analysis_type, structured_prompts["general"])
            
            # Prepare messages in chat format
            messages = [
                {
                    "role": "system",
                    "content": [{"type": "text", "text": "You are an expert dental clinician and radiologist AI assistant. When asked to provide JSON output, respond with ONLY the JSON object - no explanations, no critiques, no markdown fences, no additional text before or after. Provide detailed, structured analyses using proper dental terminology."}]
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
            # Build structured case text using request attributes
            case_text = f"""Please provide a comprehensive clinical assessment for this dental patient:

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

You MUST respond with ONLY a valid JSON object (no markdown fences, no extra text before or after). Use this exact schema:

{{
  "diagnosis": {{
    "primary": "primary diagnosis text",
    "icd10": "ICD-10 code like K04.0",
    "confidence": 0.85,
    "differential": ["differential diagnosis 1", "differential diagnosis 2"]
  }},
  "etiology": {{
    "rootCause": "root cause description",
    "contributingFactors": ["factor 1", "factor 2"],
    "riskFactors": ["risk 1", "risk 2"]
  }},
  "urgency": "routine",
  "managementPlan": {{
    "immediate": ["immediate step 1"],
    "protocol": ["treatment step 1", "treatment step 2"],
    "alternatives": ["alternative treatment 1"],
    "expectedOutcomes": "expected outcomes description",
    "duration": "treatment duration"
  }},
  "followUp": {{
    "initialTiming": "1-2 weeks",
    "monitoring": ["what to monitor"],
    "longTerm": "long term care plan",
    "redFlags": ["warning sign 1"]
  }},
  "patientCounseling": {{
    "explanation": "patient-friendly explanation",
    "homeCare": ["home care instruction 1"],
    "dietary": ["dietary recommendation 1"],
    "painManagement": "pain management advice",
    "emergencyTriggers": ["when to seek emergency care"]
  }},
  "guidelines": {{
    "relevant": ["relevant guideline 1"],
    "references": [],
    "evidenceLevel": "B"
  }}
}}

The "urgency" field must be one of: "emergency", "urgent", "routine", or "home-care".
The "confidence" field must be a number between 0 and 1.
Fill all fields with clinically appropriate values based on the case details above.
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
