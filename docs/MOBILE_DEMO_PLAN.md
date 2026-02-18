# 🦷 DentalGemma — Offline Mobile Demo Plan

> **Goal:** Build a sample demo mobile app that runs the finetuned DentalGemma 1.5 4B IT model
> entirely offline on a smartphone, with chat + dental X-ray image analysis.

---

## 1. Model Conversion (GGUF)

### Why GGUF?

As of February 2026, GGUF via llama.cpp is the **only** path that supports
**Gemma 3 4B multimodal (text + vision)** inference on mobile. Alternatives
like MediaPipe LLM Inference and React Native ExecuTorch are text-only for
Gemma 3 architecture.

### Conversion Pipeline

```
naazimsnh02/dentalgemma-1.5-4b-it (HuggingFace, ~9 GB safetensors)
    │
    ├──► convert_hf_to_gguf.py ──► dentalgemma-4b-bf16.gguf (~7.8 GB)
    │        │
    │        └──► llama-quantize ──► dentalgemma-4b-Q4_K_M.gguf (~2.5 GB)  ✅ Main model
    │
    └──► gemma3_convert_encoder_to_gguf.py ──► dentalgemma-mmproj-f16.gguf (~860 MB)  ✅ Vision encoder
```

### Output Files for Mobile

| File | Size | Purpose |
|------|------|---------|
| `dentalgemma-4b-Q4_K_M.gguf` | ~2.5 GB | Quantized text/chat model (Gemma 3 4B) |
| `dentalgemma-mmproj-f16.gguf` | ~860 MB | SigLIP vision encoder for X-ray images |
| **Total** | **~3.4 GB** | Both needed for multimodal inference |

### Conversion Environment

- **Where:** Google Colab (T4 GPU, free tier sufficient)
- **Notebook:** `scripts/convert_dentalgemma_to_gguf.ipynb`
- **Time:** ~15-25 minutes
- **Note:** Requires a tokenizer hash patch for MedGemma 1.5 (included in notebook)

### Quantization Options

| Quantization | Text Model Size | Quality | Target Devices |
|---|---|---|---|
| Q4_K_M ⭐ | ~2.5 GB | Good — recommended | Flagships (8+ GB RAM) |
| Q3_K_M | ~2.1 GB | Acceptable | Mid-range (6+ GB RAM) |
| Q8_0 | ~4.1 GB | Near-lossless | High-end only (12+ GB) |

---

## 2. Mobile App Architecture

### Framework: React Native + llama.rn

