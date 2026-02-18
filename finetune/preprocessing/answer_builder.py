"""Compositional answer generation for diverse VQA training data.

Provides functions to build varied clinical answers by randomly combining
sentence components (intros, findings, context, recommendations).
This ensures that images with the same condition get different-sounding answers.
"""

import random

# ─── INTRO SENTENCES ───

OPG_INTROS = [
    "This panoramic radiograph reveals",
    "Upon examination of this OPG,",
    "This dental X-ray demonstrates",
    "Radiographic assessment shows",
    "This panoramic dental radiograph displays",
    "Analysis of this orthopantomogram indicates",
    "This OPG examination reveals",
]

PHOTO_INTROS = [
    "This clinical photograph shows",
    "Upon visual examination,",
    "This dental photograph reveals",
    "Clinical assessment of this image shows",
    "This intraoral photograph demonstrates",
]

# ─── CONDITION-SPECIFIC FINDINGS ───

FINDINGS = {
    "caries": [
        "dental caries with visible areas of demineralization and cavitation",
        "tooth decay appearing as dark radiolucent areas suggesting enamel and dentin breakdown",
        "carious lesions indicating progressive tooth decay",
        "areas of dental decay with potential dentin involvement",
        "cavitated lesions consistent with active dental caries",
    ],
    "infection": [
        "periapical radiolucency suggesting abscess formation",
        "signs of dental infection with periapical pathology",
        "evidence of periapical infection requiring clinical attention",
        "radiolucent areas at the root apex consistent with periapical abscess",
        "inflammatory changes indicative of dental infection",
    ],
    "healthy": [
        "healthy dentition with intact tooth structures",
        "normal dental anatomy without significant pathology",
        "well-maintained teeth with no visible signs of disease",
        "intact enamel and dentin with normal periodontal structures",
        "healthy dental structures with no evidence of decay or infection",
    ],
    "impacted": [
        "impacted teeth that have failed to erupt into normal occlusal position",
        "tooth impaction with potential impact on adjacent structures",
        "unerupted teeth showing signs of impaction requiring evaluation",
        "impacted third molars with angular displacement",
        "dental impaction that may require surgical intervention",
    ],
    "bdc_bdr": [
        "a broken down crown or root with significant structural loss",
        "extensively damaged tooth structure consistent with BDC/BDR",
        "severe coronal destruction with remaining root structure",
        "grossly decayed tooth with compromised crown integrity",
        "structural tooth breakdown requiring restorability assessment",
    ],
    "fractured": [
        "a dental fracture line extending through the tooth structure",
        "evidence of tooth fracture involving enamel and possibly dentin",
        "fractured tooth with potential pulp involvement",
        "a crack or fracture compromising tooth integrity",
        "dental trauma resulting in visible fracture of the affected tooth",
    ],
    "decay": [
        "visible signs of dental decay with discoloration and surface breakdown",
        "areas of tooth decay evident upon clinical inspection",
        "dental caries manifesting as dark spots or cavitated lesions",
        "progressive tooth decay with potential pulpal involvement",
        "clinically apparent dental caries requiring intervention",
    ],
    "normal": [
        "teeth that appear clinically healthy with no visible abnormalities",
        "normal oral health presentation without signs of decay or disease",
        "healthy tooth surfaces with intact enamel and no discoloration",
        "unremarkable dental findings consistent with good oral health",
        "clinically sound dentition with no pathological findings",
    ],
}

# ─── CLINICAL CONTEXT ───

