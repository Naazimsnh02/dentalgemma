---
language:
  - en
license: apache-2.0
task_categories:
  - visual-question-answering
  - image-text-to-text
tags:
  - dental
  - medical
  - radiology
  - x-ray
  - medgemma
  - healthcare
  - vqa
  - fine-tuning
size_categories:
  - 1K<n<10K
dataset_info:
  features:
  - name: image
    dtype: image
  - name: messages
    dtype: string
  - name: source
    dtype: string
  - name: condition
    dtype: string
  splits:
  - name: train
    num_bytes: 852704509
    num_examples: 2276
  - name: validation
    num_bytes: 94870261
    num_examples: 253
  download_size: 945143981
  dataset_size: 947574770
configs:
- config_name: default
  data_files:
  - split: train
    path: data/train-*
  - split: validation
    path: data/validation-*
---

# DentalGemma VQA Dataset

A specialized multimodal VQA dataset for adapting MedGemma 1.5 4B IT to dental image analysis tasks across radiographs and clinical imagery.

## Dataset Details

- **Total samples**: ~2,529 image-text pairs
- **Format**: Chat-format messages (system/user/assistant) with embedded images
- **Splits**: 90% train / 10% validation
- **Image types**: Clinical dental photos, panoramic (OPG) X-rays
- **Tasks**: Cavity detection, pathology classification, tooth identification, localized pathology detection

## Sources

| Source | Samples | Task | Image Type |
|--------|---------|------|------------|
| Dental Cavity Detection | 642 | Cavity/normal detection with counts | Clinical Photographs |
| Dental OPG Classification | 1,214 | 6-class pathology classification | Panoramic OPG |
| Panoramic Dental Xray | 128 | Tooth counting & type identification | Panoramic X-rays |
| OPG Object Detection | 545 | 6-class localized pathology detection | Panoramic OPG |

## Message Format

Each row has a `messages` field (JSON string) compatible with HuggingFace's chat template:

```json
[
  {"role": "system", "content": "You are an expert dental clinician..."},
  {"role": "user", "content": [
    {"type": "image"},
    {"type": "text", "text": "Analyze this dental X-ray..."}
  ]},
  {"role": "assistant", "content": "This dental X-ray shows..."}
]
```

## Usage with MedGemma

```python
from datasets import load_dataset
dataset = load_dataset("naazimsnh02/dentalgemma-vqa")
```

## Built For

The [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge) — fine-tuning Google's MedGemma 1.5 for dental diagnostics.

## License

Apache 2.0
