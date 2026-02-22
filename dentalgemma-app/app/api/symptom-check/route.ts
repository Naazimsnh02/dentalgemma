/**
 * Symptom Check API Route
 *
 * Accepts symptom data, forwards to Modal.com DentalGemma model, returns structured diagnosis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { modalClient } from '@/lib/api/modal-client';
import type { SymptomData, SimpleSymptomResult, UrgencyLevel } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { symptomData } = await request.json();

    if (!symptomData) {
      return NextResponse.json(
        { success: false, error: 'Symptom data is required' },
        { status: 400 }
      );
    }

    // Build prompt for DentalGemma
    const prompt = buildSymptomPrompt(symptomData);

    // Call Modal.com via the shared modal client (uses NEXT_PUBLIC_MODAL_BASE_URL)
    const aiMessage = await modalClient.chat(prompt, []);

    // Parse the model response into simplified format
    const diagnosis = parseSimplifiedResponse(aiMessage);

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (error: unknown) {
    console.error('Error in symptom check:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

function buildSymptomPrompt(data: SymptomData): string {
  return `Please evaluate this dental patient based on reported symptoms:

PATIENT: Symptomatic patient evaluation
AGE: Not specified
SEX: Not specified

CHIEF COMPLAINT: Patient reporting dental symptoms.

HISTORY: Location: ${data.location}. Pain Type: ${data.painType}. Duration: ${data.duration}. Triggers: ${data.triggers.join(', ') || 'None'}. Associated Symptoms: ${data.associatedSymptoms.join(', ') || 'None'}.

CLINICAL FINDINGS: Not clinically evaluated yet.

MEDICAL HISTORY: ${data.medicalHistory.join(', ') || 'None reported'}

What is your diagnosis and treatment plan?`;
}

function parseSimplifiedResponse(response: string): SimpleSymptomResult {
  const cleaned = response.trim();
  
  // Extract urgency just for the banner color
  let urgency: UrgencyLevel = 'routine';
  const urgencyMatch = cleaned.match(/\*\*Urgency:\*\*\s*(.+?)(?:\n|$)/i);
  
  if (urgencyMatch) {
    const text = urgencyMatch[1].toLowerCase();
    if (text.includes('emergency') || text.includes('(2)')) urgency = 'emergency';
    else if (text.includes('urgent') || text.includes('(1)')) urgency = 'urgent';
    else if (text.includes('home')) urgency = 'home-care';
    else urgency = 'routine';
  }

  return {
    urgency,
    markdownReport: cleaned
  };
}
