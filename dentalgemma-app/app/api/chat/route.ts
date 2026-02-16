/**
 * Chat API Route
 * 
 * Accepts message + history, forwards to Modal.com, returns AI response
 * Requirements: 3.4, 17.8
 */

import { NextRequest, NextResponse } from 'next/server';
import { modalClient } from '@/lib/api/modal-client';
import type { VoiceMessage } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  message: string;
  history?: VoiceMessage[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequestBody = await request.json();

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required and must be a string',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate message is not empty
    if (body.message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message cannot be empty',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate history if provided
    if (body.history && !Array.isArray(body.history)) {
      return NextResponse.json(
        {
          success: false,
          error: 'History must be an array of messages',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate history messages structure
    if (body.history) {
      for (const msg of body.history) {
        if (!msg.speaker || !msg.text) {
          return NextResponse.json(
            {
              success: false,
              error: 'Each history message must have speaker and text fields',
              code: 'VALIDATION_ERROR',
            },
            { status: 400 }
          );
        }
        if (msg.speaker !== 'user' && msg.speaker !== 'ai') {
          return NextResponse.json(
            {
              success: false,
              error: 'Message speaker must be either "user" or "ai"',
              code: 'VALIDATION_ERROR',
            },
            { status: 400 }
          );
        }
      }
    }

    // Forward to Modal.com
    const startTime = Date.now();
    const response: string = await modalClient.chat(body.message, body.history);
    const processingTime = Date.now() - startTime;

    // Return structured response
    return NextResponse.json({
      success: true,
      message: response,
      processingTime,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);

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
        error: 'An unexpected error occurred during chat',
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