**Why React Native?**
- Cross-platform (iOS + Android) from single codebase
- [`llama.rn`](https://github.com/mybigday/llama.rn) provides a mature llama.cpp
  wrapper with multimodal support (`completionWithImage()`)
- Avoids writing custom JNI/Obj-C++ bridges

### App Structure

```
dentalgemma-mobile/
├── android/                    # Native Android project
├── ios/                        # Native iOS project
├── src/
│   ├── App.tsx                 # Root navigator
│   ├── screens/
│   │   ├── ChatScreen.tsx      # Main chat interface
│   │   └── ModelSetupScreen.tsx # Download/load model files
│   ├── components/
│   │   ├── ChatBubble.tsx      # Message bubble (text + image)
│   │   ├── ImagePicker.tsx     # Camera/gallery picker for X-rays
│   │   └── ModelStatus.tsx     # Loading progress indicator
│   ├── hooks/
│   │   └── useDentalGemma.ts   # llama.rn integration hook
│   ├── utils/
│   │   └── modelManager.ts     # Download, cache, load GGUF files
│   └── constants/
│       └── prompts.ts          # System prompt & chat templates
├── assets/                     # App icons, splash screen
├── models/                     # GGUF files (gitignored, downloaded at runtime)
├── package.json
└── README.md
```

### Key Technical Decisions

| Decision | Choice | Reasoning |
|---|---|---|
| Framework | React Native | Cross-platform, `llama.rn` has multimodal support |
| LLM runtime | llama.cpp via `llama.rn` | Only option for Gemma 3 vision on mobile |
| Model format | GGUF Q4_K_M | Best quality/size tradeoff at ~2.5 GB |
| Model delivery | Download on first launch | 3.4 GB is too large to bundle in APK/IPA |
| Image input | Camera + gallery | Dental X-ray photos or saved images |

---

## 3. Core Features (MVP Demo)

### 3.1 Chat with DentalGemma
- Multi-turn conversation with dental AI assistant
- System prompt: *"You are an expert dental clinician and radiologist AI assistant..."*
- Streaming text generation (token by token)

### 3.2 Dental X-ray Analysis
- Pick image from camera or gallery
- Send image with text prompt to model
- Model analyzes X-ray and returns findings (cavity detection, pathology, etc.)

### 3.3 Model Management
- First-launch download of GGUF files (~3.4 GB)
- Progress indicator during download
- Model loading indicator (~10-15s on flagship phones)
- Persistent local storage (no re-download needed)

---

## 4. Device Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| RAM | 6 GB | 8+ GB |
| Storage | 4 GB free | 6+ GB free |
| OS | Android 10+ / iOS 15+ | Android 13+ / iOS 17+ |
| Devices | Pixel 7, iPhone 14 | Pixel 8 Pro, iPhone 15 Pro+, Samsung S24+ |

### Performance Expectations

| Metric | Expected |
|---|---|
| Model load time | 10-15 seconds |
| Text generation speed | 5-15 tokens/second (device dependent) |
| Image encoding (SigLIP) | 2-5 seconds per image |
| RAM usage at runtime | ~4-5 GB |

---

## 5. Implementation Phases

### Phase 1: Model Conversion ✅ (In Progress)
- [x] Research on-device inference landscape (Feb 2026)
- [x] Create Colab conversion notebook
- [x] Patch tokenizer hash for MedGemma 1.5
- [ ] Run conversion successfully and download GGUF files
- [ ] Verify inference with llama-mtmd-cli

### Phase 2: App Scaffolding
- [ ] Initialize React Native project
- [ ] Install and configure `llama.rn`
- [ ] Implement model download + caching (modelManager.ts)
- [ ] Build model loading hook (useDentalGemma.ts)

### Phase 3: Chat UI
- [ ] Build ChatScreen with message list
- [ ] Implement streaming text generation
- [ ] Add system prompt for dental context
- [ ] Handle multi-turn conversation history

### Phase 4: Image Support
- [ ] Add ImagePicker (camera + gallery)
- [ ] Integrate `completionWithImage()` from llama.rn
- [ ] Display inline image previews in chat
- [ ] Test with dental X-ray images

### Phase 5: Polish & Demo
- [ ] Loading states and error handling
- [ ] App icon and splash screen (dental theme)
- [ ] Build APK for Android demo
- [ ] Record demo video

---

## 6. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Model too large for device RAM | App crashes / OOM | Offer Q3_K_M fallback (~2.1 GB); limit context length |
| Slow inference on mid-range phones | Poor UX | Stream tokens; show "thinking" indicator; target flagships for demo |
| llama.rn mmproj/vision issues | Blocked on image support | Fall back to text-only chat; file issue upstream |
| 3.4 GB download on mobile data | Users won't download | Require Wi-Fi; show size warning; allow model file sideloading |
| Gemma 3 vision quality after quantization | Degraded X-ray analysis | Test multiple quant levels; use Q5_K_M if Q4 quality is insufficient |

---

## 7. References

- **Model:** [naazimsnh02/dentalgemma-1.5-4b-it](https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it)
- **llama.cpp:** [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)
- **llama.rn:** [mybigday/llama.rn](https://github.com/mybigday/llama.rn)
- **Gemma 3 GGUF (reference):** [ggml-org/gemma-3](https://huggingface.co/collections/ggml-org/gemma-3)
- **MedGemma 1.5 GGUF (reference):** [unsloth/medgemma-1.5-4b-it-GGUF](https://huggingface.co/unsloth/medgemma-1.5-4b-it-GGUF)
- **MediaPipe LLM Inference:** [Google AI Edge Docs](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference)
- **Conversion Notebook:** `scripts/convert_dentalgemma_to_gguf.ipynb`
