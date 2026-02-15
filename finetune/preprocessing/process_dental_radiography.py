"""Process the Dental Radiography dataset into VQA pairs.

Generates question-answer pairs for dental radiograph description/analysis.
Since the dataset has no separate labels, a clinically appropriate template
answer is used. Augmented images (same numeric prefix) are deduplicated by
keeping only the first filename alphabetically per prefix.
"""

import os
import random
from collections import defaultdict
from pathlib import Path

from PIL import Image
from tqdm import tqdm

QUESTIONS = [
    "Describe this dental radiograph and note any findings.",
    "What do you observe in this dental X-ray image?",
    "Analyze this intraoral dental radiograph.",
    "Provide a radiographic assessment of this dental image.",
    "Examine this dental X-ray and describe the visible structures.",
    "What are the key findings in this dental radiograph?",
]

ANSWER = (
    "This is a dental radiograph showing tooth and surrounding structures. "
    "A systematic radiographic assessment should evaluate: "
    "(1) the crown for any carious lesions appearing as radiolucent areas, "
    "(2) existing restorations for marginal integrity, "
    "(3) the root morphology and periapical region for any radiolucency suggesting infection, "
    "(4) the periodontal ligament space for widening, "
    "(5) the alveolar bone level for signs of bone loss, and "
    "(6) any other incidental findings. "
    "Clinical correlation with patient symptoms and examination findings is "
    "essential for definitive diagnosis."
)

SPLITS = ["train", "test", "valid"]


def _get_unique_images(split_dir: str) -> list[str]:
    """Return one image per numeric prefix, picking the first alphabetically."""
    files = sorted(
        f for f in os.listdir(split_dir)
        if f.lower().endswith((".jpg", ".jpeg", ".png"))
    )

    prefix_to_file: dict[str, str] = {}
    for fname in files:
        prefix = fname.split("_")[0]
        if prefix not in prefix_to_file:
            prefix_to_file[prefix] = fname

    return list(prefix_to_file.values())


def process_dental_radiography(base_path: str = "../datasets/Dental Radiography/") -> list[dict]:
    """Process the Dental Radiography dataset into VQA-format dicts.

    Args:
        base_path: Path to the dataset root containing train/, test/, valid/.

    Returns:
        List of dicts with keys: image, question, answer, source, split.
    """
    base_path = Path(base_path)
    samples = []

    for split in SPLITS:
        split_dir = base_path / split
        if not split_dir.is_dir():
            print(f"Warning: split directory not found: {split_dir}")
            continue

        unique_files = _get_unique_images(str(split_dir))
        print(f"[{split}] {len(unique_files)} unique images "
              f"(from {len(os.listdir(split_dir))} total files)")

        for fname in tqdm(unique_files, desc=f"Processing {split}"):
            img_path = split_dir / fname
            image = Image.open(img_path).convert("RGB")
            question = random.choice(QUESTIONS)

            samples.append({
                "image": image,
                "question": question,
                "answer": ANSWER,
                "source": "dental_radiography",
                "split": split,
            })

    print(f"\nTotal VQA samples: {len(samples)}")
    return samples


if __name__ == "__main__":
    random.seed(42)
    data = process_dental_radiography()
    for split in SPLITS:
        count = sum(1 for s in data if s["split"] == split)
        print(f"  {split}: {count}")
