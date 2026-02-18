"""Process the Dental Cavity Detection Dataset into VQA pairs.

Parses YOLOv5-OBB (DOTA format) label files to count cavity and normal
regions per image, then generates clinically descriptive question-answer pairs
using compositional answer generation for diversity.

IMPORTANT: These are clinical PHOTOGRAPHS, NOT X-rays.
Label format per line: x1 y1 x2 y2 x3 y3 x4 y4 class_name difficulty
"""

import random
from pathlib import Path

from PIL import Image
from tqdm import tqdm

from answer_builder import build_answer, PHOTO_INTROS, FINDINGS, RECOMMENDATIONS

SPLITS = ["train", "test", "valid"]

# ─── QUESTION TYPES ───

QUESTIONS_TYPE1_BINARY = [
    "Does this clinical dental photograph show any signs of cavities or tooth decay?",
    "Are there any visible cavities in this dental photograph?",
    "Can you identify any tooth decay in this clinical photograph?",
]

QUESTIONS_TYPE2_DESCRIPTION = [
    "Describe the oral health condition visible in this dental photograph.",
    "What oral health findings are visible in this clinical dental photograph?",
    "Provide a clinical description of what you observe in this dental photograph.",
]

QUESTIONS_TYPE3_SEVERITY = [
    "Assess the severity of dental issues visible in this image.",
    "How severe are the dental conditions shown in this clinical photograph?",
    "Evaluate the extent of any dental problems visible in this photograph.",
]

QUESTIONS_TYPE4_IDENTIFICATION = [
    "What type of dental image is this, and what can you assess from it?",
    "Identify the type of this dental image and describe your observations.",
]

QUESTIONS_TYPE5_TREATMENT = [
    "Based on this clinical photograph, what follow-up would you recommend?",
    "What treatment recommendations would you make based on this dental photograph?",
    "What clinical follow-up is appropriate given the findings in this photograph?",
]


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


def _get_severity(n_cavity: int) -> str:
    """Map cavity count to severity level."""
    if n_cavity == 0:
        return "none"
    elif n_cavity <= 2:
        return "mild"
    elif n_cavity <= 5:
        return "moderate"
    else:
        return "severe"


def _generate_type1_answer(n_cavity: int, rng: random.Random) -> str:
    """Binary classification answer."""
    if n_cavity > 0:
        base = build_answer("decay", image_type="photo", severity=_get_severity(n_cavity), rng=rng)
        return f"Yes, this clinical photograph shows visible signs of dental caries. {base}"
    else:
        base = build_answer("normal", image_type="photo", severity="mild", rng=rng)
        return f"No, the teeth in this photograph appear clinically healthy without visible signs of decay. {base}"


def _generate_type2_answer(n_cavity: int, n_normal: int, rng: random.Random) -> str:
    """Clinical description answer."""
    if n_cavity == 0:
        return build_answer("normal", image_type="photo", severity="mild", rng=rng)
    elif n_normal == 0:
        return build_answer("decay", image_type="photo", severity=_get_severity(n_cavity), rng=rng)
    else:
        condition = "decay" if n_cavity > n_normal else "normal"
        severity = _get_severity(n_cavity)
        base = build_answer(condition, image_type="photo", severity=severity, rng=rng)
        return f"{base} Both affected and healthy tooth regions are visible in this photograph."


def _generate_type3_answer(n_cavity: int, rng: random.Random) -> str:
    """Severity assessment answer."""
    severity = _get_severity(n_cavity)
    severity_descriptions = {
        "none": "No visible dental issues are identified in this clinical photograph. The teeth appear healthy with intact enamel surfaces.",
        "mild": "Mild dental decay is observed, with limited areas of concern. Early intervention with dental fillings may be sufficient to address the affected areas.",
        "moderate": "Moderate decay is present requiring multiple restorations. Several teeth show signs of carious involvement that warrant prompt dental treatment.",
        "severe": "Severe and extensive decay is evident requiring urgent comprehensive treatment. Multiple teeth are significantly affected, and referral for comprehensive restorative care is strongly recommended.",
    }
    base_desc = severity_descriptions[severity]
    context = build_answer("decay" if n_cavity > 0 else "normal", image_type="photo", severity=severity if severity != "none" else "mild", rng=rng)
    return f"{base_desc} {context}"


