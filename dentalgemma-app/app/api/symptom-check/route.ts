import { NextRequest, NextResponse } from 'next/server';
import type { SymptomData, SymptomResult, UrgencyLevel } from '@/types';

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

    // Call Modal.com backend
    const modalUrl = process.env.MODAL_ENDPOINT_URL;
    if (!modalUrl) {
      throw new Error('Modal endpoint not configured');
    }

    const response = await fetch(`${modalUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        history: [],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get diagnosis from model');
    }

    const data = await response.json();
    
    // Parse the model response into structured format
    const diagnosis = parseModelResponse(data.message, symptomData);

    return NextResponse.json({
      success: true,
      diagnosis,
    });
  } catch (error) {
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

Please provide:
1. A ranked list of 3 possible dental conditions (with likelihood percentages)
2. Urgency classification (emergency, urgent, routine, or home-care)
3. Specific action guidance based on urgency
4. Home care recommendations
5. Red flag warnings to watch for

Format your response clearly with these sections.`;
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
    const lowerLine = line.toLowerCase();

    // Detect sections
    if (lowerLine.includes('possible condition') || lowerLine.includes('differential')) {
      currentSection = 'conditions';
      continue;
    } else if (lowerLine.includes('urgency')) {
      currentSection = 'urgency';
      continue;
    } else if (lowerLine.includes('action') || lowerLine.includes('guidance')) {
      currentSection = 'action';
      continue;
    } else if (lowerLine.includes('home care') || lowerLine.includes('recommendation')) {
      currentSection = 'homecare';
      continue;
    } else if (lowerLine.includes('red flag') || lowerLine.includes('warning')) {
      currentSection = 'redflags';
      continue;
    }

    // Parse content based on current section
    if (currentSection === 'conditions') {
      // Try to extract condition and likelihood
      const match = line.match(/(.+?)[\s-]*(\d+)%/);
      if (match) {
        possibleConditions.push({
          condition: match[1].replace(/^\d+\.\s*/, '').trim(),
          likelihood: parseInt(match[2]) / 100,
        });
      } else if (line.match(/^\d+\./)) {
        possibleConditions.push({
          condition: line.replace(/^\d+\.\s*/, '').trim(),
          likelihood: 0.5,
        });
      }
    } else if (currentSection === 'urgency') {
      if (lowerLine.includes('emergency')) urgency = 'emergency';
      else if (lowerLine.includes('urgent')) urgency = 'urgent';
      else if (lowerLine.includes('routine')) urgency = 'routine';
      else if (lowerLine.includes('home') || lowerLine.includes('self-care')) urgency = 'home-care';
    } else if (currentSection === 'action') {
      if (line.trim() && !line.match(/^\d+\./)) {
        actionGuidance += line.trim() + ' ';
      }
    } else if (currentSection === 'homecare') {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 5) {
        homeCareRecommendations.push(cleaned);
      }
    } else if (currentSection === 'redflags') {
      const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim();
      if (cleaned && cleaned.length > 5) {
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
  if (!actionGuidance) {
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

  // Ensure we have red flags
  if (redFlags.length === 0) {
    redFlags.push(
      'Severe or worsening pain',
      'Swelling that increases',
      'Fever or difficulty swallowing'
    );
  }

  return {
    possibleConditions: possibleConditions.slice(0, 3),
    urgency,
    actionGuidance: actionGuidance.trim(),
    homeCareRecommendations,
    redFlags,
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
