import type { SymptomData, SymptomResult, UrgencyLevel } from '@/types';

interface Rule {
  condition: (data: SymptomData) => boolean;
  result: {
    condition: string;
    likelihood: number;
    urgency: UrgencyLevel;
    actionGuidance: string;
    homeCareRecommendations: string[];
    redFlags: string[];
  };
}

// Rule-based engine for simple, offline-capable diagnosis
const SYMPTOM_RULES: Rule[] = [
  // Emergency Rules
  {
    condition: (data) =>
      data.associatedSymptoms.some((s) =>
        ['Difficulty swallowing', 'Fever'].includes(s)
      ) && data.associatedSymptoms.includes('Swelling'),
    result: {
      condition: 'Severe Dental Infection (Possible Abscess)',
      likelihood: 0.85,
      urgency: 'emergency',
      actionGuidance:
        'Seek immediate emergency care. This could be a serious infection that may spread.',
      homeCareRecommendations: [
        'Do not delay seeking emergency care',
        'Stay hydrated',
        'Do not apply heat to the swollen area',
      ],
      redFlags: [
        'Difficulty breathing or swallowing',
        'High fever (>101°F)',
        'Rapid swelling',
        'Severe pain not controlled by medication',
      ],
    },
  },
  {
    condition: (data) =>
      data.painType === 'Sharp' &&
      data.associatedSymptoms.includes('Bleeding gums') &&
      data.triggers.includes('Chewing'),
    result: {
      condition: 'Possible Tooth Fracture or Trauma',
      likelihood: 0.75,
      urgency: 'urgent',
      actionGuidance:
        'Contact your dentist within 24 hours. A fractured tooth needs prompt attention to prevent further damage.',
      homeCareRecommendations: [
        'Avoid chewing on the affected side',
        'Rinse with warm salt water',
        'Take over-the-counter pain medication as directed',
        'Apply cold compress to reduce swelling',
      ],
      redFlags: [
        'Severe bleeding that won\'t stop',
        'Tooth is loose or displaced',
        'Visible crack or broken piece',
      ],
    },
  },

  // Urgent Rules
  {
    condition: (data) =>
      data.painType === 'Throbbing' &&
      data.triggers.some((t) => ['Hot foods/drinks', 'Cold foods/drinks'].includes(t)) &&
      data.duration.includes('days'),
    result: {
      condition: 'Possible Pulpitis (Inflamed Tooth Nerve)',
      likelihood: 0.8,
      urgency: 'urgent',
      actionGuidance:
        'Schedule a dentist appointment within 24-48 hours. This may require root canal treatment.',
      homeCareRecommendations: [
        'Avoid extreme temperatures',
        'Take over-the-counter pain medication',
        'Avoid chewing on the affected tooth',
        'Rinse with warm salt water',
      ],
      redFlags: [
        'Pain keeps you awake at night',
        'Swelling develops',
        'Pain spreads to jaw or ear',
      ],
    },
  },
  {
    condition: (data) =>
      data.associatedSymptoms.includes('Swelling') &&
      data.painType === 'Constant' &&
      !data.associatedSymptoms.includes('Fever'),
    result: {
      condition: 'Dental Abscess or Localized Infection',
      likelihood: 0.75,
      urgency: 'urgent',
      actionGuidance:
        'Contact your dentist within 24 hours. An abscess requires professional treatment.',
      homeCareRecommendations: [
        'Rinse with warm salt water several times daily',
        'Take over-the-counter pain medication',
        'Apply cold compress to reduce swelling',
        'Stay hydrated',
      ],
      redFlags: [
        'Fever develops',
        'Swelling increases rapidly',
        'Difficulty swallowing',
        'Swelling spreads to face or neck',
      ],
    },
  },

  // Routine Rules
  {
    condition: (data) =>
      data.triggers.includes('Sweet foods') &&
      data.painType === 'Sharp' &&
      data.duration.includes('Less than 24 hours'),
    result: {
      condition: 'Possible Dental Cavity',
      likelihood: 0.7,
      urgency: 'routine',
      actionGuidance:
        'Schedule a routine dental appointment within 1-2 weeks for examination and possible filling.',
      homeCareRecommendations: [
        'Avoid sugary foods and drinks',
        'Maintain good oral hygiene',
        'Use fluoride toothpaste',
        'Consider using desensitizing toothpaste',
      ],
      redFlags: [
        'Pain becomes constant',
        'Swelling develops',
        'Visible hole or dark spot on tooth',
      ],
    },
  },
  {
    condition: (data) =>
      data.triggers.some((t) => ['Hot foods/drinks', 'Cold foods/drinks'].includes(t)) &&
      data.painType === 'Sharp' &&
      !data.associatedSymptoms.includes('Swelling'),
    result: {
      condition: 'Tooth Sensitivity',
      likelihood: 0.65,
      urgency: 'routine',
      actionGuidance:
        'Schedule a routine dental checkup. Sensitivity can often be managed with proper care.',
      homeCareRecommendations: [
        'Use desensitizing toothpaste',
        'Avoid acidic foods and drinks',
        'Use a soft-bristled toothbrush',
        'Don\'t brush too hard',
        'Consider fluoride mouthwash',
      ],
      redFlags: [
        'Sensitivity worsens over time',
        'Pain becomes constant',
        'Visible damage to tooth enamel',
      ],
    },
  },
  {
    condition: (data) =>
      data.associatedSymptoms.includes('Bleeding gums') &&
      !data.associatedSymptoms.includes('Swelling') &&
      data.painType === 'Dull',
    result: {
      condition: 'Gingivitis (Gum Inflammation)',
      likelihood: 0.7,
      urgency: 'routine',
      actionGuidance:
        'Schedule a dental cleaning and checkup within 2-4 weeks. Early gum disease is reversible with proper care.',
      homeCareRecommendations: [
        'Brush twice daily for 2 minutes',
        'Floss daily',
        'Use antiseptic mouthwash',
        'Rinse with warm salt water',
        'Avoid tobacco products',
      ],
      redFlags: [
        'Gums recede or pull away from teeth',
        'Persistent bad breath',
        'Teeth become loose',
        'Pus between teeth and gums',
      ],
    },
  },

  // Home Care Rules
  {
    condition: (data) =>
      data.painType === 'Dull' &&
      data.duration.includes('Less than 24 hours') &&
      data.associatedSymptoms.length === 0,
    result: {
      condition: 'Minor Tooth Discomfort',
      likelihood: 0.6,
      urgency: 'home-care',
      actionGuidance:
        'Monitor symptoms for 24-48 hours. If pain persists or worsens, contact your dentist.',
      homeCareRecommendations: [
        'Rinse with warm salt water',
        'Take over-the-counter pain medication if needed',
        'Avoid chewing on the affected side',
        'Maintain good oral hygiene',
        'Avoid extreme temperatures',
      ],
      redFlags: [
        'Pain increases in intensity',
        'Swelling develops',
        'Pain lasts more than 2 days',
        'Fever develops',
      ],
    },
  },
  {
    condition: (data) =>
      data.associatedSymptoms.includes('Bad breath') &&
      !data.associatedSymptoms.includes('Bleeding gums') &&
      data.painType === 'Dull',
    result: {
      condition: 'Poor Oral Hygiene',
      likelihood: 0.65,
      urgency: 'home-care',
      actionGuidance:
        'Improve oral hygiene routine. Schedule a routine dental cleaning if symptoms persist.',
      homeCareRecommendations: [
        'Brush teeth twice daily for 2 minutes',
        'Floss daily',
        'Brush or scrape your tongue',
        'Use antibacterial mouthwash',
        'Stay hydrated',
        'Avoid tobacco and alcohol',
      ],
      redFlags: [
        'Bad breath persists despite good hygiene',
        'Bleeding gums develop',
        'White patches in mouth',
        'Persistent dry mouth',
      ],
    },
  },
];