CLINICAL_CONTEXTS = {
    "caries": [
        "This finding is clinically significant as untreated caries may progress to pulpal involvement.",
        "The extent of decay suggests the need for restorative intervention.",
        "Clinical correlation with patient symptoms is recommended to assess pulpal status.",
        "The affected tooth structure appears compromised, warranting further evaluation.",
        "Early intervention is advised to prevent further progression of the carious process.",
    ],
    "infection": [
        "This finding is clinically significant as it may indicate active periapical infection.",
        "The extent of periapical involvement suggests the need for endodontic evaluation.",
        "Prompt clinical assessment is recommended given the infectious nature of the findings.",
        "The periapical region appears compromised, warranting urgent evaluation.",
        "Systemic implications should be considered given the evidence of infection.",
    ],
    "healthy": [
        "The overall dental health appears well-maintained.",
        "Continued preventive care and regular follow-up are recommended.",
        "The dental structures demonstrate good oral hygiene maintenance.",
        "No immediate intervention is indicated based on these findings.",
        "Routine preventive measures should be continued to maintain this healthy status.",
    ],
    "impacted": [
        "This finding is clinically significant as impacted teeth may cause complications.",
        "The proximity to adjacent structures should be carefully evaluated.",
        "Surgical consultation may be warranted depending on patient symptoms.",
        "The angulation and depth of impaction require careful treatment planning.",
        "Potential complications include pericoronitis, cyst formation, or damage to adjacent teeth.",
    ],
    "bdc_bdr": [
        "This finding is clinically significant as it affects the restorability of the tooth.",
        "Assessment of remaining tooth structure is essential for treatment planning.",
        "The extent of destruction suggests limited options for conservative restoration.",
        "Clinical evaluation should determine whether the tooth is restorable.",
        "Crown-root ratio and periapical status must be assessed for prognosis.",
    ],
    "fractured": [
        "This finding is clinically significant as fracture extent determines treatment options.",
        "The fracture line should be evaluated for pulp involvement.",
        "Clinical examination should assess the extent and direction of the fracture.",
        "Prognosis depends on the type, location, and extent of the fracture.",
        "Immediate stabilization may be necessary to prevent further damage.",
    ],
    "decay": [
        "Clinical assessment suggests active decay requiring treatment.",
        "The extent of decay should be evaluated to determine appropriate restoration type.",
        "Early treatment can prevent progression to more serious complications.",
        "The affected areas warrant professional dental intervention.",
        "Patient education on oral hygiene may help prevent further decay.",
    ],
    "normal": [
        "The overall dental health appears well-maintained.",
        "Continued preventive care and regular follow-up are recommended.",
        "The dental structures demonstrate good oral hygiene maintenance.",
        "No immediate intervention is indicated based on these findings.",
        "Regular dental check-ups should be continued to maintain oral health.",
    ],
}

# ─── RECOMMENDATIONS ───

RECOMMENDATIONS = {
    "caries": [
        "Clinical correlation and restorative treatment are recommended.",
        "Follow-up with periapical radiographs is advised for affected teeth.",
        "Prompt dental evaluation is warranted to prevent further progression.",
        "A comprehensive treatment plan addressing all carious lesions should be developed.",
        "Dietary counseling and fluoride therapy may complement restorative treatment.",
    ],
    "infection": [
        "Urgent clinical evaluation and appropriate antibiotic therapy are recommended.",
        "Endodontic treatment or extraction should be considered based on restorability.",
        "Referral to an endodontist should be considered for complex cases.",
        "Prompt clinical evaluation is warranted given the infectious findings.",
        "Drainage of any abscess and definitive treatment of the source should be planned.",
    ],
    "healthy": [
        "Continued regular dental check-ups are recommended for preventive care.",
        "Maintaining current oral hygiene practices is advised.",
        "Routine dental maintenance every 6 months is suggested.",
        "No immediate treatment is necessary; continue preventive care.",
        "Professional dental cleaning at regular intervals is recommended.",
    ],
    "impacted": [
        "Surgical consultation for evaluation and possible extraction is recommended.",
        "Regular monitoring with periodic radiographs is advised if asymptomatic.",
        "Referral to an oral surgeon should be considered for complex impactions.",
        "Clinical evaluation of symptoms and complications is warranted.",
        "Treatment planning should consider the patient's age and symptomatology.",
    ],
    "bdc_bdr": [
        "Assessment of restorability by a prosthodontist is recommended.",
        "Treatment options range from post-and-core restoration to extraction.",
        "Clinical evaluation of remaining tooth structure is essential.",
        "Prompt treatment is needed to prevent further deterioration.",
        "A comprehensive restorative plan should be developed based on clinical findings.",
    ],
    "fractured": [
        "Immediate clinical evaluation to assess fracture extent is recommended.",
        "Stabilization and protective restoration should be considered promptly.",
        "Referral to a specialist may be needed for complex fractures.",
        "Prompt clinical evaluation is warranted to prevent further damage.",
        "Follow-up monitoring for pulp vitality is essential after fracture management.",
    ],
    "decay": [
        "Professional dental evaluation and appropriate restorative treatment are recommended.",
        "Improved oral hygiene practices and dietary modifications are advised.",
        "Follow-up assessment to monitor treatment outcomes is recommended.",
        "A preventive care plan should be established to address risk factors.",
        "Fluoride application and sealants may help prevent further decay.",
    ],
    "normal": [
        "Continued regular dental check-ups are recommended for preventive care.",
        "Maintaining current oral hygiene practices is advised.",
        "Routine dental maintenance every 6 months is suggested.",
        "No immediate treatment is necessary; continue preventive care.",
        "Professional dental cleaning at regular intervals is recommended.",
    ],
}

