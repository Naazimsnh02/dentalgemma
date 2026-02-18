"""Process OPG Classification datasets into VQA pairs with compositional answers.

Dataset 2: Dental OPG Xray Dataset / Dental OPG (Classification)
Dataset 3: Dental OPG XRAY Dataset (Version 4) / ... / Dental OPG (Classification)

Both contain 6 class folders: BDC-BDR, Caries, Fractured Teeth, Healthy Teeth,
Impacted teeth, Infection. Images are deduplicated by (class, filename).
"""

import random
from pathlib import Path
from PIL import Image

from answer_builder import build_answer

CLASS_FOLDERS = [
    "BDC-BDR",
    "Caries",
    "Fractured Teeth",
    "Healthy Teeth",
    "Impacted teeth",
    "Infection",
]

CONDITION_KEY = {
    "BDC-BDR": "bdc_bdr",
    "Caries": "caries",
    "Fractured Teeth": "fractured",
    "Healthy Teeth": "healthy",
    "Impacted teeth": "impacted",
    "Infection": "infection",
}

URGENCY_MAP = {
    "Healthy Teeth": "routine",
    "Caries": "moderate",
    "Infection": "urgent",
    "Fractured Teeth": "emergency",
    "Impacted teeth": "elective",
    "BDC-BDR": "moderate to urgent",
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}

# ─── QUESTION TEMPLATES ───

QUESTIONS_TYPE1_DIAGNOSIS = [
    "Analyze this panoramic dental radiograph and describe your findings.",
    "What does this dental panoramic X-ray reveal?",
    "Provide a detailed assessment of this OPG radiograph.",
    "Describe the key findings in this panoramic dental radiograph.",
    "Interpret this dental OPG and explain what you observe.",
]

QUESTIONS_TYPE2_YESNO_TEMPLATE = "Does this OPG show signs of {condition}?"

CONDITION_DISPLAY_NAMES = {
    "BDC-BDR": "broken down crown or root",
    "Caries": "dental caries or tooth decay",
    "Fractured Teeth": "dental fracture",
    "Healthy Teeth": "healthy dentition",
    "Impacted teeth": "tooth impaction",
    "Infection": "dental infection or abscess",
}

QUESTIONS_TYPE3_DIFFERENTIAL = [
    "What are the possible diagnoses for this panoramic X-ray?",
    "List potential differential diagnoses for this OPG radiograph.",
    "What conditions could explain the findings in this dental panoramic X-ray?",
]

QUESTIONS_TYPE4_URGENCY = [
    "How urgent is the condition shown in this dental X-ray?",
    "Assess the clinical urgency of the findings in this panoramic radiograph.",
    "What is the priority level for treatment based on this OPG?",
]

QUESTIONS_TYPE5_HEALTHCHECK = [
    "Is this a healthy or abnormal dental panoramic radiograph?",
    "Does this OPG show normal or pathological findings?",
    "Classify this panoramic dental X-ray as healthy or abnormal.",
]

# Plausible differential diagnoses per class
DIFFERENTIALS = {
    "BDC-BDR": ["severe caries with crown destruction", "dental trauma", "attrition"],
    "Caries": ["early enamel demineralization", "cervical abrasion", "fluorosis"],
    "Fractured Teeth": ["cracked tooth syndrome", "dental trauma", "root resorption"],
    "Healthy Teeth": ["early subclinical changes", "developmental variation"],
    "Impacted teeth": ["delayed eruption", "ectopic positioning", "dentigerous cyst"],
    "Infection": ["periapical granuloma", "periapical cyst", "osteomyelitis"],
}