def _generate_type4_answer(n_cavity: int, rng: random.Random) -> str:
    """Image type identification answer."""
    intro = rng.choice(PHOTO_INTROS)
    if n_cavity > 0:
        finding = rng.choice(FINDINGS.get("decay", FINDINGS["normal"]))
        return f"This is a clinical dental photograph showing an intraoral view of the patient's teeth and surrounding soft tissues. {intro} {finding}. Clinical photographs like this are valuable for documenting visible conditions and monitoring treatment progress."
    else:
        finding = rng.choice(FINDINGS.get("normal", FINDINGS["healthy"]))
        return f"This is a clinical dental photograph showing an intraoral view of the patient's teeth and surrounding soft tissues. {intro} {finding}. Clinical photographs are useful for baseline documentation and tracking oral health over time."


def _generate_type5_answer(n_cavity: int, rng: random.Random) -> str:
    """Treatment recommendation answer."""
    severity = _get_severity(n_cavity)
    rec = rng.choice(RECOMMENDATIONS.get("decay" if n_cavity > 0 else "normal", RECOMMENDATIONS["normal"]))
    
    treatment_map = {
        "none": "Routine preventive care is recommended, including regular dental check-ups every six months, professional cleanings, and continued good oral hygiene practices.",
        "mild": "Dental fillings or composite restorations are recommended for the affected areas. Early treatment will prevent progression to more extensive decay.",
        "moderate": "Multiple restorations are needed. A comprehensive treatment plan should be developed, potentially including composite fillings, crowns, and possibly root canal therapy for more extensively involved teeth.",
        "severe": "Urgent comprehensive dental treatment is required. Referral to a restorative specialist is recommended. Treatment may include multiple restorations, root canal therapy, crowns, and potentially extractions for non-restorable teeth.",
    }
    base = treatment_map[severity]
    return f"{base} {rec}"


def _generate_qa_pairs(n_cavity: int, n_normal: int, filename: str, rng: random.Random) -> list[tuple[str, str]]:
    """Generate 1-2 question-answer pairs for an image."""
    # Use filename as additional signal
    is_healthy_prefix = filename.lower().startswith("healthy")
    
    # If filename says healthy but labels say cavities (or vice versa), trust labels
    all_types = [1, 2, 3, 4, 5]
    
    # Pick 1-2 types
    n_questions = rng.choice([1, 2])
    chosen_types = rng.sample(all_types, n_questions)
    
    pairs = []
    for qt in chosen_types:
        if qt == 1:
            question = rng.choice(QUESTIONS_TYPE1_BINARY)
            answer = _generate_type1_answer(n_cavity, rng)
        elif qt == 2:
            question = rng.choice(QUESTIONS_TYPE2_DESCRIPTION)
            answer = _generate_type2_answer(n_cavity, n_normal, rng)
        elif qt == 3:
            question = rng.choice(QUESTIONS_TYPE3_SEVERITY)
            answer = _generate_type3_answer(n_cavity, rng)
        elif qt == 4:
            question = rng.choice(QUESTIONS_TYPE4_IDENTIFICATION)
            answer = _generate_type4_answer(n_cavity, rng)
        else:
            question = rng.choice(QUESTIONS_TYPE5_TREATMENT)
            answer = _generate_type5_answer(n_cavity, rng)
        
        pairs.append((question, answer))
    
    return pairs


def process_cavity_detection(
    base_path: str = "../datasets/Dental Cavity Detection Dataset/",
) -> list[dict]:
    """Process the Dental Cavity Detection Dataset into VQA-format dicts.

    Args:
        base_path: Path to the dataset root containing train/, test/, valid/.

    Returns:
        List of dicts with keys: image, question, answer, source, split, condition.
    """
    base_path = Path(base_path)
    rng = random.Random(42)
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
            image = Image.open(img_path).convert("RGB")
            
            condition = "decay" if n_cavity > 0 else "normal"
            qa_pairs = _generate_qa_pairs(n_cavity, n_normal, img_path.stem, rng)

            for question, answer in qa_pairs:
                samples.append({
                    "image": image,
                    "question": question,
                    "answer": answer,
                    "source": "dental_cavity_detection",
                    "split": split,
                    "condition": condition,
                })

    print(f"\nTotal VQA samples: {len(samples)}")
    return samples


if __name__ == "__main__":
    random.seed(42)
    data = process_cavity_detection()

    for split in SPLITS:
        split_samples = [s for s in data if s["split"] == split]
        n_decay = sum(1 for s in split_samples if s.get("condition") == "decay")
        n_normal = sum(1 for s in split_samples if s.get("condition") == "normal")
        print(f"  {split}: {len(split_samples)} total (decay={n_decay}, normal={n_normal})")
