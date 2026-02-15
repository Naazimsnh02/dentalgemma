# 🦷 DentalGemma

**Fine-tuning [MedGemma 1.5 4B IT](https://huggingface.co/google/medgemma-1.5-4b-it) for dental diagnostics — a novel domain adaptation for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge).**

MedGemma was **not** trained on dental data, making this a true novel task adaptation. This project builds a complete pipeline — from raw dental datasets to fine-tuned model — adapting Google's medical foundation model for dental X-ray analysis, pathology classification, and clinical case assessment.

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

1. **Curating** 6 diverse dental datasets spanning X-ray analysis, pathology classification, tooth identification, and clinical case assessment
2. **Preprocessing** raw data into standardized HuggingFace datasets with clinically accurate chat-format annotations
3. **Fine-tuning** MedGemma 1.5 4B IT using QLoRA for efficient domain adaptation

### Key Capabilities After Fine-Tuning

| Capability | Description |
|:-----------|:------------|
| 🔍 **Cavity Detection** | Identify and count cavities in intraoral X-rays |
| 🏥 **Pathology Classification** | Classify 6 dental conditions from panoramic X-rays |
| 🦷 **Tooth Identification** | Count and classify tooth types from panoramic radiographs |
| 📋 **Radiographic Assessment** | Systematic evaluation of dental radiographs |
| 💊 **Clinical Case Analysis** | Structured diagnosis and treatment planning from patient histories |

---

## 📁 Project Structure

```
dentalgemma/
├── preprocessing/                    # Data processing pipeline
│   ├── build_dataset.py              # Main orchestrator — builds & pushes both HF datasets
│   ├── process_cavity_detection.py   # YOLOv5-OBB label parsing → VQA pairs
│   ├── process_opg_classification.py # 6-class OPG pathology → VQA pairs
│   ├── process_dental_radiography.py # Deduplication + radiograph assessment VQA
│   ├── process_panoramic.py          # VIA/COCO annotation parsing → VQA pairs
│   ├── process_text_cases.py         # JSONL clinical cases → chat-format instruct data
│   ├── inspect_dataset.py            # Dataset inspection utility
│   ├── README_vqa.md                 # HuggingFace dataset card (VQA)
│   ├── README_instruct.md            # HuggingFace dataset card (Instruct)
│   └── requirements.txt             # Preprocessing dependencies
├── datasets/                         # Raw source datasets (not tracked in git)
│   ├── Dental Cavity Detection Dataset/
│   │   ├── train/
│   │   ├── test/
│   │   ├── valid/
│   │   ├── data.yaml
│   │   ├── README.dataset.txt
│   │   └── README.roboflow.txt
│   ├── Dental OPG Xray Dataset/
│   │   └── Dental OPG (Classification)/  # Dataset 2 (v1)
│   ├── Dental OPG XRAY Dataset (Version 4)/
│   │   └── Dental OPG XRAY Dataset/
│   │       └── Dental OPG XRAY Dataset/
│   │           └── Dental OPG (Classification)/  # Dataset 3 (v4)
│   ├── Dental Radiography/
│   │   ├── train/
│   │   ├── test/
│   │   └── valid/
│   ├── Panoramic Dental Xray Dataset/
│   │   └── Panoramic Dental Xray Dataset/
│   │       ├── firstpart/
│   │       └── secondpart/
│   └── Wildstashdental 2.5k-instruct/
│       └── dental_training_data_v3.jsonl
├── output/                           # Built datasets (not tracked in git)
├── dentalgemma_fine_tune.ipynb       # Fine-tuning notebook (Colab-ready)
└── README.md                         # This file
```

---

## 📊 Datasets

Two curated HuggingFace datasets power the fine-tuning:

### DentalGemma VQA (Multimodal)

🔗 **[naazimsnh02/dentalgemma-vqa](https://huggingface.co/datasets/naazimsnh02/dentalgemma-vqa)**

| Split | Samples |
|:------|--------:|
| Train | 1,488 |
| Validation | 166 |
| **Total** | **1,654** |

**Features:**
- `image` — Dental X-ray (PIL Image)
- `messages` — JSON string of chat-format conversation (system / user[image + text] / assistant)
- `source` — Dataset origin tag
- `condition` — Dental condition label

**Message Format:**
```json
[
  {"role": "system", "content": "You are an expert dental clinician and radiologist AI assistant..."},
  {"role": "user", "content": [
    {"type": "image"},
    {"type": "text", "text": "Analyze this dental X-ray image..."}
  ]},
  {"role": "assistant", "content": "This dental X-ray shows 2 cavity region(s) detected..."}
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

| # | Dataset | Raw Size | Output Samples | Image Type | Task | License |
|:-:|:--------|:---------|:--------------:|:-----------|:-----|:--------|
| 1 | **[Dental Cavity Detection](https://www.kaggle.com/datasets/maazmakhdoom/dental-cavity-detection-dataset)** | 418 images + YOLOv5-OBB labels | ~418 | Intraoral X-rays | Cavity/normal detection with region counts | CC BY-SA 4.0 |
| 2 | **[Dental OPG Classification](https://www.kaggle.com/datasets/imtkaggleteam/dental-opg-xray-dataset)** (v1 + v4, merged & deduped) | 517 images, 6 classes | ~517 | Panoramic OPG | Pathology classification | CC BY-NC-SA 4.0 |
| 3 | **[Dental Radiography](https://www.kaggle.com/datasets/imtkaggleteam/dental-radiography)** (deduped by numeric prefix) | 1,272 → 655 unique | ~655 | Intraoral X-rays | General radiographic assessment | CC BY-NC-SA 4.0 |
| 4 | **[Panoramic Dental Xray](https://www.kaggle.com/datasets/orvile/panoramic-dental-xray-dataset)** (firstpart + secondpart) | 64 images + polygon/COCO annotations | ~64 | Panoramic X-rays | Tooth counting & type identification | CC BY-SA 4.0 |
| 5 | **[dental-2.5k-instruct](https://huggingface.co/datasets/Wildstash/dental-2.5k-instruct)** | 2,494 JSONL cases | 2,494 | Text-only | Clinical case assessment (98 conditions) | Apache 2.0 |

**OPG Classification Classes:** Healthy Teeth, Caries, Impacted Teeth, BDC-BDR (Broken Down Crown/Root), Infection, Fractured Teeth — sourced from 3 dental clinics in Bangladesh.

### Preprocessing Details

Each processor applies domain-specific logic:

- **Cavity Detection** — Parses YOLOv5-OBB (DOTA format) label files to count cavity vs. normal regions per image, generates clinically descriptive answers based on region counts
- **OPG Classification** — Merges v1 and v4 datasets with deduplication (v1 priority), maps folder names to condition-specific clinical descriptions
- **Dental Radiography** — Deduplicates augmented images by numeric filename prefix (keeps first alphabetically), applies systematic radiographic assessment template
- **Panoramic Xray** — Processes VIA polygon annotations (firstpart: tooth counting) and COCO annotations (secondpart: 8 tooth type classes with counts)
- **Text Cases** — Extracts structured fields (patient, demographics, complaints, findings) from JSONL chat data, maps to standardized chat format

All processors use **5–6 varied question templates** per dataset to avoid monotonic training patterns. A consistent **system prompt** is applied across all data:

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
| **Method** | QLoRA (4-bit NF4 quantization + LoRA) |
| **LoRA Rank** | 16 |
| **LoRA Alpha** | 16 |
| **LoRA Dropout** | 0.05 |
| **Target Modules** | All linear layers |
| **Trainable Modules** | `lm_head`, `embed_tokens` |
| **Batch Size** | 1 per device × 4 gradient accumulation steps |
| **Learning Rate** | 2e-4 (linear scheduler) |
| **Epochs** | 3 |
| **Precision** | bfloat16 |
| **Max Sequence Length** | 1024 |
| **Optimizer** | AdamW (fused) |
| **Warmup** | 3% of training steps |
| **Framework** | TRL SFTTrainer + PEFT |

### Running Fine-Tuning

The notebook `dentalgemma_fine_tune.ipynb` is fully Colab-ready:

1. **Open in Google Colab** and select an **A100 GPU** runtime (≥40 GB VRAM required for bfloat16)
2. **Set your HuggingFace token** in Colab Secrets (name: `HF_TOKEN`, needs write access)
3. **Accept MedGemma usage conditions** at [google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it)
4. **Run all cells** — the notebook handles:
   - Loading both DentalGemma datasets from HuggingFace Hub
   - Formatting messages for the chat template
   - Loading the model with 4-bit quantization
   - Training with QLoRA via SFTTrainer
   - Saving and pushing the fine-tuned adapter to HuggingFace Hub
   - Evaluation with sample inference

**Training Pipeline:**
```
DentalGemma VQA dataset (HuggingFace Hub)
    ↓ load & parse messages
MedGemma 1.5 4B IT (4-bit quantized)
    ↓ QLoRA fine-tuning (SFTTrainer)
DentalGemma fine-tuned adapter
    ↓ push to Hub
Inference-ready model
```

---

## 🏗 Model Architecture

DentalGemma builds on MedGemma 1.5 4B IT, which uses:

- **Image Encoder:** SigLIP — processes dental X-ray images into visual embeddings
- **Language Model:** Gemma 3 architecture (4B parameters) — generates clinical text responses
- **Pipeline:** `image-text-to-text` — accepts multimodal input (image + text) and produces text output

The QLoRA adapter adds minimal parameters on top of the frozen 4-bit base model, enabling efficient fine-tuning on consumer GPUs while preserving MedGemma's medical knowledge.

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
