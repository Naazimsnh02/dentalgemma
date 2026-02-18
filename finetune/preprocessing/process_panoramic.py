"""Process the Panoramic Dental Xray Dataset for VQA fine-tuning.

Handles two subsets with clinically-focused questions:
- firstpart: VIA polygon annotations for tooth instance segmentation
- secondpart/train: COCO format annotations with 8 tooth type classes
"""

import json
import os
import random
from collections import Counter
from pathlib import Path

from PIL import Image
from tqdm import tqdm

from answer_builder import build_answer

# ─── QUESTION TEMPLATES ───

QUESTIONS_COMPLETENESS = [
    "Assess the completeness of the dentition in this panoramic X-ray.",
    "Evaluate the dental arch completeness visible in this panoramic radiograph.",
    "How complete is the dentition shown in this OPG?",
]

QUESTIONS_ANATOMY = [
    "Describe the dental anatomy visible in this OPG.",
    "Provide an anatomical overview of this panoramic dental radiograph.",
    "What dental structures and anatomy are visible in this panoramic X-ray?",
]

QUESTIONS_TOOTH_TYPES = [
    "What types of teeth are visible in this panoramic radiograph?",
    "Identify and describe the tooth types present in this dental X-ray.",
    "Classify the types of teeth visible in this panoramic dental radiograph.",
]

DISPLAY_ORDER = [
    "third molar", "second molar", "first molar",
    "second premolar", "first premolar",
    "canine",
    "lateral incisor", "central incisor",
]


def _format_tooth_counts(counts: Counter) -> str:
    parts = []
    for tooth_type in DISPLAY_ORDER:
        count = counts.get(tooth_type, 0)
        if count == 0:
            continue
        if count == 1:
            parts.append(f"1 {tooth_type}")
        else:
            parts.append(f"{count} {tooth_type}s")
    return ", ".join(parts)


def _get_completeness_description(n_teeth: int) -> str:
    """Describe dentition completeness based on tooth count."""
    if n_teeth >= 28:
        return "complete or near-complete adult dentition with a full complement of teeth"
    elif n_teeth >= 15:
        return f"partial dentition with approximately {n_teeth} teeth visible, indicating some missing teeth"
    else:
        return f"significant tooth loss with only approximately {n_teeth} teeth remaining"


def _generate_completeness_answer(n_teeth: int, rng: random.Random) -> str:
    """Generate dentition completeness answer."""
    completeness = _get_completeness_description(n_teeth)

    if n_teeth >= 28:
        severity = "mild"
        clinical_note = "The dental arches appear well-maintained with adequate occlusal relationships. Regular preventive care is recommended to maintain this healthy dentition."
    elif n_teeth >= 15:
        severity = "moderate"
        clinical_note = "The missing teeth may affect occlusal function and should be evaluated for prosthetic replacement options. A comprehensive treatment plan addressing tooth replacement should be considered."
    else:
        severity = "severe"
        clinical_note = "The extensive tooth loss significantly impacts masticatory function and may affect nutrition and quality of life. Prosthetic rehabilitation with dentures or implant-supported restorations should be discussed."

    base = build_answer("healthy", image_type="xray", severity=severity, rng=rng)
    return f"This panoramic radiograph shows {completeness}. {clinical_note} {base}"


def _generate_anatomy_answer(n_teeth: int, types_list: str | None, rng: random.Random) -> str:
    """Generate anatomical overview answer."""
    parts = [
        "This panoramic dental radiograph provides a comprehensive view of the dental anatomy."
    ]

    if types_list:
        parts.append(f"The following tooth types are identified: {types_list}.")

    completeness = _get_completeness_description(n_teeth)
    parts.append(f"The dentition shows {completeness}.")

    structural_observations = rng.choice([
        "The maxillary and mandibular arches are visible with their supporting alveolar bone structures. The temporomandibular joints and maxillary sinuses can also be assessed.",
        "Both dental arches are visualized along with the surrounding osseous structures including the alveolar ridges, mandibular canal, and maxillary sinuses.",
        "The panoramic view captures the full extent of both jaws, allowing assessment of dental alignment, bone support, and adjacent anatomical structures.",
    ])
    parts.append(structural_observations)

    base = build_answer("healthy", image_type="xray", severity="mild", rng=rng)
    parts.append(base)

    return " ".join(parts)


def _generate_tooth_types_answer(types_list: str, rng: random.Random) -> str:
    """Generate tooth type identification answer."""
    clinical_context = rng.choice([
        "Each tooth type has distinct morphological features adapted for specific masticatory functions — incisors for cutting, canines for tearing, premolars for crushing, and molars for grinding.",
        "The identification of different tooth types is essential for dental charting, treatment planning, and understanding occlusal relationships.",
        "The distribution of tooth types reflects the dental formula and can provide insights into developmental status, eruption patterns, and potential orthodontic considerations.",
    ])

    base = build_answer("healthy", image_type="xray", severity="mild", rng=rng)
    return f"This panoramic radiograph reveals the following tooth types: {types_list}. {clinical_context} {base}"


