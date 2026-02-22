/**
 * Symptom Check API Route
 *
 * Accepts symptom data, forwards to Modal.com DentalGemma model, returns structured diagnosis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { modalClient } from '@/lib/api/modal-client';
import type { SymptomData, SymptomResult, UrgencyLevel } from '@/types';

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

    // Parse the model response into structured format
    const diagnosis = parseModelResponse(aiMessage, symptomData);

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (error: any) {
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
  return `You are a dental AI assistant. A patient has reported the following symptoms:

Location: ${data.location}
Pain Type: ${data.painType}
Duration: ${data.duration}
Triggers: ${data.triggers.join(', ') || 'None reported'}
Associated Symptoms: ${data.associatedSymptoms.join(', ') || 'None reported'}
Medical History: ${data.medicalHistory.join(', ') || 'None reported'}

Provide a concise analysis with these sections (use exact headers):

**1. Possible Dental Conditions:**
1. [Condition name] - [XX]%
2. [Condition name] - [XX]%
3. [Condition name] - [XX]%

**2. Urgency Classification:** [emergency/urgent/routine/home-care]

**3. Action Guidance:**
[Specific actions based on urgency - 1-2 sentences]

**4. Home Care Recommendations:**
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

**5. Red Flag Warnings:**
- [Warning 1]
- [Warning 2]
- [Warning 3]

Be concise. List each item once. Avoid repeating content.`;
}

function parseModelResponse(response: string, symptomData: SymptomData): SymptomResult {
  // Parse the model's text response into structured format
  const lines = response.split('\n').filter((line) => line.trim());

  const possibleConditions: Array<{ condition: string; likelihood: number }> = [];
  let urgency: UrgencyLevel = 'routine';
  let actionGuidance = '';
  const homeCareRecommendations: string[] = [];
  const redFlags: string[] = [];

  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const lowerLine = trimmed.toLowerCase();

    // Detect sections using numbered headers
    if (lowerLine.match(/^\*\*\d+\.\s*possible.*conditions?/i) || lowerLine.includes('differential')) {
      currentSection = 'conditions';
      continue;
    } else if (lowerLine.match(/^\*\*\d+\.\s*urgency/i)) {
      currentSection = 'urgency';
      // Try to extract urgency from the same line
      if (lowerLine.includes('emergency')) urgency = 'emergency';
      else if (lowerLine.includes('urgent') && !lowerLine.includes('non-urgent')) urgency = 'urgent';
      else if (lowerLine.includes('routine')) urgency = 'routine';
      else if (lowerLine.includes('home') || lowerLine.includes('self-care')) urgency = 'home-care';
      continue;
    } else if (lowerLine.match(/^\*\*\d+\.\s*action/i) || lowerLine.includes('guidance')) {
      currentSection = 'action';
      continue;
    } else if (lowerLine.match(/^\*\*\d+\.\s*home\s*care/i) || lowerLine.match(/^\*\*\d+\.\s*recommendation/i)) {
      currentSection = 'homecare';
      continue;
    } else if (lowerLine.match(/^\*\*\d+\.\s*red\s*flag/i) || lowerLine.includes('warning')) {
      currentSection = 'redflags';
      continue;
    }

    // Skip empty lines and section headers
    if (!trimmed || trimmed.startsWith('**') || trimmed.startsWith('##')) {
      continue;
    }

    // Parse content based on current section
    if (currentSection === 'conditions') {
      const match = trimmed.match(/^\d+\.\s*(.+?)[\s\-\(]*(\d+)%/);
      if (match) {
        const condition = match[1].trim().replace(/\*\*/g, '');
        possibleConditions.push({
          condition,
          likelihood: parseInt(match[2]) / 100,
        });
      } else if (trimmed.match(/^\d+\./)) {
        const condition = trimmed.replace(/^\d+\.\s*/, '').trim().replace(/\*\*/g, '');
        if (condition.length > 3) {
          possibleConditions.push({
            condition,
            likelihood: 0.5,
          });
        }
      }
    } else if (currentSection === 'urgency') {
      if (lowerLine.includes('emergency')) urgency = 'emergency';
      else if (lowerLine.includes('urgent') && !lowerLine.includes('non-urgent')) urgency = 'urgent';
      else if (lowerLine.includes('routine')) urgency = 'routine';
      else if (lowerLine.includes('home') || lowerLine.includes('self-care')) urgency = 'home-care';
    } else if (currentSection === 'action') {
      const cleaned = trimmed.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      if (cleaned && cleaned.length > 5 && !cleaned.match(/^\d+\.\s*action/i)) {
        actionGuidance += cleaned + ' ';
      }
    } else if (currentSection === 'homecare') {
      const cleaned = trimmed.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      if (cleaned && cleaned.length > 5 && !cleaned.match(/home\s*care.*recommendation/i)) {
        homeCareRecommendations.push(cleaned);
      }
    } else if (currentSection === 'redflags') {
      const cleaned = trimmed.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      if (cleaned && cleaned.length > 5 && !cleaned.match(/red\s*flag.*warning/i) && cleaned.startsWith('**') === false) {
        redFlags.push(cleaned);
      }
    }
  }

  // Ensure we have at least one condition
  if (possibleConditions.length === 0) {
    possibleConditions.push({
      condition: 'Dental condition requiring professional evaluation',
      likelihood: 0.6,
    });
  }

  // Ensure we have action guidance
  if (!actionGuidance.trim()) {
    actionGuidance = getDefaultActionGuidance(urgency);
  }

  // Ensure we have home care recommendations
  if (homeCareRecommendations.length === 0) {
    homeCareRecommendations.push(
      'Maintain good oral hygiene',
      'Rinse with warm salt water',
      'Take over-the-counter pain medication as needed'
    );
  }

  // Deduplicate home care recommendations
  const uniqueHomeCare = Array.from(new Set(homeCareRecommendations.map(r => r.toLowerCase().trim())))
    .map(normalized => homeCareRecommendations.find(r => r.toLowerCase().trim() === normalized)!)
    .filter(Boolean);

  // Ensure we have red flags
  if (redFlags.length === 0) {
    redFlags.push(
      'Severe or worsening pain',
      'Swelling that increases',
      'Fever or difficulty swallowing'
    );
  }

  // Deduplicate red flags
  const uniqueRedFlags = Array.from(new Set(redFlags.map(r => r.toLowerCase().trim())))
    .map(normalized => redFlags.find(r => r.toLowerCase().trim() === normalized)!)
    .filter(Boolean);

  return {
    possibleConditions: possibleConditions.slice(0, 3),
    urgency,
    actionGuidance: actionGuidance.trim(),
    homeCareRecommendations: uniqueHomeCare,
    redFlags: uniqueRedFlags,
  };
}

function getDefaultActionGuidance(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'emergency':
      return 'Seek immediate emergency care. Go to the nearest emergency room or call emergency services.';
    case 'urgent':
      return 'Contact your dentist within 24 hours for an urgent appointment.';
    case 'routine':
      return 'Schedule a routine dental appointment within 1-2 weeks for evaluation.';
    case 'home-care':
      return 'Monitor symptoms for 24-48 hours. If symptoms persist or worsen, contact your dentist.';
    default:
      return 'Consult with your dentist for proper evaluation and treatment.';
  }
}
