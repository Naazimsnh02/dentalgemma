"""Process OPG Object Detection dataset into location-aware VQA pairs.

Reads YOLO bounding box annotations for 6 pathology classes and generates
VQA pairs that include anatomical location information derived from
normalized bounding box coordinates.

Dataset: Dental OPG Xray Dataset / Dental OPG (Object Detection)
Format: YOLO (class_id center_x center_y width height, all normalized 0-1)
"""

import random
from pathlib import Path
from collections import defaultdict

from PIL import Image
from tqdm import tqdm

from answer_builder import build_answer, build_multi_finding_answer

CLASS_MAP = {
    0: "BDC-BDR",
    1: "Caries",
    2: "Fractured Teeth",
    3: "Healthy Teeth",
    4: "Impacted teeth",
    5: "Infection",
}

CONDITION_KEY = {
    "BDC-BDR": "bdc_bdr",
    "Caries": "caries",
    "Fractured Teeth": "fractured",
    "Healthy Teeth": "healthy",
    "Impacted teeth": "impacted",
    "Infection": "infection",
}

CONDITION_DISPLAY = {
    "BDC-BDR": "broken down crown or root",
    "Caries": "dental caries",
    "Fractured Teeth": "dental fracture",
    "Healthy Teeth": "healthy dentition",
    "Impacted teeth": "impacted teeth",
    "Infection": "dental infection",
}

SPLITS = ["train", "test", "valid"]

# ─── QUESTION TEMPLATES ───

QUESTIONS_TYPE1_LOCALIZED = [
    "Describe any pathological findings in this panoramic radiograph and their locations.",
    "What findings are visible in this dental X-ray, and where are they located?",
    "Identify and locate any abnormalities in this OPG radiograph.",
]

QUESTIONS_TYPE2_YESNO_TEMPLATE = "Are there any {condition} visible in this X-ray?"

QUESTIONS_TYPE3_REPORT = [
    "Provide a radiographic report for this dental OPG.",
    "Generate a structured radiographic report for this panoramic dental X-ray.",
    "Create a systematic dental report based on this OPG radiograph.",
]

QUESTIONS_TYPE4_REGION = [
    "What findings are present in the posterior regions of this panoramic X-ray?",
    "Describe the findings in the anterior region of this dental radiograph.",
    "What abnormalities can be identified in the mandibular region of this OPG?",
]

# Augmentation suffixes to filter out
AUGMENTATION_SUFFIXES = [
    "_aug", "_flip", "_rot", "_bright", "_contrast", "_noise",
    "_blur", "_crop", "_scale", "_mirror", "_enhanced",
]


def get_dental_region(center_x: float, center_y: float) -> str:
    """Convert normalized bbox center to dental region description.

    OPG layout (patient's perspective — radiograph is mirrored):
      Left side of image = patient's RIGHT side
      Right side of image = patient's LEFT side
      Top half = maxilla (upper jaw)
      Bottom half = mandible (lower jaw)
    """
    if center_x < 0.33:
        horizontal = "right"
    elif center_x < 0.67:
        horizontal = "anterior"
    else:
        horizontal = "left"

    vertical = "maxillary" if center_y < 0.5 else "mandibular"
    return f"{horizontal} {vertical} region"


def _is_original_image(filename: str) -> bool:
    """Check if an image is original (not augmented)."""
    stem = Path(filename).stem.lower()
    for suffix in AUGMENTATION_SUFFIXES:
        if suffix in stem:
            return False
    return True


def _parse_yolo_label(label_path: Path) -> list[dict]:
    """Parse YOLO label file and return list of annotations.

    Each annotation dict has: class_name, condition_key, region, center_x, center_y
    """
    annotations = []
    if not label_path.exists():
        return annotations

    for line in label_path.read_text().strip().splitlines():
        parts = line.strip().split()
        if len(parts) < 5:
            continue

        class_id = int(parts[0])
        center_x = float(parts[1])
        center_y = float(parts[2])

        class_name = CLASS_MAP.get(class_id)
        if class_name is None:
            continue

        region = get_dental_region(center_x, center_y)
        annotations.append({
            "class_name": class_name,
            "condition_key": CONDITION_KEY[class_name],
            "region": region,
            "center_x": center_x,
            "center_y": center_y,
        })

    return annotations


