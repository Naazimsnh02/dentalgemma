import type { SymptomData, SimpleSymptomResult } from '@/types';

export async function diagnoseSymptoms(data: SymptomData): Promise<SimpleSymptomResult> {
  // Always use DentalGemma AI for diagnosis
  const response = await fetch('/api/symptom-check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ symptomData: data }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to analyze symptoms (HTTP ${response.status})`);
  }

  const result = await response.json();

  if (!result.success || !result.diagnosis) {
    throw new Error(result.error || 'Invalid response from AI service');
  }

  return result.diagnosis;
}
