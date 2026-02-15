"""Process the Panoramic Dental Xray Dataset for VQA fine-tuning.

Handles two subsets:
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

FIRSTPART_QUESTIONS = [
    "How many teeth can you identify in this panoramic dental X-ray?",
    "Analyze this panoramic radiograph and describe the dentition.",
    "Describe the dental structures visible in this OPG X-ray.",
    "What can you identify in this panoramic dental radiograph?",
]

FIRSTPART_ANSWER_TEMPLATE = (
    "This panoramic dental X-ray shows approximately {n} identifiable teeth. "
    "The panoramic radiograph provides a comprehensive view of both dental arches, "
    "including the maxilla and mandible, temporomandibular joints, and surrounding "
    "structures. A systematic review should assess each tooth for caries, periapical "
    "pathology, and periodontal bone levels, along with evaluation of the maxillary "
    "sinuses and any incidental findings."
)

SECONDPART_QUESTIONS = [
    "Identify the types of teeth visible in this dental X-ray.",
    "What tooth types can you identify in this panoramic radiograph?",
    "Classify the teeth visible in this dental image.",
    "Describe the dental anatomy visible in this radiograph.",
]

SECONDPART_ANSWER_TEMPLATE = (
    "This dental X-ray shows the following tooth types: {types_list}. "
    "Each tooth type has distinct morphology - incisors for cutting, canines for "
    "tearing, premolars for crushing, and molars for grinding. The identification "
    "of tooth types is essential for dental charting, treatment planning, and "
    "forensic odontology."
)

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


def _process_firstpart(firstpart_dir: str) -> list[dict]:
    annotations_path = os.path.join(firstpart_dir, "annotations.json")
    with open(annotations_path, "r") as f:
        raw = json.load(f)

    via_data = raw.get("_via_img_metadata", raw)

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
        question = random.choice(FIRSTPART_QUESTIONS)
        answer = FIRSTPART_ANSWER_TEMPLATE.format(n=n_teeth)

        samples.append({
            "image": image,
            "question": question,
            "answer": answer,
            "source": "panoramic_dental_xray",
            "split": "train",
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
        image = Image.open(img_path).convert("RGB")
        question = random.choice(SECONDPART_QUESTIONS)
        answer = SECONDPART_ANSWER_TEMPLATE.format(types_list=types_list)

        samples.append({
            "image": image,
            "question": question,
            "answer": answer,
            "source": "panoramic_dental_xray",
            "split": "train",
        })

    return samples


def process_panoramic(base_path: str) -> list[dict]:
    """Process the Panoramic Dental Xray Dataset.

    Args:
        base_path: Path to the 'Panoramic Dental Xray Dataset/Panoramic Dental Xray Dataset/' directory.

    Returns:
        List of dicts with keys: image, question, answer, source, split.
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

    firstpart_count = sum(
        1 for s in results
        if "panoramic dental X-ray shows approximately" in s["answer"]
    )
    secondpart_count = len(results) - firstpart_count
    print(f"  Firstpart (segmentation): {firstpart_count}")
    print(f"  Secondpart (classification): {secondpart_count}")

    print("\nQuestion distribution:")
    q_counts = Counter(s["question"] for s in results)
    for q, c in q_counts.most_common():
        print(f"  [{c}] {q}")

    if results:
        print("\nSample entry:")
        sample = results[0]
        print(f"  Question: {sample['question']}")
        print(f"  Answer: {sample['answer'][:120]}...")
        print(f"  Image size: {sample['image'].size}")
        print(f"  Source: {sample['source']}")
        print(f"  Split: {sample['split']}")
