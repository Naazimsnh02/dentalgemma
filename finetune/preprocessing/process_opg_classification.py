"""
Process OPG Classification datasets (Dataset 2 & Dataset 3) into VQA pairs.

Dataset 2: Dental OPG Xray Dataset / Dental OPG (Classification)
Dataset 3: Dental OPG XRAY Dataset (Version 4) / ... / Dental OPG (Classification)

Both contain 6 class folders: BDC-BDR, Caries, Fractured Teeth, Healthy Teeth,
Impacted teeth, Infection. Images are deduplicated by (class, filename) across
datasets — if a filename appears in both, only the first occurrence is kept.
"""

import os
import random
from pathlib import Path
from PIL import Image

CLASS_FOLDERS = [
    "BDC-BDR",
    "Caries",
    "Fractured Teeth",
    "Healthy Teeth",
    "Impacted teeth",
    "Infection",
]

CONDITION_KEY = {
    "BDC-BDR": "bdc-bdr",
    "Caries": "caries",
    "Fractured Teeth": "fractured_teeth",
    "Healthy Teeth": "healthy_teeth",
    "Impacted teeth": "impacted_teeth",
    "Infection": "infection",
}

CLASS_ANSWERS = {
    "Healthy Teeth": (
        "This panoramic dental X-ray (OPG) shows healthy dentition. The teeth "
        "appear structurally intact with no visible signs of decay, fracture, or "
        "infection. The alveolar bone levels appear normal and the periodontal "
        "ligament spaces are within normal limits."
    ),
    "Caries": (
        "This panoramic dental X-ray (OPG) reveals dental caries (tooth decay). "
        "Dark areas indicating demineralization and cavitation are visible. The "
        "extent of decay should be assessed clinically to determine if the caries "
        "has reached the dentin or pulp, which would influence the treatment "
        "approach from simple restorations to root canal therapy."
    ),
    "Impacted teeth": (
        "This panoramic dental X-ray (OPG) shows impacted teeth - teeth that have "
        "failed to fully erupt into their expected position. This is commonly seen "
        "with third molars (wisdom teeth). The angulation and proximity to adjacent "
        "structures such as the inferior alveolar nerve should be evaluated to plan "
        "appropriate surgical intervention."
    ),
    "BDC-BDR": (
        "This panoramic dental X-ray (OPG) shows a broken down crown or root "
        "(BDC/BDR). Significant structural loss of the tooth crown is visible, "
        "potentially extending to the root. Assessment is needed to determine "
        "restorability - options range from post-and-core with crown restoration "
        "to extraction depending on the remaining tooth structure and periapical "
        "status."
    ),
    "Infection": (
        "This panoramic dental X-ray (OPG) shows signs of dental infection. "
        "Periapical radiolucency suggesting abscess formation is visible. This "
        "requires urgent clinical attention including appropriate antibiotic therapy "
        "if systemic signs are present, drainage of any abscess, and definitive "
        "treatment of the source tooth through root canal therapy or extraction."
    ),
    "Fractured Teeth": (
        "This panoramic dental X-ray (OPG) reveals a dental fracture. The fracture "
        "line may extend through enamel and dentin, and potentially involve the pulp "
        "chamber or root. The prognosis and treatment depend on the fracture "
        "location and extent - ranging from bonding/crown for coronal fractures to "
        "extraction for vertical root fractures."
    ),
}

QUESTION_TEMPLATES = [
    "What does this dental X-ray show?",
    "Analyze this panoramic dental radiograph and describe the findings.",
    "What dental condition is visible in this OPG X-ray?",
    "Please interpret this dental panoramic X-ray image.",
    "Describe the key findings in this dental radiograph.",
    "What is the diagnosis based on this OPG image?",
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}


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
        combined = dict(images_v4.get(cls_folder, {}))  # start with v4
        combined.update(images_v1.get(cls_folder, {}))   # v1 overwrites duplicates
        merged[cls_folder] = combined

    samples: list[dict] = []
    for cls_folder in CLASS_FOLDERS:
        answer = CLASS_ANSWERS[cls_folder]
        condition = CONDITION_KEY[cls_folder]

        for filename in sorted(merged[cls_folder]):
            img_path = merged[cls_folder][filename]
            try:
                img = Image.open(img_path).convert("RGB")
            except Exception as e:
                print(f"Warning: skipping {img_path}: {e}")
                continue

            question = rng.choice(QUESTION_TEMPLATES)

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

    # Print summary per condition
    from collections import Counter
    counts = Counter(s["condition"] for s in results)
    for cond, cnt in sorted(counts.items()):
        print(f"  {cond}: {cnt}")
