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
    num_bytes: 527704509
    num_examples: 1488
  - name: validation
    num_bytes: 58870261
    num_examples: 166
  download_size: 585143981
  dataset_size: 586574770
configs:
- config_name: default
  data_files:
  - split: train
    path: data/train-*
  - split: validation
    path: data/validation-*
---

# DentalGemma VQA Dataset

A multimodal Visual Question Answering dataset for fine-tuning MedGemma 1.5 4B IT on dental X-ray analysis — a **novel task** not present in MedGemma's original training data.

## Dataset Details

- **Total samples**: ~1,650 image-text pairs
- **Format**: Chat-format messages (system/user/assistant) with embedded images
- **Splits**: 90% train / 10% validation
- **Image types**: Intraoral X-rays, panoramic (OPG) X-rays, dental radiographs
- **Tasks**: Cavity detection, pathology classification, tooth identification, radiographic assessment

## Sources

| Source | Samples | Task | Image Type |
|--------|---------|------|------------|
| Dental Cavity Detection | ~418 | Cavity/normal detection with counts | Intraoral X-rays |
| Dental OPG Classification | ~517 | 6-class pathology classification | Panoramic OPG |
| Dental Radiography | ~655 | General radiographic assessment | Intraoral X-rays |
| Panoramic Dental Xray | ~64 | Tooth counting & type identification | Panoramic X-rays |

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
dataset = load_dataset("YOUR_ORG/dentalgemma-vqa")
```

## Built For

The [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge) — fine-tuning Google's MedGemma 1.5 for dental diagnostics.

## License

Apache 2.0. Individual source datasets have their own licenses (CC BY 4.0, etc.) — see dataset cards for details.
