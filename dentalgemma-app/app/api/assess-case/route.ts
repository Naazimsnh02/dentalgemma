/**
 * Clinical Assessment API Route
 * 
 * Accepts clinical case data, forwards to Modal.com, returns structured assessment
 * Requirements: 2.6-2.13, 17.8
 */

import { NextRequest, NextResponse } from 'next/server';
import { modalClient } from '@/lib/api/modal-client';
import type { ClinicalCase, CaseAssessment } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AssessCaseRequestBody {
  caseData: ClinicalCase;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AssessCaseRequestBody = await request.json();

    // Validate required fields
    if (!body.caseData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Case data is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const { caseData } = body;

    // Validate patient info
    if (!caseData.patient || typeof caseData.patient.age !== 'number' || !caseData.patient.gender) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid patient information (age, gender) is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate chief complaint
    if (!caseData.chiefComplaint || !caseData.chiefComplaint.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chief complaint description is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate clinical findings
    if (!caseData.clinicalFindings) {
      return NextResponse.json(
        {
          success: false,
          error: 'Clinical findings are required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate radiographic findings
    if (!caseData.radiographicFindings || !caseData.radiographicFindings.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Radiographic findings description is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate medical history
    if (!caseData.medicalHistory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Medical history is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Forward to Modal.com
    const assessment: CaseAssessment = await modalClient.assessCase(caseData);

    // Return structured response (assessment already includes success: true)
    return NextResponse.json(assessment);
  } catch (error: any) {
    console.error('Clinical assessment API error:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to AI service. Please try again.',
          code: error.code || 'NETWORK_ERROR',
        },
        { status: 503 }
      );
    }

    if (error.name === 'ModalClientError') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code || 'MODAL_ERROR',
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during assessment',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
