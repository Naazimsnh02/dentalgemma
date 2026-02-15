"""Process the Wildstash dental-2.5k-instruct text dataset.

Reads Dental_Cases_TrainingData.jsonl and produces two output formats:
  - Chat format (Format A) for text-only SFT
  - VQA-style format (Format B) for potential image pairing
"""

import json
import re
from pathlib import Path
from collections import Counter


DATASET_REL_PATH = (
    "../datasets/Wildstashdental 2.5k-instruct/Dental_Cases_TrainingData.jsonl"
)
SOURCE_TAG = "wildstash_dental_instruct"

# Fields to extract from the user message, in expected order
_FIELD_KEYS = [
    ("PATIENT", "patient"),
    ("AGE", "age"),
    ("SEX", "sex"),
    ("OCCUPATION", "occupation"),
    ("CHIEF COMPLAINT", "chief_complaint"),
    ("HISTORY", "history"),
    ("CLINICAL FINDINGS", "clinical_findings"),
    ("RADIOGRAPHIC FINDINGS", "radiographic_findings"),
    ("MEDICAL HISTORY", "medical_history"),
    ("CURRENT MEDICATIONS", "medications"),
    ("HABITS", "habits"),
]


def _extract_fields(user_content: str) -> dict:
    """Extract structured fields from the user message text."""
    fields = {}
    for label, key in _FIELD_KEYS:
        pattern = rf"{re.escape(label)}\s*:\s*(.*?)(?=\n[A-Z][\w\s]*:|What is your|$)"
        match = re.search(pattern, user_content, re.DOTALL)
        if match:
            fields[key] = match.group(1).strip()
    return fields


def _extract_condition(fields: dict) -> str:
    """Return the condition/diagnosis from the PATIENT field."""
    return fields.get("patient", "unknown")


def _load_records(base_path: str | Path) -> list[dict]:
    """Load and parse all valid JSONL records from the dataset file."""
    jsonl_path = Path(base_path) / DATASET_REL_PATH
    records = []
    skipped = 0

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                messages = obj.get("messages")
                if not messages or len(messages) < 3:
                    raise ValueError(f"Expected 3 messages, got {len(messages) if messages else 0}")
                records.append({"messages": messages, "line": line_no})
            except (json.JSONDecodeError, ValueError) as exc:
                print(f"[WARN] Skipping line {line_no}: {exc}")
                skipped += 1

    if skipped:
        print(f"[INFO] Skipped {skipped} malformed line(s)")
    return records


def process_text_cases_chat(base_path: str | Path = ".") -> list[dict]:
    """Return Format A (chat) dicts for text-only SFT.

    Each dict contains:
        messages: list of system/user/assistant message dicts
        source:   dataset source tag
        condition: extracted condition string
    """
    records = _load_records(base_path)
    results = []

    for rec in records:
        msgs = rec["messages"]
        user_content = msgs[1].get("content", "")
        fields = _extract_fields(user_content)
        condition = _extract_condition(fields)

        results.append({
            "messages": [
                {"role": msgs[0]["role"], "content": msgs[0]["content"]},
                {"role": msgs[1]["role"], "content": msgs[1]["content"]},
                {"role": msgs[2]["role"], "content": msgs[2]["content"]},
            ],
            "source": SOURCE_TAG,
            "condition": condition,
        })

    return results


def process_text_cases_vqa(base_path: str | Path = ".") -> list[dict]:
    """Return Format B (VQA-style) dicts for potential image pairing.

    Each dict contains:
        image:     None (text-only)
        question:  user message content
        answer:    assistant message content
        source:    dataset source tag
        split:     'train'
        condition: extracted condition string
    """
    records = _load_records(base_path)
    results = []

    for rec in records:
        msgs = rec["messages"]
        user_content = msgs[1].get("content", "")
        assistant_content = msgs[2].get("content", "")
        fields = _extract_fields(user_content)
        condition = _extract_condition(fields)

        results.append({
            "image": None,
            "question": user_content,
            "answer": assistant_content,
            "source": SOURCE_TAG,
            "split": "train",
            "condition": condition,
        })

    return results


def _print_stats(chat_data: list[dict], vqa_data: list[dict]) -> None:
    """Print summary statistics and a sample from each format."""
    print("=" * 60)
    print("Wildstash Dental 2.5k-Instruct — Processing Stats")
    print("=" * 60)

    print(f"\nTotal cases (chat):  {len(chat_data)}")
    print(f"Total cases (VQA):   {len(vqa_data)}")

    conditions = Counter(d["condition"] for d in chat_data)
    print(f"Unique conditions:   {len(conditions)}")
    print("\nTop 10 conditions:")
    for cond, count in conditions.most_common(10):
        print(f"  {count:>4d}  {cond}")

    # Sample output
    if chat_data:
        print("\n" + "-" * 60)
        print("Sample — Format A (Chat):")
        print("-" * 60)
        sample = chat_data[0]
        print(json.dumps({
            "source": sample["source"],
            "condition": sample["condition"],
            "messages (roles)": [m["role"] for m in sample["messages"]],
            "user_content_preview": sample["messages"][1]["content"][:200] + "...",
        }, indent=2))

    if vqa_data:
        print("\n" + "-" * 60)
        print("Sample — Format B (VQA):")
        print("-" * 60)
        sample = vqa_data[0]
        print(json.dumps({
            "image": sample["image"],
            "source": sample["source"],
            "split": sample["split"],
            "condition": sample["condition"],
            "question_preview": sample["question"][:200] + "...",
            "answer_preview": sample["answer"][:200] + "...",
        }, indent=2))


if __name__ == "__main__":
    script_dir = Path(__file__).resolve().parent
    chat_data = process_text_cases_chat(script_dir)
    vqa_data = process_text_cases_vqa(script_dir)
    _print_stats(chat_data, vqa_data)
