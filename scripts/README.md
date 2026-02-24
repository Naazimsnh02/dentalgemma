# DentalGemma Scripts

This directory contains deployment and testing scripts for the DentalGemma Modal.com backend.

## 📁 Files

- **`modal_dentalgemma.py`** - Main Modal deployment script
- **`test_endpoints.py`** - Comprehensive endpoint testing suite
- **`modal_deployment_guide.md`** - Complete deployment documentation

## 🚀 Quick Start

### 1. Deploy to Modal

```bash
cd scripts
modal deploy modal_dentalgemma.py
```

Modal will output your endpoint URLs. They look like:
```
https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-health.modal.run
https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-chat.modal.run
https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-analyze-xray.modal.run
https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-assess-case.modal.run
```

### 2. Find Your Modal Username

```bash
modal profile current
```

This returns your username (e.g., `johndoe`).

### 3. Test Your Deployment

The test script auto-detects your username:

```bash
# Option 1: Auto-detect
python test_endpoints.py

# Option 2: Set explicitly
export MODAL_USERNAME=your-username
python test_endpoints.py
```

### 4. Update Your Next.js App

Add to `dentalgemma-app/.env.local`:

```bash
MODAL_HEALTH_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-health.modal.run
MODAL_CHAT_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-chat.modal.run
MODAL_XRAY_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-analyze-xray.modal.run
MODAL_ASSESS_ENDPOINT=https://[YOUR-USERNAME]--dentalgemma-dentalgemmamodel-assess-case.modal.run
```

Replace `[YOUR-USERNAME]` with your actual Modal username.

## ⚠️ Important for Cloners

If you cloned this repository, you MUST update the endpoint URLs:

1. **Deploy your own Modal app** (don't use the original author's endpoints)
2. **Get your Modal username**: `modal profile current`
3. **Update URLs** in:
   - `dentalgemma-app/.env.local` (for the Next.js app)
   - `scripts/test_endpoints.py` (set `MODAL_USERNAME` env var or edit the file)

The original hardcoded URLs (`sumaiyanaazim--dentalgemma-...`) will NOT work for you.

## 📖 Full Documentation

See [`modal_deployment_guide.md`](./modal_deployment_guide.md) for complete deployment instructions, troubleshooting, and API documentation.

## 🧪 Testing

The `test_endpoints.py` script tests all endpoints:

- Health check
- Chat (Modal direct + Next.js route)
- Clinical assessment (Modal direct + Next.js route)
- X-ray analysis (Modal direct + Next.js route)
- Symptom checker (Modal direct + Next.js route)
- Research search (PubMed)

It validates response structures match what the UI expects.

## 🔑 Prerequisites

1. **Modal CLI**: `pip install modal`
2. **Modal Auth**: `modal token new`
3. **HuggingFace Token**: `modal secret create huggingface-secret HF_TOKEN=your_token`

## 💡 Tips

- Use `modal run modal_dentalgemma.py` for dev/testing (creates `-dev` endpoints)
- Use `modal deploy modal_dentalgemma.py` for production (creates stable endpoints)
- Check logs: `modal app logs dentalgemma --follow`
- Stop app: `modal app stop dentalgemma`