def _group_by_region(annotations: list[dict]) -> dict[str, list[str]]:
    """Group findings by dental region."""
    grouped: dict[str, list[str]] = defaultdict(list)
    for ann in annotations:
        display = CONDITION_DISPLAY[ann["class_name"]]
        if display not in grouped[ann["region"]]:
            grouped[ann["region"]].append(display)
    return dict(grouped)


def _generate_type1_answer(annotations: list[dict], rng: random.Random) -> str:
    """Localized findings answer."""
    if not annotations:
        return build_answer("healthy", image_type="xray", severity="mild", rng=rng)

    grouped = _group_by_region(annotations)
    findings_list = []
    for region, conditions in grouped.items():
        for cond_display in conditions:
            cond_key = None
            for k, v in CONDITION_DISPLAY.items():
                if v == cond_display:
                    cond_key = CONDITION_KEY[k]
                    break
            findings_list.append({
                "condition": cond_key or "healthy",
                "location": region,
                "severity": "moderate",
            })

    return build_multi_finding_answer(findings_list, image_type="xray", rng=rng)


def _generate_type2_answer(annotations: list[dict], asked_condition: str, rng: random.Random) -> str:
    """Condition presence Yes/No answer."""
    present_classes = {ann["class_name"] for ann in annotations}
    asked_display = CONDITION_DISPLAY[asked_condition]

    if asked_condition in present_classes:
        locations = [ann["region"] for ann in annotations if ann["class_name"] == asked_condition]
        unique_locations = list(dict.fromkeys(locations))
        loc_str = ", ".join(unique_locations)
        cond_key = CONDITION_KEY[asked_condition]
        base = build_answer(cond_key, image_type="xray", severity="moderate", location=unique_locations[0], rng=rng)
        return f"Yes, {asked_display} is visible in this radiograph, specifically in the {loc_str}. {base}"
    else:
        actual_conditions = [CONDITION_DISPLAY[c] for c in present_classes if c != "Healthy Teeth"]
        if actual_conditions:
            actual_str = ", ".join(actual_conditions)
            return f"No, this radiograph does not show {asked_display}. The findings present include {actual_str}."
        else:
            base = build_answer("healthy", image_type="xray", severity="mild", rng=rng)
            return f"No, this radiograph does not show {asked_display}. The dental structures appear healthy. {base}"


def _generate_type3_answer(annotations: list[dict], rng: random.Random) -> str:
    """Structured radiographic report answer."""
    grouped = _group_by_region(annotations)

    parts = ["Radiographic Report:"]
    if not grouped:
        parts.append("- All regions: No significant pathological findings identified.")
        base = build_answer("healthy", image_type="xray", severity="mild", rng=rng)
        parts.append(f"Overall: {base}")
        return "\n".join(parts)

    for region in sorted(grouped.keys()):
        conditions = grouped[region]
        cond_str = ", ".join(conditions)
        parts.append(f"- {region.capitalize()}: {cond_str} detected.")

    pathological = [c for c in {ann["class_name"] for ann in annotations} if c != "Healthy Teeth"]
    if pathological:
        parts.append(f"Overall: Multiple findings identified requiring clinical evaluation and appropriate management.")
    else:
        parts.append(f"Overall: Dental structures appear within normal limits.")

    primary = annotations[0]["condition_key"] if annotations else "healthy"
    rec = build_answer(primary, image_type="xray", severity="moderate", rng=rng)
    parts.append(rec)

    return "\n".join(parts)


def _generate_type4_answer(annotations: list[dict], rng: random.Random) -> str:
    """Region-specific query answer."""
    # Pick a region category to focus on
    region_focus = rng.choice(["posterior", "anterior", "mandibular", "maxillary"])

    matching = [
        ann for ann in annotations
        if region_focus in ann["region"]
    ]

    if matching:
        findings_list = []
        for ann in matching:
            findings_list.append({
                "condition": ann["condition_key"],
                "location": ann["region"],
                "severity": "moderate",
            })
        base = build_multi_finding_answer(findings_list, image_type="xray", rng=rng)
        return f"In the {region_focus} regions of this panoramic X-ray: {base}"
    else:
        return f"The {region_focus} regions of this panoramic X-ray appear unremarkable with no significant pathological findings identified in these areas."


