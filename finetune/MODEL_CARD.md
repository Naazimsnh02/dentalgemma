---
language:
- en
license: apache-2.0
base_model: google/medgemma-1.5-4b-it
tags:
- medical
- dental
- vision-language
- multimodal
- LoRA
- PEFT
- MedGemma
- dental-diagnostics
- x-ray-analysis
- clinical-reasoning
datasets:
- naazimsnh02/dentalgemma-vqa
- naazimsnh02/dentalgemma-instruct
pipeline_tag: image-text-to-text
widget:
- text: Analyze this dental X-ray for any abnormalities.
  example_title: X-ray Analysis
- text: A 35-year-old patient presents with severe tooth pain. What are the possible
    diagnoses?
  example_title: Clinical Case
library_name: transformers
model-index:
- name: DentalGemma-1.5-4B-IT
  results:
  - task:
      type: image-text-to-text
      name: Dental X-ray Visual Question Answering
    dataset:
      name: dentalgemma-vqa
      type: naazimsnh02/dentalgemma-vqa
    metrics:
    - type: loss
      value: 0.1585
      name: Validation Loss (VQA)
  - task:
      type: text-generation
      name: Dental Clinical Case Assessment
    dataset:
      name: dentalgemma-instruct
      type: naazimsnh02/dentalgemma-instruct
    metrics:
    - type: loss
      value: 0.0224
      name: Validation Loss (Instruct)
---

# 🦷 DentalGemma 1.5 4B IT

**DentalGemma** is a fine-tuned version of [MedGemma 1.5 4B IT](https://huggingface.co/google/medgemma-1.5-4b-it) specialized for dental diagnostics and clinical reasoning. This model represents a novel domain adaptation, as MedGemma was not originally trained on dental data.

Built for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge), DentalGemma demonstrates how medical foundation models can be efficiently adapted to underserved healthcare domains using parameter-efficient fine-tuning.

## 🎯 Model Description

DentalGemma is a multimodal vision-language model that combines:
- **Visual understanding** of dental images (clinical photographs and radiographs)
- **Clinical reasoning** for diagnosis, treatment planning, and patient counseling
- **Structured assessment** following evidence-based dental protocols

The model was fine-tuned using LoRA (Low-Rank Adaptation) in a two-stage training pipeline. Unlike typical QLoRA approaches, this model was trained in **full bfloat16 precision** on an NVIDIA A100 GPU to maximize diagnostic accuracy and avoid quantization artifacts.

1. **Stage 1 (VQA):** Multimodal training on 2,529 dental X-ray image-text pairs
2. **Stage 2 (Instruct):** Text-only training on 2,494 clinical case assessments

### Key Capabilities

| Capability | Description |
|:-----------|:------------|
| 📸 **Clinical Photo Analysis** | Analyze clinical dental photographs for cavity detection, oral health assessment, and severity evaluation with compositionally-varied clinical descriptions |
| 🏥 **Pathology Classification** | Classify 6 dental conditions from panoramic X-rays (Healthy, Caries, Impacted Teeth, BDC-BDR, Infection, Fractured Teeth) with differential diagnosis and urgency assessment |
| 📍 **Location-Aware Diagnosis** | Identify and localize pathological findings in panoramic radiographs using dental region mapping (e.g., "right mandibular region", "anterior maxillary region") |
| 🦷 **Dentition Assessment** | Evaluate dentition completeness, tooth type identification, and anatomical overview from panoramic radiographs with clinical context |
| 📋 **Structured Radiographic Reports** | Generate systematic dental reports with region-specific findings, differential diagnoses, and clinical recommendations |
| 💊 **Clinical Case Analysis** | Comprehensive diagnosis, treatment planning, antibiotic considerations, and follow-up scheduling for 98 dental conditions |

## 📊 Training Data

