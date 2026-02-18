---
language:
  - en
license: apache-2.0
task_categories:
  - text-generation
  - question-answering
tags:
  - dental
  - medical
  - healthcare
  - medgemma
  - clinical-cases
  - instruction-tuning
  - fine-tuning
size_categories:
  - 1K<n<10K
dataset_info:
  features:
  - name: messages
    dtype: string
  - name: source
    dtype: string
  - name: condition
    dtype: string
  splits:
  - name: train
    num_bytes: 5197475
    num_examples: 2246
  - name: validation
    num_bytes: 575072
    num_examples: 248
  download_size: 968173
  dataset_size: 5736919
configs:
- config_name: default
  data_files:
  - split: train
    path: data/train-*
  - split: validation
    path: data/validation-*
---

# DentalGemma Instruct Dataset

A text-only instruction-tuning dataset of 2,494 synthetic dental clinical cases for fine-tuning MedGemma 1.5 4B IT on dental diagnosis and treatment planning.

## Dataset Details

- **Total samples**: 2,494 clinical cases
- **Format**: Chat-format messages (system/user/assistant)
- **Splits**: 2,246 Train / 248 Validation
- **Conditions covered**: 98 unique dental conditions
- **Source**: [Wildstash/dental-2.5k-instruct](https://huggingface.co/datasets/Wildstash/dental-2.5k-instruct)

## Message Format

```json
[
  {"role": "system", "content": "You are an expert dental clinician..."},
  {"role": "user", "content": "Please evaluate this dental patient:\n\nPATIENT: ..."},
  {"role": "assistant", "content": "## Patient Assessment\n\n**Diagnosis:** ..."}
]
```

## Case Structure

Each case includes: demographics, chief complaint, clinical findings, radiographic findings, medical history, and a structured assessment with diagnosis, management plan, antibiotic considerations, follow-up, and patient counseling.

## License

Apache 2.0
