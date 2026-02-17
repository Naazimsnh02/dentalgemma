import { DentalCondition } from '@/types';

/**
 * 98 Dental Conditions from DentalGemma Training Data
 * Organized by 8 categories
 */
export const dentalConditions: DentalCondition[] = [
  // Preventive Care (12 conditions)
  {
    id: 'dental-cleaning',
    name: 'Dental Cleaning',
    category: 'Preventive Care',
    description: 'Professional teeth cleaning to remove plaque and tartar',
    symptoms: ['Plaque buildup', 'Tartar accumulation', 'Gum inflammation'],
    causes: ['Poor oral hygiene', 'Irregular dental visits'],
    treatments: ['Professional scaling', 'Polishing', 'Fluoride treatment'],
    prevention: ['Regular brushing', 'Flossing daily', 'Routine dental visits'],
    relatedConditions: ['gingivitis', 'periodontitis'],
    icon: '🦷'
  },
  {
    id: 'fluoride-treatment',
    name: 'Fluoride Treatment',
    category: 'Preventive Care',
    description: 'Application of fluoride to strengthen tooth enamel',
    symptoms: ['Weak enamel', 'Cavity-prone teeth'],
    causes: ['Low fluoride exposure', 'High cavity risk'],
    treatments: ['Topical fluoride gel', 'Fluoride varnish'],
    prevention: ['Fluoridated water', 'Fluoride toothpaste'],
    relatedConditions: ['dental-caries', 'enamel-erosion'],
    icon: '💧'
  },
  {
    id: 'dental-sealants',
    name: 'Dental Sealants',
    category: 'Preventive Care',
    description: 'Protective coating applied to chewing surfaces',
    symptoms: ['Deep grooves in molars', 'Cavity risk'],
    causes: ['Natural tooth anatomy', 'Difficulty cleaning'],
    treatments: ['Sealant application', 'Reapplication as needed'],
    prevention: ['Early application', 'Regular check-ups'],
    relatedConditions: ['dental-caries', 'pit-fissure-caries'],
    icon: '🛡️'
  },
  {
    id: 'oral-cancer-screening',
    name: 'Oral Cancer Screening',
    category: 'Preventive Care',
    description: 'Examination to detect early signs of oral cancer',
    symptoms: ['Mouth sores', 'White/red patches', 'Lumps'],
    causes: ['Tobacco use', 'HPV infection', 'Alcohol'],
    treatments: ['Biopsy', 'Referral to specialist'],
    prevention: ['Avoid tobacco', 'Limit alcohol', 'HPV vaccination'],
    relatedConditions: ['leukoplakia', 'oral-lesions'],
    icon: '🔍'
  },
  {
    id: 'dental-xray',
    name: 'Dental X-Ray',
    category: 'Preventive Care',
    description: 'Radiographic imaging to detect hidden problems',
    symptoms: ['Hidden cavities', 'Bone loss', 'Impacted teeth'],
    causes: ['Diagnostic necessity'],
    treatments: ['Bitewing X-rays', 'Panoramic X-rays', 'CBCT'],
    prevention: ['Regular diagnostic imaging'],
    relatedConditions: ['dental-caries', 'periodontitis'],
    icon: '📷'
  },
  {
    id: 'mouthguards',
    name: 'Mouthguards',
    category: 'Preventive Care',
    description: 'Protective device for teeth during sports or sleep',
    symptoms: ['Teeth grinding', 'Sports participation'],
    causes: ['Bruxism', 'Athletic activity'],
    treatments: ['Custom mouthguard', 'Night guard'],
    prevention: ['Wear during activity', 'Regular replacement'],
    relatedConditions: ['bruxism', 'tmj-disorder'],
    icon: '🏈'
  },
  {
    id: 'nutrition-counseling',
    name: 'Nutrition Counseling',
    category: 'Preventive Care',
    description: 'Dietary guidance for optimal oral health',
    symptoms: ['Frequent cavities', 'Enamel erosion'],
    causes: ['High sugar diet', 'Acidic foods'],
    treatments: ['Dietary modifications', 'Education'],
    prevention: ['Balanced diet', 'Limit sugar', 'Drink water'],
    relatedConditions: ['dental-caries', 'enamel-erosion'],
    icon: '🥗'
  },
  {
    id: 'oral-hygiene-instruction',
    name: 'Oral Hygiene Instruction',
    category: 'Preventive Care',
    description: 'Education on proper brushing and flossing',
    symptoms: ['Poor technique', 'Plaque buildup'],
    causes: ['Lack of knowledge', 'Improper tools'],
    treatments: ['Demonstration', 'Technique correction'],
    prevention: ['Brush twice daily', 'Floss daily', 'Use proper tools'],
    relatedConditions: ['gingivitis', 'dental-caries'],
    icon: '🪥'
  },
  {
    id: 'smoking-cessation',
    name: 'Smoking Cessation Counseling',
    category: 'Preventive Care',
    description: 'Support for quitting tobacco use',
    symptoms: ['Tobacco use', 'Stained teeth', 'Gum disease'],
    causes: ['Nicotine addiction'],
    treatments: ['Counseling', 'Nicotine replacement', 'Referral'],
    prevention: ['Never start smoking', 'Seek support'],
    relatedConditions: ['periodontitis', 'oral-cancer'],
    icon: '🚭'
  },
  {
    id: 'pediatric-dental-exam',
    name: 'Pediatric Dental Exam',
    category: 'Preventive Care',
    description: 'Routine examination for children',
    symptoms: ['First tooth eruption', 'Routine check'],
    causes: ['Age-appropriate care'],
    treatments: ['Examination', 'Cleaning', 'Education'],
    prevention: ['Start early', 'Regular visits'],
    relatedConditions: ['early-childhood-caries', 'teething'],
    icon: '👶'
  },
  {
    id: 'bite-analysis',
    name: 'Bite Analysis',
    category: 'Preventive Care',
    description: 'Assessment of jaw alignment and bite',
    symptoms: ['Jaw pain', 'Uneven wear', 'Clicking'],
    causes: ['Malocclusion', 'TMJ issues'],
    treatments: ['Occlusal adjustment', 'Orthodontics'],
    prevention: ['Early detection', 'Regular monitoring'],
    relatedConditions: ['tmj-disorder', 'malocclusion'],
    icon: '🦴'
  },
  {
    id: 'saliva-testing',
    name: 'Saliva Testing',
    category: 'Preventive Care',
    description: 'Analysis of saliva for cavity risk',
    symptoms: ['Dry mouth', 'High cavity rate'],
    causes: ['Medications', 'Medical conditions'],
    treatments: ['Risk assessment', 'Preventive plan'],
    prevention: ['Stay hydrated', 'Manage medications'],
    relatedConditions: ['xerostomia', 'dental-caries'],
    icon: '💧'
  },

  // Restorative Procedures (15 conditions)
  {
    id: 'dental-caries',
    name: 'Dental Caries (Cavities)',
    category: 'Restorative Procedures',
    description: 'Tooth decay caused by bacterial acid',
    symptoms: ['Tooth pain', 'Sensitivity', 'Visible holes'],
    causes: ['Poor hygiene', 'Sugar', 'Bacteria'],
    treatments: ['Fillings', 'Crowns', 'Root canal'],
    prevention: ['Brush', 'Floss', 'Limit sugar', 'Fluoride'],
    relatedConditions: ['pulpitis', 'tooth-abscess'],
    icon: '🦷'
  },
  {
    id: 'composite-filling',
    name: 'Composite Filling',
    category: 'Restorative Procedures',
    description: 'Tooth-colored filling material',
    symptoms: ['Cavity', 'Broken filling', 'Decay'],
    causes: ['Dental caries', 'Trauma'],
    treatments: ['Composite resin restoration'],
    prevention: ['Good oral hygiene', 'Regular check-ups'],
    relatedConditions: ['dental-caries', 'tooth-fracture'],
    icon: '🔧'
  },
  {
    id: 'dental-crown',
    name: 'Dental Crown',
    category: 'Restorative Procedures',
    description: 'Cap covering damaged tooth',
    symptoms: ['Large cavity', 'Cracked tooth', 'Root canal'],
    causes: ['Extensive decay', 'Fracture', 'Wear'],
    treatments: ['Porcelain crown', 'Metal crown', 'Zirconia crown'],
    prevention: ['Avoid hard foods', 'Wear mouthguard'],
    relatedConditions: ['dental-caries', 'tooth-fracture'],
    icon: '👑'
  },
  {
    id: 'dental-bridge',
    name: 'Dental Bridge',
    category: 'Restorative Procedures',
    description: 'Fixed prosthetic replacing missing teeth',
    symptoms: ['Missing teeth', 'Gap in smile'],
    causes: ['Tooth loss', 'Extraction'],
    treatments: ['Traditional bridge', 'Cantilever bridge'],
    prevention: ['Maintain oral health', 'Avoid tooth loss'],
    relatedConditions: ['tooth-loss', 'dental-implant'],
    icon: '🌉'
  },
  {
    id: 'dental-implant',
    name: 'Dental Implant',
    category: 'Restorative Procedures',
    description: 'Artificial tooth root and crown',
    symptoms: ['Missing tooth', 'Bone loss'],
    causes: ['Tooth loss', 'Extraction', 'Trauma'],
    treatments: ['Implant placement', 'Crown attachment'],
    prevention: ['Maintain bone health', 'Good hygiene'],
    relatedConditions: ['tooth-loss', 'bone-graft'],
    icon: '🔩'
  },
  {
    id: 'dentures',
    name: 'Dentures',
    category: 'Restorative Procedures',
    description: 'Removable replacement for missing teeth',
    symptoms: ['Multiple missing teeth', 'Difficulty eating'],
    causes: ['Tooth loss', 'Severe decay'],
    treatments: ['Complete dentures', 'Partial dentures'],
    prevention: ['Maintain remaining teeth'],
    relatedConditions: ['tooth-loss', 'dental-implant'],
    icon: '🦷'
  },
  {
    id: 'inlay-onlay',
    name: 'Inlay/Onlay',
    category: 'Restorative Procedures',
    description: 'Indirect filling for moderate decay',
    symptoms: ['Moderate cavity', 'Damaged cusp'],
    causes: ['Dental caries', 'Fracture'],
    treatments: ['Porcelain inlay', 'Gold onlay'],
    prevention: ['Good oral hygiene'],
    relatedConditions: ['dental-caries', 'dental-crown'],
    icon: '🔲'
  },
  {
    id: 'veneer',
    name: 'Dental Veneer',
    category: 'Restorative Procedures',
    description: 'Thin shell covering front of tooth',
    symptoms: ['Discolored teeth', 'Chipped teeth', 'Gaps'],
    causes: ['Staining', 'Minor damage', 'Aesthetics'],
    treatments: ['Porcelain veneer', 'Composite veneer'],
    prevention: ['Avoid staining foods', 'No biting hard objects'],
    relatedConditions: ['tooth-discoloration', 'enamel-erosion'],
    icon: '✨'
  },
  {
    id: 'tooth-bonding',
    name: 'Tooth Bonding',
    category: 'Restorative Procedures',
    description: 'Composite resin to repair minor defects',
    symptoms: ['Chipped tooth', 'Small gap', 'Discoloration'],
    causes: ['Minor trauma', 'Wear', 'Staining'],
    treatments: ['Composite bonding'],
    prevention: ['Avoid trauma', 'Good hygiene'],
    relatedConditions: ['tooth-fracture', 'enamel-defects'],
    icon: '🔗'
  },
  {
    id: 'amalgam-filling',
    name: 'Amalgam Filling',
    category: 'Restorative Procedures',
    description: 'Silver-colored metal filling',
    symptoms: ['Cavity', 'Decay'],
    causes: ['Dental caries'],
    treatments: ['Amalgam restoration'],
    prevention: ['Good oral hygiene'],
    relatedConditions: ['dental-caries'],
    icon: '⚙️'
  },
  {
    id: 'post-and-core',
    name: 'Post and Core',
    category: 'Restorative Procedures',
    description: 'Foundation for crown after root canal',
    symptoms: ['Extensive tooth loss', 'Post root canal'],
    causes: ['Large cavity', 'Root canal treatment'],
    treatments: ['Post placement', 'Core buildup'],
    prevention: ['Timely treatment of decay'],
    relatedConditions: ['root-canal', 'dental-crown'],
    icon: '📍'
  },
  {
    id: 'temporary-filling',
    name: 'Temporary Filling',
    category: 'Restorative Procedures',
    description: 'Short-term filling material',
    symptoms: ['Cavity', 'Lost filling'],
    causes: ['Interim treatment'],
    treatments: ['Temporary restoration'],
    prevention: ['Follow-up for permanent filling'],
    relatedConditions: ['dental-caries', 'composite-filling'],
    icon: '⏱️'
  },
  {
    id: 'full-mouth-reconstruction',
    name: 'Full Mouth Reconstruction',
    category: 'Restorative Procedures',
    description: 'Comprehensive restoration of all teeth',
    symptoms: ['Multiple damaged teeth', 'Severe wear'],
    causes: ['Extensive decay', 'Trauma', 'Bruxism'],
    treatments: ['Multiple procedures', 'Crowns', 'Implants'],
    prevention: ['Maintain oral health'],
    relatedConditions: ['dental-caries', 'bruxism', 'tooth-loss'],
    icon: '🏗️'
  },
  {
    id: 'smile-makeover',
    name: 'Smile Makeover',
    category: 'Restorative Procedures',
    description: 'Cosmetic improvement of smile',
    symptoms: ['Aesthetic concerns', 'Multiple issues'],
    causes: ['Discoloration', 'Misalignment', 'Damage'],
    treatments: ['Veneers', 'Whitening', 'Orthodontics'],
    prevention: ['Maintain results with good care'],
    relatedConditions: ['veneer', 'teeth-whitening', 'orthodontics'],
    icon: '😁'
  },
  {
    id: 'tooth-colored-restoration',
    name: 'Tooth-Colored Restoration',
    category: 'Restorative Procedures',
    description: 'Aesthetic filling matching tooth color',
    symptoms: ['Cavity', 'Aesthetic concern'],
    causes: ['Dental caries', 'Old metal fillings'],
    treatments: ['Composite resin', 'Ceramic restoration'],
    prevention: ['Good oral hygiene'],
    relatedConditions: ['dental-caries', 'composite-filling'],
    icon: '🎨'
  },

  // Periodontal Conditions (12 conditions)
  {
    id: 'gingivitis',
    name: 'Gingivitis',
    category: 'Periodontal Conditions',
    description: 'Inflammation of gums',
    symptoms: ['Red gums', 'Bleeding', 'Swelling'],
    causes: ['Plaque buildup', 'Poor hygiene'],
    treatments: ['Professional cleaning', 'Improved hygiene'],
    prevention: ['Brush', 'Floss', 'Regular cleanings'],
    relatedConditions: ['periodontitis', 'dental-cleaning'],
    icon: '🔴'
  },
  {
    id: 'periodontitis',
    name: 'Periodontitis',
    category: 'Periodontal Conditions',
    description: 'Advanced gum disease with bone loss',
    symptoms: ['Gum recession', 'Loose teeth', 'Bad breath'],
    causes: ['Untreated gingivitis', 'Plaque', 'Tartar'],
    treatments: ['Scaling', 'Root planing', 'Surgery'],
    prevention: ['Treat gingivitis early', 'Good hygiene'],
    relatedConditions: ['gingivitis', 'tooth-loss'],
    icon: '🦴'
  },
  {
    id: 'gum-recession',
    name: 'Gum Recession',
    category: 'Periodontal Conditions',
    description: 'Gums pull away from teeth',
    symptoms: ['Exposed roots', 'Sensitivity', 'Long teeth'],
    causes: ['Aggressive brushing', 'Gum disease', 'Genetics'],
    treatments: ['Gum graft', 'Pinhole technique'],
    prevention: ['Gentle brushing', 'Treat gum disease'],
    relatedConditions: ['periodontitis', 'tooth-sensitivity'],
    icon: '📉'
  },
  {
    id: 'periodontal-abscess',
    name: 'Periodontal Abscess',
    category: 'Periodontal Conditions',
    description: 'Pus-filled pocket in gum',
    symptoms: ['Swelling', 'Pain', 'Pus', 'Fever'],
    causes: ['Gum disease', 'Infection'],
    treatments: ['Drainage', 'Antibiotics', 'Deep cleaning'],
    prevention: ['Treat gum disease', 'Good hygiene'],
    relatedConditions: ['periodontitis', 'tooth-abscess'],
    icon: '💢'
  },
  {
    id: 'scaling-root-planing',
    name: 'Scaling and Root Planing',
    category: 'Periodontal Conditions',
    description: 'Deep cleaning below gum line',
    symptoms: ['Gum disease', 'Deep pockets', 'Tartar'],
    causes: ['Periodontitis'],
    treatments: ['Deep scaling', 'Root smoothing'],
    prevention: ['Maintain results with good hygiene'],
    relatedConditions: ['periodontitis', 'gingivitis'],
    icon: '🧹'
  },
  {
    id: 'gum-graft',
    name: 'Gum Graft',
    category: 'Periodontal Conditions',
    description: 'Surgical procedure to cover exposed roots',
    symptoms: ['Severe recession', 'Root exposure'],
    causes: ['Gum disease', 'Trauma', 'Genetics'],
    treatments: ['Connective tissue graft', 'Free gingival graft'],
    prevention: ['Gentle brushing', 'Treat gum disease early'],
    relatedConditions: ['gum-recession', 'periodontitis'],
    icon: '🩹'
  },
  {
    id: 'periodontal-maintenance',
    name: 'Periodontal Maintenance',
    category: 'Periodontal Conditions',
    description: 'Ongoing care after gum disease treatment',
    symptoms: ['History of gum disease'],
    causes: ['Previous periodontitis'],
    treatments: ['Regular cleanings', 'Monitoring'],
    prevention: ['Maintain good hygiene', 'Regular visits'],
    relatedConditions: ['periodontitis', 'gingivitis'],
    icon: '🔄'
  },
  {
    id: 'bone-graft',
    name: 'Bone Graft',
    category: 'Periodontal Conditions',
    description: 'Procedure to rebuild lost jaw bone',
    symptoms: ['Bone loss', 'Tooth loss'],
    causes: ['Gum disease', 'Tooth extraction'],
    treatments: ['Autograft', 'Allograft', 'Synthetic graft'],
    prevention: ['Treat gum disease', 'Timely implants'],
    relatedConditions: ['periodontitis', 'dental-implant'],
    icon: '🦴'
  },
  {
    id: 'crown-lengthening',
    name: 'Crown Lengthening',
    category: 'Periodontal Conditions',
    description: 'Surgical exposure of more tooth structure',
    symptoms: ['Gummy smile', 'Short teeth'],
    causes: ['Excess gum tissue', 'Restorative need'],
    treatments: ['Gum tissue removal', 'Bone reshaping'],
    prevention: ['Not preventable'],
    relatedConditions: ['gummy-smile', 'dental-crown'],
    icon: '✂️'
  },
  {
    id: 'gummy-smile',
    name: 'Gummy Smile',
    category: 'Periodontal Conditions',
    description: 'Excessive gum tissue showing when smiling',
    symptoms: ['Excess gum display', 'Short-looking teeth'],
    causes: ['Genetics', 'Altered eruption'],
    treatments: ['Crown lengthening', 'Botox', 'Orthodontics'],
    prevention: ['Not preventable'],
    relatedConditions: ['crown-lengthening'],
    icon: '😬'
  },
  {
    id: 'periodontal-surgery',
    name: 'Periodontal Surgery',
    category: 'Periodontal Conditions',
    description: 'Surgical treatment for advanced gum disease',
    symptoms: ['Deep pockets', 'Bone loss'],
    causes: ['Severe periodontitis'],
    treatments: ['Flap surgery', 'Pocket reduction'],
    prevention: ['Treat gum disease early'],
    relatedConditions: ['periodontitis', 'bone-graft'],
    icon: '🔪'
  },
  {
    id: 'laser-gum-therapy',
    name: 'Laser Gum Therapy',
    category: 'Periodontal Conditions',
    description: 'Minimally invasive gum disease treatment',
    symptoms: ['Gum disease', 'Inflammation'],
    causes: ['Periodontitis'],
    treatments: ['Laser-assisted periodontal therapy'],
    prevention: ['Maintain good hygiene after treatment'],
    relatedConditions: ['periodontitis', 'gingivitis'],
    icon: '⚡'
  },

  // Endodontic Issues (10 conditions)
  {
    id: 'root-canal',
    name: 'Root Canal Treatment',
    category: 'Endodontic Issues',
    description: 'Removal of infected tooth pulp',
    symptoms: ['Severe pain', 'Abscess', 'Sensitivity'],
    causes: ['Deep cavity', 'Trauma', 'Infection'],
    treatments: ['Pulp removal', 'Canal cleaning', 'Filling'],
    prevention: ['Treat cavities early', 'Avoid trauma'],
    relatedConditions: ['pulpitis', 'tooth-abscess'],
    icon: '🦷'
  },
  {
    id: 'pulpitis',
    name: 'Pulpitis',
    category: 'Endodontic Issues',
    description: 'Inflammation of tooth pulp',
    symptoms: ['Tooth pain', 'Sensitivity to hot/cold'],
    causes: ['Deep cavity', 'Trauma', 'Repeated procedures'],
    treatments: ['Root canal', 'Pulpotomy'],
    prevention: ['Treat cavities early'],
    relatedConditions: ['dental-caries', 'root-canal'],
    icon: '🔥'
  },
  {
    id: 'tooth-abscess',
    name: 'Tooth Abscess',
    category: 'Endodontic Issues',
    description: 'Pus-filled infection at tooth root',
    symptoms: ['Severe pain', 'Swelling', 'Fever', 'Bad taste'],
    causes: ['Untreated cavity', 'Trauma', 'Gum disease'],
    treatments: ['Root canal', 'Drainage', 'Antibiotics'],
    prevention: ['Treat cavities promptly', 'Good hygiene'],
    relatedConditions: ['pulpitis', 'root-canal'],
    icon: '💥'
  },
  {
    id: 'apicoectomy',
    name: 'Apicoectomy',
    category: 'Endodontic Issues',
    description: 'Surgical removal of tooth root tip',
    symptoms: ['Failed root canal', 'Persistent infection'],
    causes: ['Root canal failure', 'Infection'],
    treatments: ['Root tip removal', 'Retrograde filling'],
    prevention: ['Proper root canal treatment'],
    relatedConditions: ['root-canal', 'tooth-abscess'],
    icon: '✂️'
  },
  {
    id: 'cracked-tooth',
    name: 'Cracked Tooth',
    category: 'Endodontic Issues',
    description: 'Fracture in tooth structure',
    symptoms: ['Pain when chewing', 'Sensitivity', 'Intermittent pain'],
    causes: ['Trauma', 'Grinding', 'Large fillings'],
    treatments: ['Crown', 'Root canal', 'Extraction'],
    prevention: ['Mouthguard', 'Avoid hard foods'],
    relatedConditions: ['tooth-fracture', 'bruxism'],
    icon: '💔'
  },
  {
    id: 'pulp-capping',
    name: 'Pulp Capping',
    category: 'Endodontic Issues',
    description: 'Procedure to protect exposed pulp',
    symptoms: ['Near pulp exposure', 'Deep cavity'],
    causes: ['Deep decay', 'Trauma'],
    treatments: ['Direct pulp cap', 'Indirect pulp cap'],
    prevention: ['Treat cavities early'],
    relatedConditions: ['pulpitis', 'dental-caries'],
    icon: '🧢'
  },
  {
    id: 'pulpotomy',
    name: 'Pulpotomy',
    category: 'Endodontic Issues',
    description: 'Partial pulp removal in primary teeth',
    symptoms: ['Infected pulp', 'Pain in baby tooth'],
    causes: ['Deep cavity in primary tooth'],
    treatments: ['Partial pulp removal', 'Medicament'],
    prevention: ['Good oral hygiene in children'],
    relatedConditions: ['pulpitis', 'pediatric-dentistry'],
    icon: '👶'
  },
  {
    id: 'root-canal-retreatment',
    name: 'Root Canal Retreatment',
    category: 'Endodontic Issues',
    description: 'Second root canal on same tooth',
    symptoms: ['Failed root canal', 'Persistent pain'],
    causes: ['Incomplete cleaning', 'New infection'],
    treatments: ['Retreatment', 'Apicoectomy'],
    prevention: ['Proper initial treatment'],
    relatedConditions: ['root-canal', 'apicoectomy'],
    icon: '🔄'
  },
  {
    id: 'internal-resorption',
    name: 'Internal Resorption',
    category: 'Endodontic Issues',
    description: 'Tooth structure loss from inside',
    symptoms: ['Pink spot on tooth', 'Asymptomatic'],
    causes: ['Trauma', 'Infection', 'Unknown'],
    treatments: ['Root canal', 'Extraction if severe'],
    prevention: ['Prompt treatment of trauma'],
    relatedConditions: ['root-canal', 'tooth-trauma'],
    icon: '🔴'
  },
  {
    id: 'external-resorption',
    name: 'External Resorption',
    category: 'Endodontic Issues',
    description: 'Tooth structure loss from outside',
    symptoms: ['Root shortening', 'Mobility'],
    causes: ['Trauma', 'Orthodontics', 'Infection'],
    treatments: ['Root canal', 'Extraction if severe'],
    prevention: ['Careful orthodontic treatment'],
    relatedConditions: ['root-canal', 'tooth-trauma'],
    icon: '📉'
  },

  // Oral Surgery (12 conditions)
  {
    id: 'tooth-extraction',
    name: 'Tooth Extraction',
    category: 'Oral Surgery',
    description: 'Removal of tooth',
    symptoms: ['Severe decay', 'Infection', 'Crowding'],
    causes: ['Irreparable damage', 'Orthodontic need'],
    treatments: ['Simple extraction', 'Surgical extraction'],
    prevention: ['Maintain oral health'],
    relatedConditions: ['tooth-loss', 'dental-implant'],
    icon: '🦷'
  },
  {
    id: 'wisdom-teeth-removal',
    name: 'Wisdom Teeth Removal',
    category: 'Oral Surgery',
    description: 'Extraction of third molars',
    symptoms: ['Impaction', 'Pain', 'Infection', 'Crowding'],
    causes: ['Insufficient space', 'Improper eruption'],
    treatments: ['Surgical extraction'],
    prevention: ['Early evaluation'],
    relatedConditions: ['impacted-teeth', 'pericoronitis'],
    icon: '🦷'
  },
  {
    id: 'impacted-teeth',
    name: 'Impacted Teeth',
    category: 'Oral Surgery',
    description: 'Teeth unable to erupt properly',
    symptoms: ['Pain', 'Swelling', 'Infection'],
    causes: ['Insufficient space', 'Obstruction'],
    treatments: ['Surgical exposure', 'Extraction'],
    prevention: ['Early orthodontic evaluation'],
    relatedConditions: ['wisdom-teeth-removal', 'orthodontics'],
    icon: '🚫'
  },
  {
    id: 'jaw-surgery',
    name: 'Jaw Surgery (Orthognathic)',
    category: 'Oral Surgery',
    description: 'Surgical correction of jaw alignment',
    symptoms: ['Severe malocclusion', 'TMJ pain', 'Sleep apnea'],
    causes: ['Skeletal discrepancy', 'Genetics'],
    treatments: ['Maxillary surgery', 'Mandibular surgery'],
    prevention: ['Not preventable'],
    relatedConditions: ['malocclusion', 'tmj-disorder'],
    icon: '🦴'
  },
  {
    id: 'dental-trauma',
    name: 'Dental Trauma',
    category: 'Oral Surgery',
    description: 'Injury to teeth or supporting structures',
    symptoms: ['Broken tooth', 'Knocked-out tooth', 'Bleeding'],
    causes: ['Accident', 'Sports injury', 'Fall'],
    treatments: ['Splinting', 'Root canal', 'Extraction'],
    prevention: ['Mouthguard', 'Safety precautions'],
    relatedConditions: ['tooth-fracture', 'tooth-avulsion'],
    icon: '💥'
  },
  {
    id: 'tooth-avulsion',
    name: 'Tooth Avulsion',
    category: 'Oral Surgery',
    description: 'Complete tooth knocked out',
    symptoms: ['Missing tooth', 'Socket bleeding'],
    causes: ['Trauma', 'Accident'],
    treatments: ['Reimplantation', 'Splinting'],
    prevention: ['Mouthguard', 'Safety measures'],
    relatedConditions: ['dental-trauma', 'tooth-loss'],
    icon: '🚨'
  },
  {
    id: 'biopsy',
    name: 'Oral Biopsy',
    category: 'Oral Surgery',
    description: 'Tissue sample for diagnosis',
    symptoms: ['Suspicious lesion', 'Non-healing sore'],
    causes: ['Diagnostic need'],
    treatments: ['Incisional biopsy', 'Excisional biopsy'],
    prevention: ['Regular oral cancer screening'],
    relatedConditions: ['oral-cancer-screening', 'oral-lesions'],
    icon: '🔬'
  },
  {
    id: 'frenectomy',
    name: 'Frenectomy',
    category: 'Oral Surgery',
    description: 'Removal of frenum tissue',
    symptoms: ['Tongue-tie', 'Lip-tie', 'Gum recession'],
    causes: ['Restrictive frenum'],
    treatments: ['Surgical removal', 'Laser frenectomy'],
    prevention: ['Not preventable'],
    relatedConditions: ['gum-recession', 'speech-issues'],
    icon: '✂️'
  },
  {
    id: 'sinus-lift',
    name: 'Sinus Lift',
    category: 'Oral Surgery',
    description: 'Bone augmentation for upper implants',
    symptoms: ['Insufficient bone', 'Tooth loss in upper jaw'],
    causes: ['Bone loss', 'Large sinus'],
    treatments: ['Sinus augmentation', 'Bone graft'],
    prevention: ['Timely implant placement'],
    relatedConditions: ['dental-implant', 'bone-graft'],
    icon: '⬆️'
  },
  {
    id: 'tmj-surgery',
    name: 'TMJ Surgery',
    category: 'Oral Surgery',
    description: 'Surgical treatment for jaw joint',
    symptoms: ['Severe TMJ pain', 'Limited opening', 'Locking'],
    causes: ['TMJ disorder', 'Arthritis', 'Trauma'],
    treatments: ['Arthroscopy', 'Joint replacement'],
    prevention: ['Conservative treatment first'],
    relatedConditions: ['tmj-disorder', 'jaw-surgery'],
    icon: '🔧'
  },
  {
    id: 'sleep-apnea-surgery',
    name: 'Sleep Apnea Surgery',
    category: 'Oral Surgery',
    description: 'Surgical treatment for obstructive sleep apnea',
    symptoms: ['Snoring', 'Breathing pauses', 'Fatigue'],
    causes: ['Airway obstruction', 'Jaw position'],
    treatments: ['UPPP', 'Jaw advancement'],
    prevention: ['Weight management', 'CPAP first'],
    relatedConditions: ['jaw-surgery', 'sleep-apnea'],
    icon: '😴'
  },
  {
    id: 'cleft-palate-repair',
    name: 'Cleft Palate Repair',
    category: 'Oral Surgery',
    description: 'Surgical correction of cleft lip/palate',
    symptoms: ['Birth defect', 'Feeding difficulty', 'Speech issues'],
    causes: ['Congenital'],
    treatments: ['Staged surgical repair'],
    prevention: ['Not preventable'],
    relatedConditions: ['pediatric-dentistry'],
    icon: '👶'
  },

  // Orthodontics (10 conditions)
  {
    id: 'malocclusion',
    name: 'Malocclusion',
    category: 'Orthodontics',
    description: 'Misalignment of teeth or jaws',
    symptoms: ['Crooked teeth', 'Bite problems', 'Jaw pain'],
    causes: ['Genetics', 'Habits', 'Tooth loss'],
    treatments: ['Braces', 'Aligners', 'Surgery'],
    prevention: ['Early intervention', 'Avoid thumb sucking'],
    relatedConditions: ['braces', 'clear-aligners'],
    icon: '🦷'
  },
  {
    id: 'braces',
    name: 'Traditional Braces',
    category: 'Orthodontics',
    description: 'Fixed orthodontic appliances',
    symptoms: ['Crooked teeth', 'Bite issues'],
    causes: ['Malocclusion'],
    treatments: ['Metal braces', 'Ceramic braces'],
    prevention: ['Not applicable'],
    relatedConditions: ['malocclusion', 'retainer'],
    icon: '🦷'
  },
  {
    id: 'clear-aligners',
    name: 'Clear Aligners',
    category: 'Orthodontics',
    description: 'Removable transparent orthodontic trays',
    symptoms: ['Mild to moderate misalignment'],
    causes: ['Malocclusion'],
    treatments: ['Invisalign', 'ClearCorrect'],
    prevention: ['Not applicable'],
    relatedConditions: ['malocclusion', 'retainer'],
    icon: '✨'
  },
  {
    id: 'retainer',
    name: 'Orthodontic Retainer',
    category: 'Orthodontics',
    description: 'Device to maintain tooth position',
    symptoms: ['Post-orthodontic treatment'],
    causes: ['Completed braces/aligners'],
    treatments: ['Fixed retainer', 'Removable retainer'],
    prevention: ['Wear as directed'],
    relatedConditions: ['braces', 'clear-aligners'],
    icon: '🔒'
  },
  {
    id: 'palatal-expander',
    name: 'Palatal Expander',
    category: 'Orthodontics',
    description: 'Device to widen upper jaw',
    symptoms: ['Narrow palate', 'Crossbite'],
    causes: ['Skeletal discrepancy'],
    treatments: ['Rapid palatal expansion'],
    prevention: ['Early treatment'],
    relatedConditions: ['malocclusion', 'braces'],
    icon: '↔️'
  },
  {
    id: 'space-maintainer',
    name: 'Space Maintainer',
    category: 'Orthodontics',
    description: 'Device to hold space for permanent tooth',
    symptoms: ['Early loss of baby tooth'],
    causes: ['Premature tooth loss'],
    treatments: ['Fixed space maintainer'],
    prevention: ['Maintain primary teeth'],
    relatedConditions: ['pediatric-dentistry', 'tooth-loss'],
    icon: '📏'
  },
  {
    id: 'headgear',
    name: 'Orthodontic Headgear',
    category: 'Orthodontics',
    description: 'External appliance for jaw growth modification',
    symptoms: ['Severe overbite', 'Jaw discrepancy'],
    causes: ['Skeletal malocclusion'],
    treatments: ['Cervical pull headgear', 'Reverse pull headgear'],
    prevention: ['Early intervention'],
    relatedConditions: ['malocclusion', 'braces'],
    icon: '👤'
  },
  {
    id: 'lingual-braces',
    name: 'Lingual Braces',
    category: 'Orthodontics',
    description: 'Braces placed on back of teeth',
    symptoms: ['Malocclusion', 'Aesthetic concern'],
    causes: ['Misalignment'],
    treatments: ['Custom lingual brackets'],
    prevention: ['Not applicable'],
    relatedConditions: ['braces', 'malocclusion'],
    icon: '🔙'
  },
  {
    id: 'diastema-closure',
    name: 'Diastema Closure',
    category: 'Orthodontics',
    description: 'Closing gap between teeth',
    symptoms: ['Gap between front teeth'],
    causes: ['Genetics', 'Missing teeth', 'Habits'],
    treatments: ['Braces', 'Aligners', 'Bonding'],
    prevention: ['Avoid thumb sucking'],
    relatedConditions: ['malocclusion', 'braces'],
    icon: '↔️'
  },
  {
    id: 'overbite-correction',
    name: 'Overbite Correction',
    category: 'Orthodontics',
    description: 'Treatment for excessive vertical overlap',
    symptoms: ['Upper teeth cover lower teeth excessively'],
    causes: ['Genetics', 'Habits'],
    treatments: ['Braces', 'Aligners', 'Surgery'],
    prevention: ['Early intervention'],
    relatedConditions: ['malocclusion', 'braces'],
    icon: '⬇️'
  },

  // Pediatric Dentistry (10 conditions)
  {
    id: 'early-childhood-caries',
    name: 'Early Childhood Caries',
    category: 'Pediatric Dentistry',
    description: 'Severe tooth decay in young children',
    symptoms: ['Cavities in baby teeth', 'Pain', 'Discoloration'],
    causes: ['Bottle feeding', 'Sugar', 'Poor hygiene'],
    treatments: ['Fillings', 'Crowns', 'Extraction'],
    prevention: ['No bottle at bedtime', 'Limit sugar', 'Brush'],
    relatedConditions: ['dental-caries', 'pediatric-dental-exam'],
    icon: '👶'
  },
  {
    id: 'teething',
    name: 'Teething',
    category: 'Pediatric Dentistry',
    description: 'Eruption of primary teeth',
    symptoms: ['Irritability', 'Drooling', 'Gum swelling'],
    causes: ['Normal development'],
    treatments: ['Teething rings', 'Pain relief'],
    prevention: ['Not preventable'],
    relatedConditions: ['pediatric-dental-exam'],
    icon: '🍼'
  },
  {
    id: 'thumb-sucking',
    name: 'Thumb Sucking Habit',
    category: 'Pediatric Dentistry',
    description: 'Prolonged thumb or finger sucking',
    symptoms: ['Habit beyond age 4', 'Malocclusion'],
    causes: ['Comfort seeking', 'Habit'],
    treatments: ['Behavior modification', 'Appliance'],
    prevention: ['Early intervention', 'Positive reinforcement'],
    relatedConditions: ['malocclusion', 'open-bite'],
    icon: '👍'
  },
  {
    id: 'baby-bottle-tooth-decay',
    name: 'Baby Bottle Tooth Decay',
    category: 'Pediatric Dentistry',
    description: 'Decay from prolonged bottle use',
    symptoms: ['Cavities in front teeth', 'Discoloration'],
    causes: ['Bottle at bedtime', 'Sugary liquids'],
    treatments: ['Fillings', 'Crowns'],
    prevention: ['No bottle at bedtime', 'Water only'],
    relatedConditions: ['early-childhood-caries'],
    icon: '🍼'
  },
  {
    id: 'stainless-steel-crown',
    name: 'Stainless Steel Crown (Pediatric)',
    category: 'Pediatric Dentistry',
    description: 'Pre-formed crown for baby teeth',
    symptoms: ['Large cavity', 'Fractured baby tooth'],
    causes: ['Extensive decay', 'Trauma'],
    treatments: ['Stainless steel crown placement'],
    prevention: ['Good oral hygiene'],
    relatedConditions: ['early-childhood-caries', 'dental-caries'],
    icon: '👑'
  },
  {
    id: 'natal-teeth',
    name: 'Natal Teeth',
    category: 'Pediatric Dentistry',
    description: 'Teeth present at birth',
    symptoms: ['Teeth at birth', 'Feeding difficulty'],
    causes: ['Premature eruption'],
    treatments: ['Monitoring', 'Extraction if needed'],
    prevention: ['Not preventable'],
    relatedConditions: ['teething'],
    icon: '👶'
  },
  {
    id: 'tongue-thrust',
    name: 'Tongue Thrust',
    category: 'Pediatric Dentistry',
    description: 'Abnormal swallowing pattern',
    symptoms: ['Tongue pushes against teeth', 'Open bite'],
    causes: ['Habit', 'Airway issues'],
    treatments: ['Myofunctional therapy', 'Orthodontics'],
    prevention: ['Early intervention'],
    relatedConditions: ['malocclusion', 'open-bite'],
    icon: '👅'
  },
  {
    id: 'enamel-hypoplasia',
    name: 'Enamel Hypoplasia',
    category: 'Pediatric Dentistry',
    description: 'Defective enamel formation',
    symptoms: ['Thin enamel', 'Discoloration', 'Sensitivity'],
    causes: ['Malnutrition', 'Illness', 'Genetics'],
    treatments: ['Fluoride', 'Sealants', 'Crowns'],
    prevention: ['Prenatal care', 'Nutrition'],
    relatedConditions: ['tooth-sensitivity', 'dental-caries'],
    icon: '🦷'
  },
  {
    id: 'supernumerary-teeth',
    name: 'Supernumerary Teeth',
    category: 'Pediatric Dentistry',
    description: 'Extra teeth beyond normal number',
    symptoms: ['Extra teeth', 'Crowding', 'Delayed eruption'],
    causes: ['Genetics'],
    treatments: ['Extraction', 'Monitoring'],
    prevention: ['Not preventable'],
    relatedConditions: ['impacted-teeth', 'malocclusion'],
    icon: '➕'
  },
  {
    id: 'ankylosed-tooth',
    name: 'Ankylosed Tooth',
    category: 'Pediatric Dentistry',
    description: 'Tooth fused to bone',
    symptoms: ['Tooth not erupting', 'Submerged tooth'],
    causes: ['Trauma', 'Genetics'],
    treatments: ['Extraction', 'Monitoring'],
    prevention: ['Not preventable'],
    relatedConditions: ['impacted-teeth'],
    icon: '🔗'
  },

  // Emergency Care (15 conditions)
  {
    id: 'toothache',
    name: 'Toothache',
    category: 'Emergency Care',
    description: 'Pain in or around tooth',
    symptoms: ['Tooth pain', 'Sensitivity', 'Swelling'],
    causes: ['Cavity', 'Infection', 'Trauma', 'Gum disease'],
    treatments: ['Pain relief', 'Treat underlying cause'],
    prevention: ['Good oral hygiene', 'Regular check-ups'],
    relatedConditions: ['dental-caries', 'pulpitis', 'tooth-abscess'],
    icon: '😖'
  },
  {
    id: 'dental-emergency',
    name: 'Dental Emergency',
    category: 'Emergency Care',
    description: 'Urgent dental situation requiring immediate care',
    symptoms: ['Severe pain', 'Trauma', 'Bleeding', 'Swelling'],
    causes: ['Accident', 'Infection', 'Severe decay'],
    treatments: ['Emergency treatment', 'Pain management'],
    prevention: ['Safety measures', 'Regular dental care'],
    relatedConditions: ['toothache', 'dental-trauma', 'tooth-abscess'],
    icon: '🚨'
  },
  {
    id: 'broken-tooth',
    name: 'Broken Tooth',
    category: 'Emergency Care',
    description: 'Fractured or chipped tooth',
    symptoms: ['Visible break', 'Pain', 'Sharp edges'],
    causes: ['Trauma', 'Biting hard object', 'Decay'],
    treatments: ['Bonding', 'Crown', 'Root canal', 'Extraction'],
    prevention: ['Mouthguard', 'Avoid hard foods'],
    relatedConditions: ['dental-trauma', 'tooth-fracture'],
    icon: '💔'
  },
  {
    id: 'knocked-out-tooth',
    name: 'Knocked Out Tooth',
    category: 'Emergency Care',
    description: 'Completely avulsed tooth',
    symptoms: ['Missing tooth', 'Bleeding socket'],
    causes: ['Trauma', 'Accident'],
    treatments: ['Reimplantation within 1 hour', 'Splinting'],
    prevention: ['Mouthguard', 'Safety measures'],
    relatedConditions: ['tooth-avulsion', 'dental-trauma'],
    icon: '🦷'
  },
  {
    id: 'lost-filling',
    name: 'Lost Filling or Crown',
    category: 'Emergency Care',
    description: 'Restoration has fallen out',
    symptoms: ['Missing filling', 'Sensitivity', 'Hole in tooth'],
    causes: ['Decay', 'Wear', 'Trauma'],
    treatments: ['Replace filling', 'New crown'],
    prevention: ['Regular check-ups', 'Good hygiene'],
    relatedConditions: ['dental-caries', 'dental-crown'],
    icon: '🔧'
  },
  {
    id: 'soft-tissue-injury',
    name: 'Soft Tissue Injury',
    category: 'Emergency Care',
    description: 'Injury to lips, cheeks, tongue, or gums',
    symptoms: ['Bleeding', 'Laceration', 'Pain'],
    causes: ['Trauma', 'Accident', 'Biting'],
    treatments: ['Pressure', 'Sutures', 'Antibiotics'],
    prevention: ['Safety measures', 'Careful eating'],
    relatedConditions: ['dental-trauma'],
    icon: '🩸'
  },
  {
    id: 'jaw-injury',
    name: 'Jaw Injury',
    category: 'Emergency Care',
    description: 'Trauma to jaw bone',
    symptoms: ['Jaw pain', 'Swelling', 'Difficulty opening', 'Misalignment'],
    causes: ['Trauma', 'Accident'],
    treatments: ['Imaging', 'Stabilization', 'Surgery'],
    prevention: ['Safety measures', 'Mouthguard'],
    relatedConditions: ['dental-trauma', 'tmj-disorder'],
    icon: '💥'
  },
  {
    id: 'pericoronitis',
    name: 'Pericoronitis',
    category: 'Emergency Care',
    description: 'Infection around partially erupted tooth',
    symptoms: ['Pain', 'Swelling', 'Bad taste', 'Difficulty opening'],
    causes: ['Partially erupted wisdom tooth', 'Food trap'],
    treatments: ['Cleaning', 'Antibiotics', 'Extraction'],
    prevention: ['Good hygiene', 'Early wisdom tooth removal'],
    relatedConditions: ['wisdom-teeth-removal', 'impacted-teeth'],
    icon: '🦷'
  },
  {
    id: 'dry-socket',
    name: 'Dry Socket',
    category: 'Emergency Care',
    description: 'Painful complication after extraction',
    symptoms: ['Severe pain 3-4 days post-extraction', 'Bad breath'],
    causes: ['Blood clot loss', 'Smoking', 'Poor healing'],
    treatments: ['Medicated dressing', 'Pain management'],
    prevention: ['Follow post-op instructions', 'No smoking'],
    relatedConditions: ['tooth-extraction'],
    icon: '🕳️'
  },
  {
    id: 'cellulitis',
    name: 'Facial Cellulitis',
    category: 'Emergency Care',
    description: 'Serious bacterial infection of face',
    symptoms: ['Facial swelling', 'Fever', 'Redness', 'Pain'],
    causes: ['Dental infection', 'Abscess'],
    treatments: ['IV antibiotics', 'Hospitalization', 'Drainage'],
    prevention: ['Treat dental infections promptly'],
    relatedConditions: ['tooth-abscess', 'dental-emergency'],
    icon: '🔴'
  },
  {
    id: 'ludwig-angina',
    name: 'Ludwig\'s Angina',
    category: 'Emergency Care',
    description: 'Life-threatening infection of mouth floor',
    symptoms: ['Severe swelling', 'Difficulty breathing', 'Fever'],
    causes: ['Dental infection', 'Abscess'],
    treatments: ['Emergency hospitalization', 'IV antibiotics', 'Airway management'],
    prevention: ['Treat dental infections immediately'],
    relatedConditions: ['tooth-abscess', 'cellulitis'],
    icon: '🚨'
  },
  {
    id: 'bleeding-after-extraction',
    name: 'Post-Extraction Bleeding',
    category: 'Emergency Care',
    description: 'Excessive bleeding after tooth removal',
    symptoms: ['Continuous bleeding', 'Blood clots'],
    causes: ['Failed clot formation', 'Medications', 'Trauma'],
    treatments: ['Pressure', 'Gauze', 'Sutures'],
    prevention: ['Follow post-op instructions'],
    relatedConditions: ['tooth-extraction', 'dry-socket'],
    icon: '🩸'
  },
  {
    id: 'orthodontic-emergency',
    name: 'Orthodontic Emergency',
    category: 'Emergency Care',
    description: 'Broken braces or wire causing injury',
    symptoms: ['Broken bracket', 'Poking wire', 'Pain'],
    causes: ['Trauma', 'Hard foods'],
    treatments: ['Wire cutting', 'Wax', 'Repair'],
    prevention: ['Avoid hard foods', 'Wear mouthguard'],
    relatedConditions: ['braces', 'soft-tissue-injury'],
    icon: '🦷'
  },
  {
    id: 'swelling',
    name: 'Facial Swelling',
    category: 'Emergency Care',
    description: 'Abnormal swelling of face or jaw',
    symptoms: ['Swelling', 'Pain', 'Fever'],
    causes: ['Infection', 'Abscess', 'Trauma'],
    treatments: ['Antibiotics', 'Drainage', 'Treat cause'],
    prevention: ['Treat infections promptly'],
    relatedConditions: ['tooth-abscess', 'cellulitis'],
    icon: '😷'
  },
  {
    id: 'uncontrolled-bleeding',
    name: 'Uncontrolled Oral Bleeding',
    category: 'Emergency Care',
    description: 'Severe bleeding that won\'t stop',
    symptoms: ['Continuous bleeding', 'Blood loss'],
    causes: ['Trauma', 'Surgery', 'Blood disorder'],
    treatments: ['Pressure', 'Emergency care', 'Sutures'],
    prevention: ['Disclose medical conditions', 'Safety measures'],
    relatedConditions: ['dental-trauma', 'soft-tissue-injury'],
    icon: '🩸'
  },
  {
    id: 'object-stuck-in-teeth',
    name: 'Object Stuck Between Teeth',
    category: 'Emergency Care',
    description: 'Foreign object lodged between teeth',
    symptoms: ['Pain', 'Pressure', 'Visible object'],
    causes: ['Food', 'Foreign material'],
    treatments: ['Gentle flossing', 'Professional removal'],
    prevention: ['Careful eating', 'Regular flossing'],
    relatedConditions: ['toothache'],
    icon: '🦷'
  },
];

/**
 * Get all unique categories
 */
export const categories = Array.from(
  new Set(dentalConditions.map(c => c.category))
);

/**
 * Get conditions by category
 */
export function getConditionsByCategory(category: string): DentalCondition[] {
  return dentalConditions.filter(c => c.category === category);
}

/**
 * Get condition by ID
 */
export function getConditionById(id: string): DentalCondition | undefined {
  return dentalConditions.find(c => c.id === id);
}

/**
 * Search conditions by name or description
 */
export function searchConditions(query: string): DentalCondition[] {
  const lowerQuery = query.toLowerCase();
  return dentalConditions.filter(
    c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.symptoms.some(s => s.toLowerCase().includes(lowerQuery))
  );
}