### DentalGemma VQA (Multimodal)
- **Dataset:** [naazimsnh02/dentalgemma-vqa](https://huggingface.co/datasets/naazimsnh02/dentalgemma-vqa)
- **Samples:** ~2,529 VQA pairs from 4 source datasets (90/10 train/validation split)
- **Format:** Dental images (clinical photographs and radiographs) paired with diverse clinical questions and compositionally-generated expert answers
- **Sources:** 
  - **Clinical Photo Analysis** (~642 pairs from 418 images): Clinical dental photographs with YOLO-OBB annotations for cavity/normal regions. Generates 1-2 questions per image across 5 question types (binary classification, clinical description, severity assessment, image type identification, treatment recommendations).
  - **OPG Classification** (~1,214 pairs from 517 images): Panoramic radiographs in 6 pathology classes (Healthy Teeth, Caries, Impacted teeth, BDC-BDR, Infection, Fractured Teeth). Generates 2-3 questions per image across 5 question types (open-ended diagnosis, yes/no pathology screening, differential diagnosis, clinical urgency, healthy vs abnormal).
  - **Panoramic Dental X-ray** (~128 pairs from 64 images): Panoramic radiographs with VIA polygon annotations (tooth segmentation) and COCO annotations (8 tooth type classes). Generates 2 questions per image focusing on dentition completeness, anatomical overview, and tooth type identification.
  - **OPG Object Detection** (~545 pairs from 232 images): Panoramic radiographs with YOLO bounding box annotations for 6 pathology classes. Generates 2-3 location-aware questions per image by converting normalized bounding box coordinates to dental region descriptions (e.g., "right mandibular region", "anterior maxillary region"). Question types include localized findings, condition presence screening, structured radiographic reports, and region-specific queries.

### DentalGemma Instruct (Text-only)
- **Dataset:** [naazimsnh02/dentalgemma-instruct](https://huggingface.co/datasets/naazimsnh02/dentalgemma-instruct)
- **Samples:** 2,494 clinical cases (2,246 train / 248 validation)
- **Format:** Synthetic clinical case presentations with structured expert assessments
- **Coverage:** 98 unique dental conditions across diverse patient demographics and clinical scenarios
- **Source:** [Wildstash/dental-2.5k-instruct](https://huggingface.co/datasets/Wildstash/dental-2.5k-instruct)
- **Case Structure:** Each case includes patient demographics, chief complaint, clinical findings, radiographic findings, medical history, and a comprehensive structured assessment with diagnosis, management plan, antibiotic considerations, follow-up recommendations, and patient counseling

All data follows a consistent chat template format (system/user/assistant) with a standardized system prompt emphasizing evidence-based assessment and clinical correlation.

## 🚀 Training Procedure

### Fine-Tuning Method: Full bfloat16 LoRA

To ensure the highest fidelity in X-ray analysis, we trained the model in **native bfloat16 precision** without quantization:
- **Base Model:** Loaded in full `bfloat16` (no 4-bit quantization)
- **Adapters:** LoRA (Rank 64, Alpha 64) trained on all linear modules
- **Hardware:** NVIDIA A100 (80GB VRAM)

### Training Hyperparameters

#### Stage 1: VQA Training (Multimodal)

| Parameter | Value |
|:----------|:------|
| **Epochs** | 5 (Stopped early at ~4 due to convergence) |
| **Batch Size** | 1 per device × 4 gradient accumulation |
| **Learning Rate** | 5e-5 (linear scheduler) |
| **Warmup Ratio** | 0.1 |
| **Max Sequence Length** | 1024 |
| **Optimizer** | AdamW (fused) |
| **Precision** | bfloat16 (Full) |
| **LoRA Rank** | 64 |
| **LoRA Alpha** | 64 |
| **LoRA Dropout** | 0.05 |
| **Target Modules** | All linear layers |
| **Max Grad Norm** | 1.0 |
| **Training Time** | ~4 hours |

#### Stage 2: Instruct Training (Text-only)

| Parameter | Value |
|:----------|:------|
| **Epochs** | 5 (Stopped at ~4 due to convergence) |
| **Batch Size** | 2 per device × 4 gradient accumulation |
| **Learning Rate** | 5e-5 (linear scheduler) |
| **Warmup Ratio** | 0.1 |
| **Max Sequence Length** | 1024 |
| **Max Grad Norm** | 1.0 |

### Training Results

#### VQA Training (Stage 1)

| Step | Training Loss | Validation Loss |
|-----:|--------------:|----------------:|
| 100  | 1.5756        | 1.3255          |
| 500  | 0.1846        | 0.1917          |
| 1000 | 0.1611        | 0.1665          |
| 1500 | 0.1408        | 0.1628          |
| 2000 | 0.1466        | 0.1612          |
| **2100** | **0.1339** | **0.1585** (Best) |
| 2300 | 0.1150        | 0.1595          |

*Note: Training was stopped early after Step 2300 as validation loss began to plateau. The checkpoint from Step 2100 was selected as the optimal VQA model.*

**Final VQA Metrics:**
- **Best Validation Loss:** 0.1585
- **Improvement:** Significant reduction from initial loss of ~1.32

#### Instruct Training (Stage 2)

| Step | Training Loss | Validation Loss |
|-----:|--------------:|----------------:|
| 100  | 0.2984        | 0.2111          |
| 200  | 0.0594        | 0.0447          |
| 300  | 0.0131        | 0.0331          |
| 400  | 0.0100        | 0.0293          |
| **500** | **0.0045** | **0.0224** (Best) |
| 600  | 0.0068        | 0.0225          |
| 1000 | 0.0018        | 0.0270          |

*Note: Training was stopped early after Step 1000 as validation loss began to rise. The checkpoint from Step 500 was selected as the final model.*

**Final Instruct Metrics:**
- **Best Validation Loss:** 0.0224 (at step 500)
- **Training Loss at Best Checkpoint:** 0.0045
- **Performance Gain:** Strong convergence with minimal overfitting at optimal step.

### Training Infrastructure

- **GPU:** NVIDIA A100 (80GB VRAM)
- **Framework:** PyTorch 2.x with CUDA 12.8
- **Libraries:** 
  - Transformers (HuggingFace)
  - TRL (SFTTrainer)
  - PEFT (LoRA implementation)

## 💻 Usage

### Installation

```bash
pip install torch torchvision transformers accelerate pillow bitsandbytes
```

### Basic Inference (Multimodal)

```python
from transformers import AutoProcessor, AutoModelForImageTextToText
from PIL import Image
import torch

# Load model and processor
model_id = "naazimsnh02/dentalgemma-1.5-4b-it"
model = AutoModelForImageTextToText.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)
processor = AutoProcessor.from_pretrained(model_id)

# Prepare input
image = Image.open("dental_xray.jpg")
messages = [
    {
        "role": "system",
        "content": [{"type": "text", "text": "You are an expert dental clinician and radiologist AI assistant."}]
    },
    {
        "role": "user",
        "content": [
            {"type": "image", "image": image},
            {"type": "text", "text": "Analyze this dental X-ray for any abnormalities."}
        ]
    }
]

# Generate response
inputs = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
    tokenize=True,
    return_dict=True,
    return_tensors="pt"
).to(model.device)

outputs = model.generate(**inputs, max_new_tokens=300, do_sample=False)
generated_ids = outputs[0][inputs["input_ids"].shape[-1]:]
response = processor.decode(generated_ids, skip_special_tokens=True)
print(response)
```

### Text-Only Inference (Clinical Cases)

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load model and tokenizer
model_id = "naazimsnh02/dentalgemma-1.5-4b-it"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# Prepare clinical case
messages = [
    {
        "role": "system",
        "content": "You are an expert dental clinician and radiologist AI assistant."
    },
    {
        "role": "user",
        "content": "A 35-year-old male presents with severe throbbing pain in the lower right molar region for 3 days. Clinical exam shows deep carious lesion on tooth #46 with tenderness to percussion. Periapical radiograph shows periapical radiolucency. Patient has no significant medical history. What is your assessment and management plan?"
    }
]

# Generate response
inputs = tokenizer.apply_chat_template(messages, return_tensors="pt", add_generation_prompt=True).to(model.device)
outputs = model.generate(inputs, max_new_tokens=512, do_sample=False)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(response)
```

## 🏗️ Model Architecture

DentalGemma inherits the architecture from MedGemma 1.5 4B IT:

- **Image Encoder:** SigLIP — processes dental X-ray images into visual embeddings
- **Language Model:** Gemma 3 architecture (4B parameters) — generates clinical text responses
- **Modality Fusion:** Cross-attention mechanism for image-text integration
- **Context Length:** 8,192 tokens
- **Vocabulary Size:** 256,000 tokens

The LoRA fine-tuning adds trainable adapters (rank 64) to all linear layers. The final model merges these adapters back into the full-precision base weights for optimal inference performance.

## 📈 Evaluation

### Qualitative Assessment

The model demonstrates strong performance on:
- **Clinical photo analysis** with accurate cavity detection and severity assessment
- **Pathology classification** from panoramic radiographs across 6 condition classes
- **Location-aware diagnosis** with anatomical region identification (e.g., "right mandibular region")
- **Structured clinical reasoning** following dental protocols with differential diagnoses
- **Treatment planning** with appropriate antibiotic considerations and urgency assessment
- **Compositional answer generation** producing varied, natural-sounding clinical descriptions

### Quantitative Metrics

**VQA Training (Stage 1):**
- Best Validation Loss: 0.1585 (at step 2100)
- Training converged after ~4 epochs
- Significant improvement from initial loss of ~1.32

**Instruct Training (Stage 2):**
- Best Validation Loss: 0.0224 (at step 500)
- ~50% reduction in error compared to previous QLoRA runs (old best: 0.0435)
- Training converged after ~2 epochs

### Limitations

- **Not a diagnostic tool:** This model is for research and educational purposes only. All AI-generated assessments must be validated by licensed dental professionals.
- **Training data bias:** Performance may vary on X-ray types or clinical scenarios not well-represented in training data (e.g., bitewing radiographs, periapical films).
- **Hallucination risk:** Like all LLMs, the model may occasionally generate plausible-sounding but incorrect information.
- **No real-time validation:** The model cannot verify its outputs against current clinical guidelines or patient-specific contraindications.
- **Location accuracy:** Dental region mapping from bounding boxes is approximate and should not be used for surgical planning without clinical verification.

## ⚠️ Ethical Considerations & Disclaimer

### Intended Use

- **Research and education** in dental AI applications
- **Proof-of-concept** for domain adaptation of medical foundation models
- **Development tool** for building dental diagnostic assistants

### Out-of-Scope Use

- **Direct clinical diagnosis** without professional oversight
- **Replacement** for licensed dental professionals
- **Treatment decisions** without clinical validation
- **Use in regulated medical devices** without appropriate certification

### Disclaimer

**This model is NOT a substitute for professional dental diagnosis.** All AI-generated assessments must be validated by licensed dental professionals before any clinical use. The model is provided "as-is" for research purposes only.

## 📜 License

- **Model License:** Apache 2.0
- **Base Model:** [MedGemma 1.5 4B IT](https://huggingface.co/google/medgemma-1.5-4b-it) (Gemma Terms of Use)
- **Training Data:** See individual dataset licenses
  - Dental Cavity Detection: CC BY-SA 4.0
  - Dental OPG Classification: CC BY-NC-SA 4.0
  - Panoramic Dental X-ray: CC BY-SA 4.0
  - Dental OPG Object Detection: CC BY-NC-SA 4.0
  - dental-2.5k-instruct: Apache 2.0

## 🏆 Competition Context

This model was developed for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge).

## 📚 Citation

If you use DentalGemma in your research, please cite:

```bibtex
@misc{dentalgemma2026,
  title={DentalGemma: Fine-tuning MedGemma for Dental Diagnostics},
  author={Syed Naazim Hussain},
  year={2026},
  publisher={HuggingFace},
  howpublished={\url{https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it}},
  note={MedGemma Impact Challenge submission}
}
```

**Base Model Citation:**
```bibtex
@misc{medgemma2024,
  title={MedGemma: Medical Foundation Models from Google Health},
  author={Google Health AI},
  year={2024},
  publisher={HuggingFace},
  howpublished={\url{https://huggingface.co/google/medgemma-1.5-4b-it}}
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

## 🔗 Links

- **Model:** [naazimsnh02/dentalgemma-1.5-4b-it](https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it)
- **VQA Dataset:** [naazimsnh02/dentalgemma-vqa](https://huggingface.co/datasets/naazimsnh02/dentalgemma-vqa)
- **Instruct Dataset:** [naazimsnh02/dentalgemma-instruct](https://huggingface.co/datasets/naazimsnh02/dentalgemma-instruct)
- **Base Model:** [google/medgemma-1.5-4b-it](https://huggingface.co/google/medgemma-1.5-4b-it)
- **Competition:** [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge)
- **Code Repository:** [GitHub](https://github.com/naazimsnh02/dentalgemma)

## 🙏 Acknowledgments

- **Google Health AI** for releasing MedGemma and organizing the Impact Challenge
- **Dataset creators** for providing high-quality dental imaging and clinical data
- **HuggingFace** for the Transformers, TRL, and PEFT libraries
- **Kaggle** for hosting the competition platform

---

<div align="center">

**Built for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge) 🏥**

*Bringing dental diagnostics into the age of medical foundation models* 🦷

</div>