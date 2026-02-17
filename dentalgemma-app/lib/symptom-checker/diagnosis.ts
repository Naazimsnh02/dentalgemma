import type { SymptomData, SymptomResult } from '@/types';
import { analyzeSymptoms, isComplexCase } from './rules-engine';

export async function diagnoseSymptoms(data: SymptomData): Promise<SymptomResult> {
  // First, try rule-based engine for simple cases
  if (!isComplexCase(data)) {
    const ruleBasedResult = analyzeSymptoms(data);
    if (ruleBasedResult) {
      return ruleBasedResult;
    }
  }

  // For complex cases, use DentalGemma model
  try {
    const response = await fetch('/api/symptom-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptomData: data }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze symptoms');
    }

    const result = await response.json();
    return result.diagnosis;
  } catch (error) {
    console.error('Error diagnosing symptoms:', error);
    
    // Fallback to rule-based engine if API fails
    const fallbackResult = analyzeSymptoms(data);
    if (fallbackResult) {
      return fallbackResult;
    }

    // Last resort: generic response
    return {
      possibleConditions: [
        {
          condition: 'Unable to determine specific condition',
          likelihood: 0.5,
        },
      ],
      urgency: 'routine',
      actionGuidance:
        'We recommend scheduling a dental appointment for a proper examination. Your symptoms require professional evaluation.',
      homeCareRecommendations: [
        'Maintain good oral hygiene',
        'Rinse with warm salt water',
        'Take over-the-counter pain medication as needed',
        'Avoid irritating the affected area',
      ],
      redFlags: [
        'Severe or worsening pain',
        'Swelling that increases',
        'Fever or difficulty swallowing',
        'Symptoms that persist beyond a few days',
      ],
    };
  }
}
