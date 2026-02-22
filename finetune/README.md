# 🦷 DentalGemma

**Fine-tuning [MedGemma 1.5 4B IT](https://huggingface.co/google/medgemma-1.5-4b-it) for dental diagnostics — a novel domain adaptation for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge).**

MedGemma was **not** trained on dental data, making this a true novel task adaptation. This project builds a complete pipeline — from raw dental datasets to fine-tuned model — adapting Google's medical foundation model for dental image analysis (radiographs and clinical photos), pathology classification, and clinical case assessment using full-precision LoRA fine-tuning.

[![HuggingFace VQA Dataset](https://img.shields.io/badge/🤗%20Dataset-dentalgemma--vqa-blue)](https://huggingface.co/datasets/naazimsnh02/dentalgemma-vqa)
[![HuggingFace Instruct Dataset](https://img.shields.io/badge/🤗%20Dataset-dentalgemma--instruct-blue)](https://huggingface.co/datasets/naazimsnh02/dentalgemma-instruct)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/downloads/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Project Structure](#-project-structure)
- [Datasets](#-datasets)
  - [DentalGemma VQA (Multimodal)](#dentalgemma-vqa-multimodal)
  - [DentalGemma Instruct (Text-only)](#dentalgemma-instruct-text-only)
- [Data Pipeline](#-data-pipeline)
  - [Source Datasets](#source-datasets)
  - [Preprocessing Details](#preprocessing-details)
  - [Running the Pipeline](#running-the-pipeline)
- [Fine-Tuning](#-fine-tuning)
  - [Approach](#approach)
  - [Running Fine-Tuning](#running-fine-tuning)
- [Model Architecture](#-model-architecture)
- [License & Disclaimer](#-license--disclaimer)
- [Citation](#-citation)

---

## 🎯 Overview

Dental diagnostics remains an underserved domain in medical AI. While MedGemma excels at general medical imaging tasks, it has no exposure to dental-specific data. **DentalGemma** bridges this gap by:

1. **Curating** 5 diverse dental datasets spanning radiography, clinical photography, pathology classification, object detection, and clinical case assessment
2. **Preprocessing** raw data into standardized HuggingFace datasets with clinically accurate chat-format annotations
3. **Fine-tuning** MedGemma 1.5 4B IT using full bfloat16 LoRA with critical fixes for label masking and image preprocessing

### Key Capabilities After Fine-Tuning

| Capability | Description |
|:-----------|:------------|
| 📸 **Clinical Photo Analysis** | Analyze clinical dental photographs for cavity detection, oral health assessment, and severity evaluation with compositionally-varied clinical descriptions |
| 🏥 **Pathology Classification** | Classify 6 dental conditions from panoramic X-rays (Healthy, Caries, Impacted Teeth, BDC-BDR, Infection, Fractured Teeth) with differential diagnosis and urgency assessment |
| 📍 **Location-Aware Diagnosis** | Identify and localize pathological findings in panoramic radiographs using dental region mapping (e.g., "right mandibular region", "anterior maxillary region") |
| 🦷 **Dentition Assessment** | Evaluate dentition completeness, tooth type identification, and anatomical overview from panoramic radiographs with clinical context |
| 📋 **Structured Radiographic Reports** | Generate systematic dental reports with region-specific findings, differential diagnoses, and clinical recommendations |
| 💊 **Clinical Case Analysis** | Comprehensive diagnosis, treatment planning, antibiotic considerations, and follow-up scheduling for 98 dental conditions |

---

## 📁 Project Structure

finetune/
├── preprocessing/                    # Data processing pipeline
│   ├── build_dataset.py              # Main orchestrator — builds & pushes both HF datasets
│   ├── process_cavity_detection.py   # Clinical photo analysis with compositional answers
│   ├── process_opg_classification.py # 6-class OPG pathology with differential diagnosis
│   ├── process_panoramic.py          # Dentition assessment with clinical context
│   ├── process_opg_detection.py      # Location-aware diagnosis with region mapping
│   ├── process_text_cases.py         # JSONL clinical cases → chat-format instruct data
│   ├── answer_builder.py             # Compositional answer generation utility
│   ├── inspect_dataset.py            # Dataset inspection utility
│   ├── export_to_csv.py              # Export utility
│   └── requirements.txt              # Preprocessing dependencies
├── datasets/                         # Raw source datasets (not tracked in git)
│   ├── Dental Cavity Detection Dataset/
│   │   ├── train/
│   │   ├── test/
│   │   ├── valid/
│   │   ├── data.yaml
│   │   ├── README.dataset.txt
│   │   └── README.roboflow.txt
│   ├── Dental OPG Xray Dataset/
│   │   ├── Dental OPG (Classification)/  # Dataset 2 (v1)
│   │   └── Dental OPG (Object Detection)/  # Dataset 4 (NEW)
│   ├── Dental OPG XRAY Dataset (Version 4)/
│   │   └── Dental OPG XRAY Dataset/
│   │       └── Dental OPG XRAY Dataset/
│   │           └── Dental OPG (Classification)/  # Dataset 3 (v4)
│   ├── Panoramic Dental Xray Dataset/
│   │   └── Panoramic Dental Xray Dataset/
│   │       ├── firstpart/
│   │       └── secondpart/
│   └── Wildstashdental 2.5k-instruct/
│       └── dental_training_data_v3.jsonl
├── output/                           # Built datasets (not tracked in git)
├── dentalgemma-fine-tune.ipynb       # Fine-tuning notebook (Latest version with bfloat16 LoRA)
├── dentalgemma_validation.ipynb      # Validation and inference notebook
└── README.md                         # This file
```

---

## 📊 Datasets

Two curated HuggingFace datasets power the fine-tuning:

### DentalGemma VQA (Multimodal)

🔗 **[naazimsnh02/dentalgemma-vqa](https://huggingface.co/datasets/naazimsnh02/dentalgemma-vqa)**

| Split | Samples |
|:------|--------:|
| Train | ~2,276 |
| Validation | ~253 |
| **Total** | **~2,529** |

**Features:**
- `image` — Dental image (Clinical photograph or Radiograph)
- `messages` — JSON string of chat-format conversation (system / user[image + text] / assistant)
- `source` — Dataset origin tag
- `condition` — Dental condition label

**Key Innovation:** Compositional answer generation ensures high answer diversity — same-condition images receive different-sounding clinical descriptions by randomly combining intro sentences, findings, clinical context, and recommendations (560+ unique combinations per condition).

**Message Format:**
```json
[
  {"role": "system", "content": "You are an expert dental clinician and radiologist AI assistant..."},
  {"role": "user", "content": [
    {"type": "image"},
    {"type": "text", "text": "Analyze this dental image..."}
  ]},
  {"role": "assistant", "content": "This clinical photograph shows visible signs of dental caries. The extent of decay suggests the need for restorative intervention..."}
]
```

### DentalGemma Instruct (Text-only)

🔗 **[naazimsnh02/dentalgemma-instruct](https://huggingface.co/datasets/naazimsnh02/dentalgemma-instruct)**

| Split | Samples |
|:------|--------:|
| Train | 2,244 |
| Validation | 250 |
| **Total** | **2,494** |

**Features:**
- `messages` — JSON string of chat-format conversation (system / user / assistant)
- `source` — Dataset origin tag
- `condition` — Dental condition (98 unique conditions)

Each case includes structured clinical information: patient demographics, chief complaint, clinical/radiographic findings, medical history, and a comprehensive assessment with diagnosis, management plan, antibiotic considerations, follow-up, and patient counseling.

---

## 🔧 Data Pipeline

### Source Datasets

| Dataset | Raw Images | Output VQA Pairs | Image Type | Task | License |
|:--------|:-----------|:----------------:|:-----------|:-----|:--------|
| **[Dental Cavity Detection](https://www.kaggle.com/datasets/maazmakhdoom/dental-cavity-detection-dataset)** | 418 | ~642 | Clinical Photographs | Cavity/normal detection with clinical reasoning | CC BY-SA 4.0 |
| **[Dental OPG Classification](https://www.kaggle.com/datasets/imtkaggleteam/dental-opg-xray-dataset)** (v1 + v4, merged & deduped) | 517 | ~1,214 | Panoramic OPG | 6-class pathology classification with differential diagnosis | CC BY-NC-SA 4.0 |
| **[Panoramic Dental Xray](https://www.kaggle.com/datasets/orvile/panoramic-dental-xray-dataset)** (firstpart + secondpart) | 64 | ~128 | Panoramic X-rays | Dentition completeness & tooth type identification | CC BY-SA 4.0 |
| **[Dental OPG Object Detection](https://www.kaggle.com/datasets/imtkaggleteam/dental-opg-xray-dataset)** (same source as Classification) | 232 | ~545 | Panoramic OPG | Location-aware pathology detection with region mapping | CC BY-NC-SA 4.0 |
| **[dental-2.5k-instruct](https://huggingface.co/datasets/Wildstash/dental-2.5k-instruct)** | N/A (text-only) | 2,494 | Text-only | Clinical case assessment (98 conditions) | Apache 2.0 |

**Note:** Each image generates 1-3 VQA pairs using diverse question types, resulting in ~2,529 total VQA pairs from ~1,231 unique images.

**OPG Classification Classes:** Healthy Teeth, Caries, Impacted Teeth, BDC-BDR (Broken Down Crown/Root), Infection, Fractured Teeth — sourced from 3 dental clinics in Bangladesh.

### Preprocessing Details

Each processor applies domain-specific logic with compositional answer generation:

- **Clinical Photo Analysis** (was Cavity Detection) — Parses YOLOv5-OBB (DOTA format) label files to count cavity vs. normal regions. Generates 1-2 questions per image across 5 question types: binary classification, clinical description, severity assessment, image type identification, and treatment recommendations.

- **OPG Classification** — Merges v1 and v4 datasets with deduplication (v1 priority). Generates 2-3 questions per image across 5 question types: open-ended diagnosis, yes/no pathology screening, differential diagnosis, clinical urgency, and healthy vs abnormal classification. **Compositional answers replace static one-answer-per-class templates**, ensuring same-class images get different-sounding descriptions.

- **Panoramic Xray** — Processes VIA polygon annotations (firstpart: tooth segmentation) and COCO annotations (secondpart: 8 tooth type classes). Generates 2 questions per image focusing on dentition completeness, anatomical overview, and tooth type identification.

- **OPG Object Detection** — Parses YOLO bounding box annotations for 6 pathology classes. **Converts normalized bounding box coordinates to dental region descriptions** (e.g., "right mandibular region", "anterior maxillary region") using anatomical mapping. Generates 2-3 location-aware questions per image: localized findings, condition presence screening, structured radiographic reports, and region-specific queries.

- **Text Cases** — Extracts structured fields (patient, demographics, complaints, findings) from JSONL chat data, maps to standardized chat format with comprehensive clinical assessments.

All processors use **4–6 varied question templates** per dataset to avoid monotonic training patterns. A consistent **system prompt** is applied across all data:

> *"You are an expert dental clinician and radiologist AI assistant. Analyze dental images and clinical information to provide accurate, evidence-based assessments. Always recommend clinical correlation and professional evaluation for definitive diagnosis."*

### Running the Pipeline

```bash
# Install dependencies
cd preprocessing
pip install -r requirements.txt

# Build datasets locally
python build_dataset.py

# Build and push to HuggingFace Hub
python build_dataset.py --push YOUR_HF_USERNAME
```

**Requirements:** `Pillow>=10.0.0`, `datasets>=2.14.0`, `tqdm>=4.65.0`, `PyYAML>=6.0`

Raw datasets should be placed under `datasets/` following the directory structure expected by each processor (see `build_dataset.py` for exact paths).

---

## 🚀 Fine-Tuning

### Approach

| Parameter | Value |
|:----------|:------|
| **Base Model** | `google/medgemma-1.5-4b-it` |
| **Method** | LoRA (Full bfloat16 precision, no quantization) |
| **LoRA Rank** | 64 |
| **LoRA Alpha** | 64 |
| **LoRA Dropout** | 0.05 |
| **Target Modules** | All linear layers |
| **Batch Size (VQA)** | 1 per device × 4 gradient accumulation steps |
| **Batch Size (Instruct)** | 2 per device × 4 gradient accumulation steps |
| **Learning Rate** | 5e-5 (linear scheduler) |
| **Epochs** | 10 per stage (early stopping applied) |
| **Precision** | Full bfloat16 (no quantization) |
| **Max Sequence Length** | 1024 |
| **Optimizer** | AdamW (fused) |
| **Warmup Ratio** | 10% of training steps |
| **Max Grad Norm** | 1.0 |
| **Framework** | TRL SFTTrainer + PEFT |

### Key Training Improvements

- **Image Padding:** Enabled padding to square before resize (preserves aspect ratios, fixes distortion)
- **Higher LoRA Rank:** Increased from 16→64 for better model capacity
- **Lower Learning Rate:** Reduced from 2e-4→5e-5 with longer warmup for stability
- **Early Stopping:** Best checkpoints selected based on validation loss (VQA: step 2100, Instruct: step 700)

### Running Fine-Tuning

The notebook `dentalgemma-fine-tune.ipynb` is fully Colab-ready:

1. **Open in Google Colab** and select an **A100 GPU** runtime (≥40 GB VRAM required for full bfloat16)
2. **Set your HuggingFace token** in Colab Secrets (name: `HF_TOKEN`, needs write access)
3. **Accept MedGemma usage conditions** at [google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it)
4. **Run all cells** — the notebook handles:
   - Loading both DentalGemma datasets from HuggingFace Hub
   - Formatting messages for the chat template
   - Loading the model in full bfloat16 precision (no quantization)
   - Two-stage training with LoRA via SFTTrainer (VQA → Instruct)
   - Selecting best checkpoints based on validation loss
   - Merging LoRA adapters with base model
   - Pushing the fine-tuned model to HuggingFace Hub
   - Evaluation with sample inference

**Training Pipeline:**
```
Stage 1: VQA Training (Multimodal)
DentalGemma VQA dataset (HuggingFace Hub)
    ↓ load & parse messages with label masking
MedGemma 1.5 4B IT (full bfloat16)
    ↓ LoRA fine-tuning (SFTTrainer, 10 epochs)
    ↓ early stopping at step 2100 (val loss: 0.1585)
Stage 1 adapted checkpoint

Stage 2: Instruct Training (Text-only)
DentalGemma Instruct dataset (HuggingFace Hub)
    ↓ load & parse messages with label masking
Stage 1 adapted checkpoint
    ↓ LoRA fine-tuning (SFTTrainer, 10 epochs)
    ↓ early stopping at step 500 (val loss: 0.0224)
Final LoRA adapter
    ↓ merge with base model
    ↓ push to Hub
DentalGemma 1.5 4B IT (inference-ready)
```

---

## 🏗 Model Architecture

DentalGemma builds on MedGemma 1.5 4B IT, which uses:

- **Image Encoder:** SigLIP — processes dental X-ray images into visual embeddings
- **Language Model:** Gemma 3 architecture (4B parameters) — generates clinical text responses
- **Pipeline:** `image-text-to-text` — accepts multimodal input (image + text) and produces text output

The LoRA adapters (rank 64) add trainable parameters on top of the full-precision base model, enabling high-quality fine-tuning while preserving MedGemma's medical knowledge. The final model merges these adapters back into the base weights for deployment.

---

## ⚖ License & Disclaimer

**License:** Apache 2.0

Individual source datasets have their own licenses (CC BY 4.0, etc.) — refer to each dataset's original page for details. The Wildstash dental-2.5k-instruct dataset is Apache 2.0 licensed.

**⚠️ Disclaimer:** This project is for research and educational purposes only. It is **not** a substitute for professional dental diagnosis. AI-generated assessments must always be validated by licensed dental professionals before any clinical use.

---

## 📚 Citation

If you use DentalGemma in your research, please cite:

```bibtex
@misc{dentalgemma2026,
  title={DentalGemma: Fine-tuning MedGemma for Dental Diagnostics},
  author={Naazim},
  year={2026},
  howpublished={\url{https://github.com/naazimsnh02/dentalgemma}},
  note={MedGemma Impact Challenge submission}
}
```

**Challenge Citation:**
```bibtex
@misc{medgemma-impact-challenge,
  author={Fereshteh Mahvar and Yun Liu and Daniel Golden and others},
  title={The MedGemma Impact Challenge},
  year={2026},
  howpublished={\url{https://kaggle.com/competitions/med-gemma-impact-challenge}}
}
```

---

<div align="center">

**Built for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge) 🏥**

*Bringing dental diagnostics into the age of medical foundation models* 🦷

</div>
