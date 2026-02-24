# 🚀 DentalGemma Deployment Guide

---

## 📖 Overview

This document serves as the **single source of truth** for deploying the DentalGemma 1.5 4B IT model on Modal.com. 

**DentalGemma** is a specialized medical AI model fine-tuned for dental diagnostics, capable of:
1.  **Dental Image Analysis:** Multimodal analysis for detecting abnormalities in clinical photos and radiographs.
2.  **Clinical Assessment:** Comprehensive evaluation of patient symptoms and history.
3.  **Dental Chat:** Intelligent Q&A for general dental queries.

---

## 📋 Prerequisites

Before deploying, ensure you have the following set up:

### 1. Install Modal CLI
```bash
pip install modal
```

### 2. Authenticate
Sign up at [modal.com](https://modal.com) and link your account:
```bash
modal token new
```

### 3. Configure HuggingFace Access
To access the model (`naazimsnh02/dentalgemma-1.5-4b-it`), provide a valid HuggingFace token with **Read** permissions.

1.  Get your token: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2.  Add it to Modal secrets:
    ```bash
    modal secret create huggingface-secret HF_TOKEN=your_hf_token_here
    ```

---

## ⚡ Quick Start: 5-Minute Deployment

If you are ready to go, follow these steps to deploy immediately:

1.  **Deploy the App:**
    ```bash
    cd scripts
    modal deploy modal_dentalgemma.py
    ```
    *This builds the image, installs dependencies (pytorch 2.9.0, etc.), and provisions the L40S GPU containers.*

2.  **Verify Deployment:**
    ```bash
    # Run a quick internal test
    modal run modal_dentalgemma.py
    ```

3.  **Check Your Endpoints:**
    After deployment, Modal will output 4 URLs. **IMPORTANT: Copy these URLs!**
    
    They follow this pattern (replace `[YOUR-USERNAME]` with your actual Modal username):
    *   `https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-health.modal.run`
    *   `https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-chat.modal.run`
    *   `https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-analyze-xray.modal.run`
    *   `https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-assess-case.modal.run`
    
    **To find your Modal username:**
    ```bash
    modal profile current
    ```
    
    **For testing scripts:** The `test_endpoints.py` script will auto-detect your username, or you can set:
    ```bash
    export MODAL_USERNAME=your-username
    python scripts/test_endpoints.py
    ```

---

## 📡 API Endpoints Documentation

### 1. Health Check (`GET`)
**Purpose:** Verify system status and GPU availability.
*   **URL:** `...-health.modal.run`
*   **Response:**
    ```json
    {
      "status": "healthy",
      "model": "dentalgemma-1.5-4b-it",
      "gpu_available": true,
      "gpu_name": "NVIDIA L40S"
    }
    ```

### 2. Chat / Voice Consultation (`POST`)
**Purpose:** General dental Q&A.
*   **URL:** `...-chat.modal.run`
*   **Body:**
    ```json
    {
      "message": "What are symptoms of gingivitis?",
      "history": [], // Optional conversation history
      "max_tokens": 512
    }
    ```
*   **Response:** `{"response": "...", "processing_time": 0.89}`

### 3. Clinical Assessment (`POST`)
**Purpose:** Comprehensive case evaluation based on text inputs.
*   **URL:** `...-assess-case.modal.run`
*   **Body:**
    ```json
    {
      "patient": { "age": 35, "gender": "male" },
      "chief_complaint": "Severe tooth pain",
      "clinical_findings": "Deep cavity on #46",
      "radiographic_findings": "Periapical radiolucency",
      "medical_history": "None"
    }
    ```
*   **Response:** `{"assessment": "PRIMARY DIAGNOSIS: ...", "processing_time": 2.45}`

### 4. X-Ray Analysis (`POST`)
**Purpose:** Multimodal analysis of dental radiographs.
*   **URL:** `...-analyze-xray.modal.run`
*   **Body:**
    ```json
    {
      "image": "base64_encoded_string_of_image...",
      "question": "Analyze this X-ray for cavities."
    }
    ```
*   **Response:** `{"analysis": "The radiograph shows...", "processing_time": 1.23}`

---

## 💻 Command Reference

| Action | Command | Description |
| :--- | :--- | :--- |
| **Deploy** | `modal deploy modal_dentalgemma.py` | Deploys to production. |
| **Dev Run** | `modal run modal_dentalgemma.py` | Runs in ephemeral dev mode. |
| **Logs** | `modal app logs dentalgemma` | Views runtime logs. |
| **Stream Logs** | `modal app logs dentalgemma --follow` | Follows logs in real-time. |
| **Stop** | `modal app stop dentalgemma` | Stops the running app. |
| **List** | `modal app list` | Lists all active apps. |
| **Delete** | `modal app delete dentalgemma` | Permanently deletes the app. |

---

## 🔧 Infrastructure & Configuration

### Hardware & Performance
*   **GPU:** NVIDIA L40S (48GB VRAM).
*   **Precision:** `bfloat16` (No quantization).
*   **Cold Start:** ~30-60s (Initial load).
*   **Warm Start:** ~1-2s (GPU snapshotting enabled).
*   **Scaledown Window:** 300s (Container stays warm for 5 mins).

### Software Stack (Modal 1.0+)
*   **Framework:** PyTorch 2.9.0, Torchvision 0.24.0.
*   **Inference:** Transformers >= 4.50.0.
*   **Web Server:** FastAPI [standard].
*   **Updates:** Uses `@modal.fastapi_endpoint` and new string-based GPU spec (`gpu="L40S"`).

### Costs (Est.)
*   **Rate:** ~$1.10 / hour (L40S).
*   **Dev Mode:** ~$10-20 / month (typical usage).
*   **Production:** ~$300-400 / month (1k users, optimized).

---

## 🧪 Testing Guide

### cURL Examples

**Chat Test:**
```bash
curl -X POST https://[your-url]-chat.modal.run \
  -H "Content-Type: application/json" \
  -d '{"message": "What is reliable dentistry?"}'
```

**X-Ray Test:**
*Note: Convert image to base64 first.*
```bash
# Linux/Mac
base64 xray.jpg > xray.txt
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("xray.jpg")) | Out-File xray.txt

curl -X POST https://[your-url]-analyze-xray.modal.run \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"$(cat xray.txt)\", \"question\": \"Analyze this image\"}"
```

### Python Test Script
The included `test_endpoints.py` script automatically detects your Modal username:

```bash
# Option 1: Auto-detect (requires Modal CLI)
python scripts/test_endpoints.py

# Option 2: Set username explicitly
export MODAL_USERNAME=your-username
python scripts/test_endpoints.py

# Option 3: Edit the script and replace [YOUR-USERNAME] in MODAL_ENDPOINTS
```

**Manual example** (if you prefer to write your own):
```python
import requests, base64

# Replace [YOUR-USERNAME] with your actual Modal username
# Find it by running: modal profile current
BASE_URL = "https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel"
ENDPOINTS = {
    "health": f"{BASE_URL}-health.modal.run",
    "chat": f"{BASE_URL}-chat.modal.run",
    "xray": f"{BASE_URL}-analyze-xray.modal.run"
}

def check_health():
    res = requests.get(ENDPOINTS["health"])
    print(f"Health: {res.json()}")

def analyze_xray(path):
    with open(path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode()
    res = requests.post(ENDPOINTS["xray"], json={"image": img_b64, "question": "Findings?"})
    print(f"X-Ray Analysis: {res.json()}")

if __name__ == "__main__":
    check_health()
    # analyze_xray("test_xray.jpg")
```

---

## 🛠️ Integration with Next.js

1.  **Add Environment Variables** to `.env.local`:
    
    After deploying, copy your actual endpoint URLs from Modal's output:
    ```bash
    # Replace these with your actual URLs from 'modal deploy' output
    # Find your username with: modal profile current
    MODAL_HEALTH_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-health.modal.run
    MODAL_CHAT_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-chat.modal.run
    MODAL_XRAY_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-analyze-xray.modal.run
    MODAL_ASSESS_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-assess-case.modal.run
    ```

2.  **Create API Client** (`lib/modal-client.ts`):
    ```typescript
    export async function chat(message: string) {
      const res = await fetch(process.env.MODAL_CHAT_ENDPOINT!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      return res.json();
    }
    
    export async function analyzeXray(imageBase64: string, question: string) {
      const res = await fetch(process.env.MODAL_XRAY_ENDPOINT!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, question })
      });
      return res.json();
    }
    ```

---

## 🐛 Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`[YOUR-USERNAME]` in URLs** | Placeholder not replaced. | Run `modal profile current` to get your username, then replace all instances of `[YOUR-USERNAME]` with your actual username. |
| **Test script shows wrong URLs** | Hardcoded username from original author. | Set `export MODAL_USERNAME=your-username` or edit `scripts/test_endpoints.py` to update the `MODAL_ENDPOINTS` dictionary. |
| **`HF_TOKEN not found`** | Missing Modal secret. | Run `modal secret create huggingface-secret HF_TOKEN=...` |
| **`Model access denied`** | Invalid token permissions. | Ensure HF token has "Read" scope and access to the repo. |
| **Slow Response (First)** | Cold start (~45s). | Normal behavior. Subsequent requests take ~1-2s. |
| **OOM (Out of Memory)** | Input too large. | Reduce `max_tokens` or image resolution (max 1024x1024). |

---

## 🔗 References
*   [Modal Documentation](https://modal.com/docs)
*   [DentalGemma HF Model](https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it)
*   [MedGemma Base Model](https://huggingface.co/google/medgemma-1.5-4b-it)
