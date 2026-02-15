"""Build the final DentalGemma HuggingFace dataset.

Combines all 6 source datasets into two HF datasets:
  1. dentalgemma-vqa      — multimodal (image + text) VQA pairs
  2. dentalgemma-instruct — text-only chat format for SFT

The VQA dataset is formatted for MedGemma 1.5 4B IT fine-tuning with
the standard chat template (user message contains image + question,
assistant message contains the answer).

Usage:
    python build_dataset.py                    # build both datasets
    python build_dataset.py --push <hf_org>    # build and push to HF Hub
"""

import argparse
import json
import os
import random
import sys
from collections import Counter
from pathlib import Path

from datasets import Dataset, DatasetDict, Features, Image, Value
from tqdm import tqdm

# Add preprocessing dir to path
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from process_cavity_detection import process_cavity_detection
from process_opg_classification import process_opg_classification
from process_dental_radiography import process_dental_radiography
from process_panoramic import process_panoramic
from process_text_cases import process_text_cases_chat, process_text_cases_vqa

DATASETS_DIR = SCRIPT_DIR.parent / "datasets"
OUTPUT_DIR = SCRIPT_DIR.parent / "output"

SYSTEM_PROMPT = (
    "You are an expert dental clinician and radiologist AI assistant. "
    "Analyze dental images and clinical information to provide accurate, "
    "evidence-based assessments. Always recommend clinical correlation and "
    "professional evaluation for definitive diagnosis."
)


def _collect_vqa_samples() -> list[dict]:
    """Run all image-based processors and return a unified sample list."""
    all_samples = []

    # 1. Dental Cavity Detection
    print("\n" + "=" * 60)
    print("1/5 — Dental Cavity Detection Dataset")
    print("=" * 60)
    cavity_path = str(DATASETS_DIR / "Dental Cavity Detection Dataset")
    all_samples.extend(process_cavity_detection(cavity_path))

    # 2+3. OPG Classification (v1 + v4)
    print("\n" + "=" * 60)
    print("2/5 — Dental OPG Classification (v1 + v4)")
    print("=" * 60)
    opg_v1 = str(DATASETS_DIR / "Dental OPG Xray Dataset" / "Dental OPG (Classification)")
    opg_v4 = str(
        DATASETS_DIR
        / "Dental OPG XRAY Dataset (Version 4)"
        / "Dental OPG XRAY Dataset"
        / "Dental OPG XRAY Dataset"
        / "Dental OPG (Classification)"
    )
    all_samples.extend(process_opg_classification(opg_v1, opg_v4))

    # 4. Dental Radiography
    print("\n" + "=" * 60)
    print("3/5 — Dental Radiography Dataset")
    print("=" * 60)
    radio_path = str(DATASETS_DIR / "Dental Radiography")
    all_samples.extend(process_dental_radiography(radio_path))

    # 5. Panoramic Dental Xray
    print("\n" + "=" * 60)
    print("4/5 — Panoramic Dental Xray Dataset")
    print("=" * 60)
    pano_path = str(
        DATASETS_DIR / "Panoramic Dental Xray Dataset" / "Panoramic Dental Xray Dataset"
    )
    all_samples.extend(process_panoramic(pano_path))

    return all_samples


def _build_vqa_dataset(samples: list[dict]) -> DatasetDict:
    """Convert VQA samples into a HF DatasetDict with train/validation splits.

    Each row has:
      - image: PIL Image
      - messages: JSON string of the chat-format messages list
      - source: dataset source tag
      - condition: dental condition (if available)
    """
    rows = {
        "image": [],
        "messages": [],
        "source": [],
        "condition": [],
    }

    for s in tqdm(samples, desc="Formatting VQA rows"):
        user_content = [
            {"type": "image"},
            {"type": "text", "text": s["question"]},
        ]
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
            {"role": "assistant", "content": s["answer"]},
        ]

        rows["image"].append(s["image"])
        rows["messages"].append(json.dumps(messages))
        rows["source"].append(s["source"])
        rows["condition"].append(s.get("condition", "general"))

    features = Features({
        "image": Image(),
        "messages": Value("string"),
        "source": Value("string"),
        "condition": Value("string"),
    })

    full_ds = Dataset.from_dict(rows, features=features)

    # Split: 90% train, 10% validation
    split = full_ds.train_test_split(test_size=0.1, seed=42, shuffle=True)
    return DatasetDict({
        "train": split["train"],
        "validation": split["test"],
    })