# ─── SEVERITY DESCRIPTIONS ───

SEVERITY_DESCRIPTIONS = {
    "mild": [
        "The findings suggest mild involvement with early-stage changes.",
        "The severity appears to be mild, with limited tissue involvement.",
        "Early-stage changes are noted, suggesting mild pathology.",
    ],
    "moderate": [
        "The extent of involvement suggests moderate severity requiring treatment.",
        "Moderate changes are observed, indicating the need for clinical intervention.",
        "The findings indicate moderate severity with established pathological changes.",
    ],
    "severe": [
        "Significant pathological changes indicate severe involvement.",
        "The severity is considerable, requiring urgent clinical attention.",
        "Advanced changes are noted, suggesting severe and extensive pathology.",
    ],
}

# ─── URGENCY MAPPINGS ───

CONDITION_URGENCY = {
    "healthy": "routine",
    "caries": "moderate",
    "infection": "urgent",
    "fractured": "emergency",
    "impacted": "elective",
    "bdc_bdr": "moderate to urgent",
    "decay": "moderate",
    "normal": "routine",
}


def build_answer(
    condition: str,
    image_type: str = "xray",
    severity: str = "moderate",
    location: str | None = None,
    rng: random.Random | None = None,
) -> str:
    """Build a compositionally varied clinical answer.

    Args:
        condition: One of 'healthy', 'caries', 'infection', 'impacted',
                   'bdc_bdr', 'fractured', 'decay', 'normal'.
        image_type: 'xray' or 'photo' — selects appropriate intro set.
        severity: 'mild', 'moderate', or 'severe'.
        location: Optional region string like "right mandibular region".
        rng: Random instance for reproducibility.

    Returns:
        A unique-sounding clinical answer string.
    """
    rng = rng or random.Random()

    # Select intro based on image type
    if image_type == "photo":
        intro = rng.choice(PHOTO_INTROS)
    else:
        intro = rng.choice(OPG_INTROS)

    # Select finding description
    condition_key = condition.lower().replace(" ", "_").replace("-", "_")
    finding_options = FINDINGS.get(condition_key, FINDINGS["healthy"])
    finding = rng.choice(finding_options)

    # Add location if provided
    if location:
        finding = f"in the {location}, {finding}"

    # Select clinical context
    context_options = CLINICAL_CONTEXTS.get(condition_key, CLINICAL_CONTEXTS["healthy"])
    context = rng.choice(context_options)

    # Select severity description
    severity_options = SEVERITY_DESCRIPTIONS.get(severity, SEVERITY_DESCRIPTIONS["moderate"])
    severity_desc = rng.choice(severity_options)

    # Select recommendation
    rec_options = RECOMMENDATIONS.get(condition_key, RECOMMENDATIONS["healthy"])
    recommendation = rng.choice(rec_options)

    return f"{intro} {finding}. {severity_desc} {context} {recommendation}"


def build_multi_finding_answer(
    findings_list: list[dict],
    image_type: str = "xray",
    rng: random.Random | None = None,
) -> str:
    """Build an answer describing multiple findings with locations.

    Args:
        findings_list: List of dicts with keys 'condition', 'location', 'severity'.
        image_type: 'xray' or 'photo'.
        rng: Random instance for reproducibility.

    Returns:
        A structured clinical answer covering all findings.
    """
    rng = rng or random.Random()

    if image_type == "photo":
        intro = rng.choice(PHOTO_INTROS)
    else:
        intro = rng.choice(OPG_INTROS)

    parts = [f"{intro} the following findings:"]

    for i, f in enumerate(findings_list, 1):
        condition_key = f["condition"].lower().replace(" ", "_").replace("-", "_")
        finding_options = FINDINGS.get(condition_key, FINDINGS["healthy"])
        finding = rng.choice(finding_options)
        location = f.get("location", "")
        if location:
            parts.append(f"  {i}. In the {location}: {finding}.")
        else:
            parts.append(f"  {i}. {finding.capitalize()}.")

    # Add overall context
    primary_condition = findings_list[0]["condition"] if findings_list else "healthy"
    condition_key = primary_condition.lower().replace(" ", "_").replace("-", "_")
    context_options = CLINICAL_CONTEXTS.get(condition_key, CLINICAL_CONTEXTS["healthy"])
    rec_options = RECOMMENDATIONS.get(condition_key, RECOMMENDATIONS["healthy"])

    parts.append(rng.choice(context_options))
    parts.append(rng.choice(rec_options))

    return "\n".join(parts)
