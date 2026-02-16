/**
 * X-Ray Analysis API Route
 * 
 * Accepts image + analysis type, forwards to Modal.com, returns structured analysis
 * Requirements: 1.1-1.5, 17.8
 */

import { NextRequest, NextResponse } from 'next/server';
import { modalClient } from '@/lib/api/modal-client';
import type { AnalysisType, XRayAnalysis } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AnalyzeXRayRequestBody {
  image: string; // Base64 encoded image
  analysisType: AnalysisType;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AnalyzeXRayRequestBody = await request.json();

    // Validate required fields
    if (!body.image) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (!body.analysisType) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis type is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate analysis type
    const validTypes: AnalysisType[] = ['cavity', 'opg', 'tooth-id', 'general'];
    if (!validTypes.includes(body.analysisType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid analysis type. Must be one of: ${validTypes.join(', ')}`,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate base64 image format
    if (!body.image.match(/^data:image\/(jpeg|jpg|png|dicom);base64,/) && !body.image.match(/^[A-Za-z0-9+/=]+$/)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image format. Must be base64 encoded JPEG, PNG, or DICOM',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Forward to Modal.com
    const analysis: XRayAnalysis = await modalClient.analyzeXray(
      body.image,
      body.analysisType
    );

    // Return structured response
    return NextResponse.json({
      success: true,
      ...analysis,
    });
  } catch (error: any) {
    console.error('X-ray analysis API error:', error);

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
        error: 'An unexpected error occurred during analysis',
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