def _build_instruct_dataset() -> DatasetDict:
    """Build text-only instruct dataset from Wildstash dental cases.

    Each row has:
      - messages: JSON string of system/user/assistant messages
      - source: dataset source tag
      - condition: extracted dental condition
    """
    print("\n" + "=" * 60)
    print("5/5 — Wildstash Dental 2.5k Instruct (text-only)")
    print("=" * 60)

    chat_data = process_text_cases_chat(str(SCRIPT_DIR))

    rows = {
        "messages": [],
        "source": [],
        "condition": [],
    }

    for entry in tqdm(chat_data, desc="Formatting instruct rows"):
        rows["messages"].append(json.dumps(entry["messages"]))
        rows["source"].append(entry["source"])
        rows["condition"].append(entry["condition"])

    features = Features({
        "messages": Value("string"),
        "source": Value("string"),
        "condition": Value("string"),
    })

    full_ds = Dataset.from_dict(rows, features=features)

    split = full_ds.train_test_split(test_size=0.1, seed=42, shuffle=True)
    return DatasetDict({
        "train": split["train"],
        "validation": split["test"],
    })


def _print_summary(vqa_ds: DatasetDict, instruct_ds: DatasetDict) -> None:
    """Print final dataset statistics."""
    print("\n" + "=" * 60)
    print("DATASET BUILD COMPLETE")
    print("=" * 60)

    print("\n📊 dentalgemma-vqa (multimodal):")
    for split_name, ds in vqa_ds.items():
        print(f"  {split_name}: {len(ds)} samples")
        sources = Counter(ds["source"])
        for src, cnt in sorted(sources.items()):
            print(f"    {src}: {cnt}")

    print(f"\n📊 dentalgemma-instruct (text-only):")
    for split_name, ds in instruct_ds.items():
        print(f"  {split_name}: {len(ds)} samples")


def main():
    parser = argparse.ArgumentParser(description="Build DentalGemma datasets")
    parser.add_argument(
        "--push", type=str, default=None, metavar="HF_ORG",
        help="Push to HuggingFace Hub under this org/username "
             "(e.g., --push Wildstash → Wildstash/dentalgemma-vqa)",
    )
    parser.add_argument(
        "--output-dir", type=str, default=str(OUTPUT_DIR),
        help="Local directory to save datasets (default: ./output/)",
    )
    args = parser.parse_args()

    random.seed(42)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Build VQA dataset
    vqa_samples = _collect_vqa_samples()
    vqa_ds = _build_vqa_dataset(vqa_samples)

    # Build instruct dataset
    instruct_ds = _build_instruct_dataset()

    _print_summary(vqa_ds, instruct_ds)

    # Save locally
    vqa_path = output_dir / "dentalgemma-vqa"
    instruct_path = output_dir / "dentalgemma-instruct"

    print(f"\n💾 Saving dentalgemma-vqa to {vqa_path}")
    vqa_ds.save_to_disk(str(vqa_path))

    print(f"💾 Saving dentalgemma-instruct to {instruct_path}")
    instruct_ds.save_to_disk(str(instruct_path))

    # Push to Hub
    if args.push:
        vqa_repo = f"{args.push}/dentalgemma-vqa"
        instruct_repo = f"{args.push}/dentalgemma-instruct"

        print(f"\n🚀 Pushing dentalgemma-vqa to {vqa_repo}")
        vqa_ds.push_to_hub(vqa_repo, private=False)

        print(f"🚀 Pushing dentalgemma-instruct to {instruct_repo}")
        instruct_ds.push_to_hub(instruct_repo, private=False)

        print("\n✅ Datasets pushed to HuggingFace Hub!")

    print("\n✅ Done!")


if __name__ == "__main__":
    main()