def _generate_qa_pairs(annotations: list[dict], rng: random.Random) -> list[tuple[str, str]]:
    """Generate 2-3 question-answer pairs for an image."""
    all_types = [1, 2, 3, 4]
    n_questions = rng.choice([2, 2, 3])
    chosen_types = rng.sample(all_types, n_questions)

    pairs = []
    for qt in chosen_types:
        if qt == 1:
            question = rng.choice(QUESTIONS_TYPE1_LOCALIZED)
            answer = _generate_type1_answer(annotations, rng)
        elif qt == 2:
            asked = rng.choice(list(CLASS_MAP.values()))
            question = QUESTIONS_TYPE2_YESNO_TEMPLATE.format(
                condition=CONDITION_DISPLAY[asked]
            )
            answer = _generate_type2_answer(annotations, asked, rng)
        elif qt == 3:
            question = rng.choice(QUESTIONS_TYPE3_REPORT)
            answer = _generate_type3_answer(annotations, rng)
        else:
            question = rng.choice(QUESTIONS_TYPE4_REGION)
            answer = _generate_type4_answer(annotations, rng)

        pairs.append((question, answer))

    return pairs


def process_opg_detection(
    base_path: str = "../datasets/Dental OPG Xray Dataset/Dental OPG (Object Detection)/",
) -> list[dict]:
    """Process OPG Object Detection dataset into location-aware VQA pairs.

    Args:
        base_path: Path to the Object Detection dataset root.

    Returns:
        List of dicts with keys: image, question, answer, source, split, condition.
    """
    base_path = Path(base_path)
    rng = random.Random(42)
    samples = []

    for split in SPLITS:
        images_dir = base_path / split / "images"
        labels_dir = base_path / split / "labels"

        # Handle potential "Augmented Dataset" subdirectory
        if not images_dir.is_dir() and (base_path / "Augmented Dataset" / split / "images").is_dir():
            images_dir = base_path / "Augmented Dataset" / split / "images"
            labels_dir = base_path / "Augmented Dataset" / split / "labels"

        if not images_dir.is_dir():
            print(f"Warning: image directory not found: {images_dir}")
            continue

        image_files = sorted(
            f for f in images_dir.iterdir()
            if f.suffix.lower() in (".jpg", ".jpeg", ".png")
        )

        # Deduplicate based on base filename (handle Roboflow .rf. exports)
        unique_images = {}
        for f in image_files:
            # Extract base name: "100_jpg.rf.xyz" -> "100_jpg"
            if ".rf." in f.name:
                base_name = f.name.split(".rf.")[0]
            else:
                base_name = f.stem
            
            # Skip explicit augmentations if marked in name
            if not _is_original_image(f.name):
                continue
                
            # Keep first instance of each base image
            if base_name not in unique_images:
                unique_images[base_name] = f
        
        original_files = sorted(unique_images.values())
        print(f"[{split}] Found {len(image_files)} files, keeping {len(original_files)} unique base images")

        for img_path in tqdm(original_files, desc=f"Processing {split}"):
            label_path = labels_dir / (img_path.stem + ".txt")
            annotations = _parse_yolo_label(label_path)

            if not annotations:
                continue

            image = Image.open(img_path).convert("RGB")

            # Determine primary condition
            pathological = [a for a in annotations if a["class_name"] != "Healthy Teeth"]
            if pathological:
                primary_condition = pathological[0]["condition_key"]
            else:
                primary_condition = "healthy"

            qa_pairs = _generate_qa_pairs(annotations, rng)

            for question, answer in qa_pairs:
                samples.append({
                    "image": image,
                    "question": question,
                    "answer": answer,
                    "source": "opg_object_detection",
                    "split": split,
                    "condition": primary_condition,
                })

    print(f"\nTotal OPG Object Detection VQA samples: {len(samples)}")
    return samples


if __name__ == "__main__":
    base = str(
        Path(__file__).resolve().parent.parent
        / "datasets"
        / "Dental OPG Xray Dataset"
        / "Dental OPG (Object Detection)"
    )
    print(f"Dataset path: {base}")

    results = process_opg_detection(base)
    print(f"\nTotal samples: {len(results)}")

    from collections import Counter
    cond_counts = Counter(s["condition"] for s in results)
    for cond, cnt in sorted(cond_counts.items()):
        print(f"  {cond}: {cnt}")
