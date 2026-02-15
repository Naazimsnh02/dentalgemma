"""Process the Dental Cavity Detection Dataset into VQA pairs.

Parses YOLOv5-OBB (DOTA format) label files to count cavity and normal
regions per image, then generates clinically descriptive question-answer pairs.
Label format per line: x1 y1 x2 y2 x3 y3 x4 y4 class_name difficulty
"""

import random
from pathlib import Path

from PIL import Image
from tqdm import tqdm

QUESTIONS = [
    "Analyze this dental X-ray image. Describe what you observe, noting any cavities or abnormalities.",
    "What findings can you identify in this dental radiograph? Look for cavities or signs of decay.",
    "Examine this dental X-ray for cavities or other abnormalities and describe your observations.",
    "Provide a detailed assessment of this dental X-ray, focusing on any areas of tooth decay.",
    "Review this dental radiograph and report any cavities, decay, or abnormal findings.",
    "What does this dental X-ray reveal about the patient's oral health? Note any cavities present.",
]

ANSWER_CAVITY_ONLY = (
    "This dental X-ray shows {n} cavity region(s) detected. "
    "Cavities appear as dark areas indicating tooth decay and demineralization. "
    "The affected areas require clinical evaluation for potential restorative "
    "treatment such as fillings or crowns depending on severity."
)

ANSWER_NORMAL_ONLY = (
    "This dental X-ray appears normal with no cavities detected. "
    "The tooth structures show intact enamel and dentin without visible signs "
    "of decay or demineralization."
)

ANSWER_MIXED = (
    "This dental X-ray shows a mix of findings: {n_cavity} cavity region(s) "
    "and {n_normal} normal region(s). The cavities appear as dark areas "
    "suggesting decay, while other tooth structures appear intact. "
    "Clinical correlation is recommended."
)

SPLITS = ["train", "test", "valid"]


def _parse_label_file(label_path: Path) -> tuple[int, int]:
    """Parse a DOTA-format label file and return (n_cavity, n_normal)."""
    n_cavity = 0
    n_normal = 0

    for line in label_path.read_text().strip().splitlines():
        parts = line.strip().split()
        if len(parts) < 9:
            continue
        class_name = parts[8]
        if class_name == "cavity":
            n_cavity += 1
        elif class_name == "normal":
            n_normal += 1

    return n_cavity, n_normal


def _generate_answer(n_cavity: int, n_normal: int) -> str:
    """Generate a clinically descriptive answer based on region counts."""
    if n_cavity > 0 and n_normal == 0:
        return ANSWER_CAVITY_ONLY.format(n=n_cavity)
    elif n_cavity == 0 and n_normal > 0:
        return ANSWER_NORMAL_ONLY
    elif n_cavity > 0 and n_normal > 0:
        return ANSWER_MIXED.format(n_cavity=n_cavity, n_normal=n_normal)
    # No annotations at all
    return ANSWER_NORMAL_ONLY


def process_cavity_detection(
    base_path: str = "../datasets/Dental Cavity Detection Dataset/",
) -> list[dict]:
    """Process the Dental Cavity Detection Dataset into VQA-format dicts.

    Args:
        base_path: Path to the dataset root containing train/, test/, valid/.

    Returns:
        List of dicts with keys: image, question, answer, source, split.
    """
    base_path = Path(base_path)
    samples = []

    for split in SPLITS:
        images_dir = base_path / split / "images"
        labels_dir = base_path / split / "labelTxt"

        if not images_dir.is_dir():
            print(f"Warning: image directory not found: {images_dir}")
            continue

        image_files = sorted(
            f for f in images_dir.iterdir()
            if f.suffix.lower() in (".jpg", ".jpeg", ".png")
        )
        print(f"[{split}] Found {len(image_files)} images")

        for img_path in tqdm(image_files, desc=f"Processing {split}"):
            label_path = labels_dir / (img_path.stem + ".txt")

            if not label_path.exists():
                print(f"Warning: label file not found, skipping: {label_path.name}")
                continue

            n_cavity, n_normal = _parse_label_file(label_path)
            answer = _generate_answer(n_cavity, n_normal)
            question = random.choice(QUESTIONS)
            image = Image.open(img_path).convert("RGB")

            samples.append({
                "image": image,
                "question": question,
                "answer": answer,
                "source": "dental_cavity_detection",
                "split": split,
            })

    print(f"\nTotal VQA samples: {len(samples)}")
    return samples


if __name__ == "__main__":
    random.seed(42)
    data = process_cavity_detection()

    for split in SPLITS:
        split_samples = [s for s in data if s["split"] == split]
        n_cavity = sum(1 for s in split_samples if "cavity region(s) detected" in s["answer"])
        n_normal = sum(1 for s in split_samples if "no cavities detected" in s["answer"])
        n_mixed = sum(1 for s in split_samples if "mix of findings" in s["answer"])
        print(f"  {split}: {len(split_samples)} total "
              f"(cavity={n_cavity}, normal={n_normal}, mixed={n_mixed})")
