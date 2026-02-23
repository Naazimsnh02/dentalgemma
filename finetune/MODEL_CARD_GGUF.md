---
language:
- en
license: apache-2.0
base_model: naazimsnh02/dentalgemma-1.5-4b-it
tags:
- medical
- dental
- vision-language
- multimodal
- gguf
- llama.cpp
- edge
- mobile
- MedGemma
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
model-index:
- name: DentalGemma-1.5-4B-IT-GGUF
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

# 🦷 DentalGemma 1.5 4B IT (GGUF)

This repository contains the **GGUF** quantized formats of [DentalGemma 1.5 4B IT](https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it). These files are designed for efficient local inference using [llama.cpp](https://github.com/ggerganov/llama.cpp) and compatible frameworks on edge devices, mobile applications (such as React Native with `llama.rn`), and consumer hardware.

**DentalGemma** is a fine-tuned version of [MedGemma 1.5 4B IT](https://huggingface.co/google/medgemma-1.5-4b-it) specialized for dental diagnostics and clinical reasoning. It represents a novel domain adaptation, bridging the gap between medical foundation models and localized dental expertise. 

Built for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge), this GGUF version allows the DentalGemma model to be brought directly into the hands of clinicians and patients via affordable low-resource devices and mobile platforms, entirely offline and privacy-preserving.

## 🎯 Model Description

DentalGemma is a multimodal vision-language model that combines:
- **Visual understanding** of dental images (clinical photographs and radiographs)
- **Clinical reasoning** for diagnosis, treatment planning, and patient counseling
- **Structured assessment** following evidence-based dental protocols

For full details on the training data, methodology, benchmark performance, and full precision evaluation, please refer to the [original model card](https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it).

## 💻 Usage with llama.cpp

The GGUF format enables highly efficient CPU and GPU inference without requiring heavy Python dependencies, PyTorch, or Transformers. 

### Prerequisites

1. Install `llama.cpp` following the instructions in the [llama.cpp repository](https://github.com/ggerganov/llama.cpp).
2. Download both the multimodal projector file (`mmproj-*.gguf`) and the main quantized model file (`*.gguf`) from the files section.

### CLI Inference (Multimodal Vision-Language)

Use the `llama-llava-cli` tool (or `llava-cli` depending on your llama.cpp version/build) to process images and text simultaneously:

```bash
./llama-llava-cli -m dentalgemma-1.5-4b-it.Q4_K_M.gguf \
    --mmproj mmproj-dentalgemma-1.5-4b-it-f16.gguf \
    -p "<bos><start_of_turn>user\n[img-1]Analyze this dental X-ray for any abnormalities.<end_of_turn>\n<start_of_turn>model\n" \
    --image dental_xray.jpg \
    -c 4096 \
    --temp 0.1
```

### CLI Inference (Text-only Clinical Cases)

Use the standard `llama-cli` tool for clinical case reasoning and textual interactions:

```bash
./llama-cli -m dentalgemma-1.5-4b-it.Q4_K_M.gguf \
    -p "<bos><start_of_turn>system\nYou are an expert dental clinician and radiologist AI assistant.<end_of_turn>\n<start_of_turn>user\nA 35-year-old male presents with severe throbbing pain in the lower right molar region for 3 days. What is your assessment and management plan?<end_of_turn>\n<start_of_turn>model\n" \
    -c 4096 \
    --temp 0.1
```

### Usage in Mobile Applications (React Native)

This GGUF model powers the offline-first `dentalgemma-mobile` React Native app via `llama.rn` integration. When deploying to mobile devices:

1. Copy both the quantized model weights (`.gguf`) and multimodal projector weights (`mmproj.gguf`) to the iOS/Android device's local file storage.
2. Initialize the native completion context pointing to both files. 
3. *Note on Memory:* Memory usage is highly optimized with quantized models. For example, a 4-bit quant (`Q4_K_M`) requires approximately ~2.5GB to 3GB RAM, making it feasible for execution on mid-to-high-end smartphones (8GB+ unified memory recommended for multimodal generation).

## 🏗️ Model Architecture

- **Image Encoder:** SigLIP — processes dental X-ray images into visual embeddings
- **Language Model:** Gemma 3 architecture (4B parameters) — generates clinical text responses
- **Modality Fusion:** Cross-attention mechanism for image-text integration
- **Supported Context:** 8,192 tokens
- **Quantization:** Standard `llama.cpp` K-quants (e.g., Q4_K_M, Q8_0)

The base model was first fine-tuned in full bfloat16 using LoRA. The learned adapters were then merged into the base weights, and the resulting full-precision model was converted to GGUF format using `llama.cpp` scripts (`convert_image_encoder_to_gguf.py` for the projector and `convert_hf_to_gguf.py` for the LLM).

## ⚠️ Ethical Considerations & Disclaimer

- **Not a diagnostic tool:** This model is for research and educational purposes only. All AI-generated assessments must be validated by licensed dental professionals.
- **Quantization Impact:** Please be aware that aggressive quantization (e.g., Q3 or below) may degrade the prompt following, diagnostic reasoning, or image interpretation capabilities compared to the full-precision `bfloat16` weights. We recommend `Q4_K_M` or higher for the best balance of speed and accuracy.
- **Hallucination risk:** Like all LLMs, the model may occasionally generate plausible-sounding but clinically incorrect information.

**This model is NOT a substitute for professional dental diagnosis.** All AI-generated assessments must be validated by licensed dental professionals before any clinical use. The model is provided "as-is" for research purposes only.

## 📜 License

- **Model License:** Apache 2.0
- **Base Model:** [MedGemma 1.5 4B IT](https://huggingface.co/google/medgemma-1.5-4b-it) (Gemma Terms of Use)

## 📚 Citation

If you use DentalGemma in your research, please cite:

```bibtex
@misc{dentalgemma2026,
  title={DentalGemma: Fine-tuning MedGemma for Dental Diagnostics},
  author={Syed Naazim Hussain},
  year={2026},
  publisher={HuggingFace},
  howpublished={\url{https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it-GGUF}},
  note={MedGemma Impact Challenge submission}
}
```

## 🔗 Links

- **Main Model:** [naazimsnh02/dentalgemma-1.5-4b-it](https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it)
- **VQA Dataset:** [naazimsnh02/dentalgemma-vqa](https://huggingface.co/datasets/naazimsnh02/dentalgemma-vqa)
- **Instruct Dataset:** [naazimsnh02/dentalgemma-instruct](https://huggingface.co/datasets/naazimsnh02/dentalgemma-instruct)
- **Code Repository:** [GitHub](https://github.com/naazimsnh02/dentalgemma)

---

<div align="center">

**Built for the [MedGemma Impact Challenge](https://kaggle.com/competitions/med-gemma-impact-challenge) 🏥**

*Bringing dental diagnostics into the age of medical foundation models* 🦷

</div>