export function analyzeSymptoms(data: SymptomData): SymptomResult | null {
  // Check if symptoms are simple enough for rule-based diagnosis
  const matchedRules = SYMPTOM_RULES.filter((rule) => rule.condition(data))
    .sort((a, b) => b.result.likelihood - a.result.likelihood);

  if (matchedRules.length === 0) {
    // Symptoms are too complex for rule-based engine
    return null;
  }

  // Get top 3 matches
  const topMatches = matchedRules.slice(0, 3);

  // Primary condition is the highest likelihood
  const primaryResult = topMatches[0].result;

  // Build differential diagnosis from other matches
  const possibleConditions = topMatches.map((rule) => ({
    condition: rule.result.condition,
    likelihood: rule.result.likelihood,
  }));

  return {
    possibleConditions,
    urgency: primaryResult.urgency,
    actionGuidance: primaryResult.actionGuidance,
    homeCareRecommendations: primaryResult.homeCareRecommendations,
    redFlags: primaryResult.redFlags,
  };
}

export function isComplexCase(data: SymptomData): boolean {
  // Determine if case is too complex for rule-based engine
  const complexityFactors = [
    // Multiple severe symptoms
    data.associatedSymptoms.length >= 4,
    // Long duration with multiple triggers
    data.duration.includes('More than 2 weeks') && data.triggers.length >= 3,
    // Unusual symptom combinations
    data.associatedSymptoms.includes('Sensitivity to light/sound'),
    // Multiple pain types (if user describes it in location)
    data.location.toLowerCase().includes('multiple') ||
      data.location.toLowerCase().includes('several'),
  ];

  return complexityFactors.filter(Boolean).length >= 2;
}