URGENCY_DESCRIPTIONS = {
    "routine": "This is a routine finding. Regular follow-up at standard intervals is appropriate with no urgent intervention needed.",
    "moderate": "This finding requires timely attention. Scheduling treatment within the coming weeks is recommended to prevent progression.",
    "urgent": "This is an urgent finding requiring same-day or next-day clinical evaluation. Prompt treatment is necessary to prevent complications.",
    "emergency": "This is an emergency finding requiring immediate clinical attention. The patient should seek care as soon as possible.",
    "elective": "This finding warrants elective evaluation. A planned surgical consultation can be scheduled at the patient's convenience.",
    "moderate to urgent": "This finding ranges from moderate to urgent priority depending on clinical symptoms. Assessment should be scheduled promptly.",
}


def _collect_images_by_class(base_path: str) -> dict[str, dict[str, str]]:
    """Return {class_folder: {filename: full_path}} for all images under base_path."""
    result: dict[str, dict[str, str]] = {}
    base = Path(base_path)
    for cls_folder in CLASS_FOLDERS:
        cls_dir = base / cls_folder
        files: dict[str, str] = {}
        if cls_dir.is_dir():
            for entry in cls_dir.iterdir():
                if entry.is_file() and entry.suffix.lower() in IMAGE_EXTENSIONS:
                    files[entry.name] = str(entry)
        result[cls_folder] = files
    return result


def _generate_type1_answer(cls_folder: str, rng: random.Random) -> str:
    """Open-ended diagnosis answer."""
    condition = CONDITION_KEY[cls_folder]
    return build_answer(condition, image_type="xray", severity="moderate", rng=rng)


def _generate_type2_answer(cls_folder: str, asked_condition: str, rng: random.Random) -> str:
    """Yes/No pathology screening answer."""
    actual_display = CONDITION_DISPLAY_NAMES[cls_folder]
    asked_display = CONDITION_DISPLAY_NAMES[asked_condition]

    if cls_folder == asked_condition:
        base = build_answer(CONDITION_KEY[cls_folder], image_type="xray", severity="moderate", rng=rng)
        return f"Yes, this OPG shows signs of {actual_display}. {base}"
    else:
        actual_answer = build_answer(CONDITION_KEY[cls_folder], image_type="xray", severity="moderate", rng=rng)
        return f"No, this OPG does not show signs of {asked_display}. Instead, this radiograph shows {actual_display}. {actual_answer}"


def _generate_type3_answer(cls_folder: str, rng: random.Random) -> str:
    """Differential diagnosis answer."""
    condition = CONDITION_KEY[cls_folder]
    primary = CONDITION_DISPLAY_NAMES[cls_folder]
    diffs = DIFFERENTIALS[cls_folder]
    selected_diffs = rng.sample(diffs, min(2, len(diffs)))

    base = build_answer(condition, image_type="xray", severity="moderate", rng=rng)
    diff_list = ", ".join(selected_diffs)
    return f"The primary diagnosis based on this panoramic radiograph is {primary}. Differential diagnoses to consider include: {diff_list}. {base}"


def _generate_type4_answer(cls_folder: str, rng: random.Random) -> str:
    """Clinical urgency answer."""
    urgency = URGENCY_MAP[cls_folder]
    urgency_desc = URGENCY_DESCRIPTIONS[urgency]
    condition = CONDITION_KEY[cls_folder]
    base = build_answer(condition, image_type="xray", severity="moderate", rng=rng)
    return f"{urgency_desc} {base}"


def _generate_type5_answer(cls_folder: str, rng: random.Random) -> str:
    """Healthy vs abnormal answer."""
    condition = CONDITION_KEY[cls_folder]
    if cls_folder == "Healthy Teeth":
        base = build_answer("healthy", image_type="xray", severity="mild", rng=rng)
        return f"This is a healthy dental panoramic radiograph. {base}"
    else:
        display = CONDITION_DISPLAY_NAMES[cls_folder]
        base = build_answer(condition, image_type="xray", severity="moderate", rng=rng)
        return f"This is an abnormal dental panoramic radiograph showing {display}. {base}"


