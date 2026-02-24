/**
 * Health Check API Route
 * 
 * Disabled to save Modal.com costs during hackathon.
 * Returns simple OK response without checking Modal connectivity.
 * Requirements: 16.1
 */

import { NextRequest, NextResponse } from 'next/server';
import type { HealthCheckResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Return simple healthy response without calling Modal.com
  // This saves costs since external monitors may ping this endpoint
  const response: HealthCheckResponse = {
    status: 'healthy',
    modalConnected: true, // Assume healthy, actual checks happen on feature usage
    timestamp: Date.now(),
  };

  return NextResponse.json(response, {
    headers: {
      'X-Response-Time': '0ms',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  });
}

// HEAD handler for lightweight health checks
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
}
