# 🦷 DentalGemma Mobile

Offline dental AI assistant running the fine-tuned DentalGemma 1.5 4B IT model entirely on-device using llama.cpp via [llama.rn](https://github.com/mybigday/llama.rn).

## Features

- **Automatic Model Download** — Download models directly from Hugging Face on first launch
- **Fully Offline** — All inference runs on-device, no internet required after model download
- **Core Features**:
  - **Chat Assistant** — Ask questions and get AI-powered dental advice with image analysis
  - **Symptom Checker** — Interactive questionnaire to assess your dental symptoms
  - **Clinical Assessment** — Comprehensive case assessment with AI-powered diagnosis and treatment planning
  - **Image Analysis** — Analyze dental X-rays and photos with AI
  - **Education Portal** — Browse 98 dental conditions and learn about oral health
  - **Dentist Finder** — Find nearby dental professionals with maps and filters
  - **Research Dashboard** — Search PubMed for dental research papers and save for offline reading

## Prerequisites

- Node.js >= 22.11.0
- React Native development environment ([setup guide](https://reactnative.dev/docs/set-up-your-environment))
- Android device with 6+ GB RAM (8+ GB recommended)
- ~3.4 GB storage for model files
- **Windows users:** Enable long path support (see troubleshooting below)

## Setup

### 1. Install Dependencies

```bash
cd dentalgemma-mobile
npm install
```

### 2. Get Model Files

**Option A: Automatic Download (Recommended)**

The app will automatically download model files from Hugging Face on first launch:
- Tap "Download from Hugging Face" button in the app
- Wait for ~3.4 GB download to complete
- Models are cached for offline use

**Option B: Manual Installation**

You can also manually push model files using ADB (see step 4 below).

Required files:

| File | Size | Purpose |
|------|------|---------|
| `dentalgemma-4b-Q4_K_M.gguf` | ~2.5 GB | Quantized text/chat model |
| `dentalgemma-mmproj-f16.gguf` | ~860 MB | SigLIP vision encoder |

Download from: [naazimsnh02/dentalgemma-1.5-4b-it-GGUF](https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it-GGUF)

### 3. Build & Run the App

```bash
# Android - build and install the app
npm run android
```

The app will launch and show the model setup screen.

### 4. Download or Push Models

**Option A: Use In-App Download**
1. Tap "Download from Hugging Face" button
2. Wait for download to complete (~5-20 minutes depending on connection)
3. Tap "Load Model & Start Chat"

**Option B: Manual ADB Push (for offline scenarios)**

After the app has run once, push the model files:

```bash
# Push model files to device
adb push dentalgemma-4b-Q4_K_M.gguf /sdcard/Android/data/com.dentalgemmamobile/files/models/
adb push dentalgemma-mmproj-f16.gguf /sdcard/Android/data/com.dentalgemmamobile/files/models/

# Fix file permissions
adb shell chmod 666 /storage/emulated/0/Android/data/com.dentalgemmamobile/files/models/*.gguf
```

> **Note:** File transfer takes several minutes due to large file sizes (~3.4 GB total).

## Troubleshooting

### Windows: Path Length Error During Build

If you encounter `ninja: error: Filename longer than 260 characters` during Android build:

1. **Enable Windows Long Path Support:**
   - Open PowerShell as Administrator
   - Run: `New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force`
   - Restart your computer

2. **Create a Junction to Shorten Path:**
   ```powershell
   # Create junction at C:\dgm pointing to your project
   New-Item -ItemType Junction -Path "C:\dgm" -Target "C:\path\to\dentalgemma-mobile" -Force
   
   # Build from the shorter path
   cd C:\dgm
   npm run android
   ```

### Model Files Not Detected

If the app shows "Model Files Missing" after pushing files:

1. Verify files are in the correct location:
   ```bash
   adb shell ls -la /storage/emulated/0/Android/data/com.dentalgemmamobile/files/models/
   ```

2. Check file permissions (should be `-rw-rw-rw-`):
   ```bash
   adb shell chmod 666 /storage/emulated/0/Android/data/com.dentalgemmamobile/files/models/*.gguf
   ```

3. Rebuild the app to ensure storage permissions are granted:
   ```bash
   npm run android
   ```

## Architecture

```
src/
├── App.tsx                     # Root component with screen navigation
├── types/                      # Shared TypeScript types
├── screens/                    # Application screens
│   ├── ChatScreen.tsx          # Chat Assistant interface
│   ├── ClinicalAssessmentScreen.tsx # Clinical assessment feature
│   ├── DentistFinderScreen.tsx # Map-based dentist finder
│   ├── EducationScreen.tsx     # Education portal
│   ├── HomeScreen.tsx          # Feature dashboard navigation
│   ├── ImageAnalysisScreen.tsx # X-ray and photo analysis
│   ├── ModelSetupScreen.tsx    # Model file download + load screen
│   ├── ResearchScreen.tsx      # PubMed research dashboard
│   └── SymptomCheckerScreen.tsx# Symptoms questionnaire
├── components/                 # Reusable UI components
│   ├── ChatBubble.tsx          # Message bubble (text + image)
│   ├── ImagePickerButton.tsx   # Camera/gallery picker for images
│   └── ModelStatus.tsx         # Loading progress bar
├── hooks/
│   └── useDentalGemma.ts       # llama.rn integration hook
├── utils/
│   └── modelManager.ts         # Model file path + existence checks
└── constants/
    └── prompts.ts              # System prompt + stop words
```

## Performance

| Metric | Expected |
|--------|----------|
| Model load time | 1 to 3 mins |
| Text inference | 1 to 3 seconds |
| Image inference | 2 to 5 mins |
| RAM usage | ~4-5 GB |

## Tech Stack

- **React Native 0.84** (New Architecture)
- **llama.rn** — llama.cpp bindings for React Native
- **react-native-image-picker** — Camera/gallery access
- **react-native-fs** — File system operations