def _generate_qa_pairs(cls_folder: str, rng: random.Random) -> list[tuple[str, str]]:
    """Generate 2-3 question-answer pairs for an image."""
    all_types = [1, 2, 3, 4, 5]
    n_questions = rng.choice([2, 2, 3])  # Weighted towards 2
    chosen_types = rng.sample(all_types, n_questions)

    pairs = []
    for qt in chosen_types:
        if qt == 1:
            question = rng.choice(QUESTIONS_TYPE1_DIAGNOSIS)
            answer = _generate_type1_answer(cls_folder, rng)
        elif qt == 2:
            # Sometimes ask about correct condition, sometimes ask about a wrong one
            if rng.random() < 0.5:
                asked = cls_folder
            else:
                others = [c for c in CLASS_FOLDERS if c != cls_folder]
                asked = rng.choice(others)
            question = QUESTIONS_TYPE2_YESNO_TEMPLATE.format(
                condition=CONDITION_DISPLAY_NAMES[asked]
            )
            answer = _generate_type2_answer(cls_folder, asked, rng)
        elif qt == 3:
            question = rng.choice(QUESTIONS_TYPE3_DIFFERENTIAL)
            answer = _generate_type3_answer(cls_folder, rng)
        elif qt == 4:
            question = rng.choice(QUESTIONS_TYPE4_URGENCY)
            answer = _generate_type4_answer(cls_folder, rng)
        else:
            question = rng.choice(QUESTIONS_TYPE5_HEALTHCHECK)
            answer = _generate_type5_answer(cls_folder, rng)

        pairs.append((question, answer))

    return pairs


def process_opg_classification(
    base_path_v1: str,
    base_path_v4: str,
) -> list[dict]:
    """Process both OPG classification datasets and return deduplicated VQA pairs.

    Args:
        base_path_v1: Path to Dataset 2 classification folder.
        base_path_v4: Path to Dataset 3 (V4) classification folder.

    Returns:
        List of dicts with keys: image, question, answer, source, split, condition.
    """
    rng = random.Random(42)

    images_v1 = _collect_images_by_class(base_path_v1)
    images_v4 = _collect_images_by_class(base_path_v4)

    # Merge with deduplication: for each class, union filenames; v1 takes priority
    merged: dict[str, dict[str, str]] = {}
    for cls_folder in CLASS_FOLDERS:
        combined = dict(images_v4.get(cls_folder, {}))
        combined.update(images_v1.get(cls_folder, {}))
        merged[cls_folder] = combined

    samples: list[dict] = []
    for cls_folder in CLASS_FOLDERS:
        condition = CONDITION_KEY[cls_folder]

        for filename in sorted(merged[cls_folder]):
            img_path = merged[cls_folder][filename]
            try:
                img = Image.open(img_path).convert("RGB")
            except Exception as e:
                print(f"Warning: skipping {img_path}: {e}")
                continue

            qa_pairs = _generate_qa_pairs(cls_folder, rng)

            for question, answer in qa_pairs:
                samples.append({
                    "image": img,
                    "question": question,
                    "answer": answer,
                    "source": "dental_opg_classification",
                    "split": "train",
                    "condition": condition,
                })

    print(f"Processed {len(samples)} OPG classification VQA pairs "
          f"across {len(CLASS_FOLDERS)} classes.")
    return samples


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent / "datasets"

    path_v1 = str(
        BASE_DIR / "Dental OPG Xray Dataset" / "Dental OPG (Classification)"
    )
    path_v4 = str(
        BASE_DIR
        / "Dental OPG XRAY Dataset (Version 4)"
        / "Dental OPG XRAY Dataset"
        / "Dental OPG XRAY Dataset"
        / "Dental OPG (Classification)"
    )

    results = process_opg_classification(path_v1, path_v4)

    from collections import Counter
    counts = Counter(s["condition"] for s in results)
    for cond, cnt in sorted(counts.items()):
        print(f"  {cond}: {cnt}")