def _process_firstpart(firstpart_dir: str) -> list[dict]:
    annotations_path = os.path.join(firstpart_dir, "annotations.json")
    with open(annotations_path, "r") as f:
        raw = json.load(f)

    via_data = raw.get("_via_img_metadata", raw)
    rng = random.Random(42)

    samples = []
    for key, entry in tqdm(via_data.items(), desc="Processing firstpart"):
        filename = entry.get("filename")
        regions = entry.get("regions", [])

        annotated_regions = [
            r for r in regions
            if r.get("shape_attributes", {}).get("name") == "polygon"
            and r["shape_attributes"].get("all_points_x")
        ]
        if not annotated_regions:
            continue

        img_path = os.path.join(firstpart_dir, filename)
        if not os.path.isfile(img_path):
            continue

        n_teeth = len(annotated_regions)
        image = Image.open(img_path).convert("RGB")

        # Generate 2 questions: completeness + anatomy (firstpart has no type info)
        available_types = ["completeness", "anatomy"]
        chosen = rng.sample(available_types, 2)

        for qt in chosen:
            if qt == "completeness":
                question = rng.choice(QUESTIONS_COMPLETENESS)
                answer = _generate_completeness_answer(n_teeth, rng)
            else:
                question = rng.choice(QUESTIONS_ANATOMY)
                answer = _generate_anatomy_answer(n_teeth, None, rng)

            samples.append({
                "image": image,
                "question": question,
                "answer": answer,
                "source": "panoramic_dental_xray",
                "split": "train",
                "condition": "general",
            })

    return samples


def _process_secondpart(secondpart_train_dir: str) -> list[dict]:
    annotations_path = os.path.join(secondpart_train_dir, "_annotations.coco.json")
    with open(annotations_path, "r") as f:
        coco_data = json.load(f)

    cat_map = {c["id"]: c["name"] for c in coco_data["categories"]}

    image_annotations: dict[int, list[int]] = {}
    for ann in coco_data["annotations"]:
        image_annotations.setdefault(ann["image_id"], []).append(ann["category_id"])

    imgs_dir = os.path.join(secondpart_train_dir, "imgs")
    rng = random.Random(42)
    samples = []

    for img_info in tqdm(coco_data["images"], desc="Processing secondpart"):
        img_id = img_info["id"]
        cat_ids = image_annotations.get(img_id, [])
        if not cat_ids:
            continue

        counts = Counter()
        for cat_id in cat_ids:
            name = cat_map.get(cat_id)
            if name and name != "dental":
                counts[name] += 1

        if not counts:
            continue

        img_path = os.path.join(imgs_dir, img_info["file_name"])
        if not os.path.isfile(img_path):
            continue

        types_list = _format_tooth_counts(counts)
        n_teeth = sum(counts.values())
        image = Image.open(img_path).convert("RGB")

        # Generate 2 questions from all 3 types (secondpart has type info)
        available_types = ["tooth_types", "completeness", "anatomy"]
        chosen = rng.sample(available_types, 2)

        for qt in chosen:
            if qt == "tooth_types":
                question = rng.choice(QUESTIONS_TOOTH_TYPES)
                answer = _generate_tooth_types_answer(types_list, rng)
            elif qt == "completeness":
                question = rng.choice(QUESTIONS_COMPLETENESS)
                answer = _generate_completeness_answer(n_teeth, rng)
            else:
                question = rng.choice(QUESTIONS_ANATOMY)
                answer = _generate_anatomy_answer(n_teeth, types_list, rng)

            samples.append({
                "image": image,
                "question": question,
                "answer": answer,
                "source": "panoramic_dental_xray",
                "split": "train",
                "condition": "general",
            })

    return samples


def process_panoramic(base_path: str) -> list[dict]:
    """Process the Panoramic Dental Xray Dataset.

    Args:
        base_path: Path to the 'Panoramic Dental Xray Dataset/Panoramic Dental Xray Dataset/' directory.

    Returns:
        List of dicts with keys: image, question, answer, source, split, condition.
    """
    firstpart_dir = os.path.join(base_path, "firstpart")
    secondpart_train_dir = os.path.join(base_path, "secondpart", "train")

    samples = []
    if os.path.isdir(firstpart_dir):
        samples.extend(_process_firstpart(firstpart_dir))
    else:
        print(f"Warning: firstpart directory not found at {firstpart_dir}")

    if os.path.isdir(secondpart_train_dir):
        samples.extend(_process_secondpart(secondpart_train_dir))
    else:
        print(f"Warning: secondpart/train directory not found at {secondpart_train_dir}")

    return samples


if __name__ == "__main__":
    base = os.path.join(
        os.path.dirname(__file__),
        "..", "datasets",
        "Panoramic Dental Xray Dataset",
        "Panoramic Dental Xray Dataset",
    )
    base = os.path.normpath(base)
    print(f"Dataset path: {base}")

    results = process_panoramic(base)
    print(f"\nTotal samples: {len(results)}")

    from collections import Counter as C2
    q_counts = C2(s["question"] for s in results)
    for q, c in q_counts.most_common():
        print(f"  [{c}] {q}")
