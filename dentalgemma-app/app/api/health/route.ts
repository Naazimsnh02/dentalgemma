/**
 * Health Check API Route
 * 
 * Checks Modal.com connectivity and returns system status
 * Requirements: 16.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { modalClient } from '@/lib/api/modal-client';
import type { HealthCheckResponse } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check Modal.com connectivity
    let modalConnected = false;
    let modalStatus = 'unknown';
    
    try {
      const modalHealth = await modalClient.healthCheck();
      modalConnected = modalHealth.status === 'ok' || modalHealth.status === 'healthy';
      modalStatus = modalHealth.status;
    } catch (error: any) {
      console.error('Modal.com health check failed:', error);
      modalConnected = false;
      modalStatus = 'unhealthy';
    }

    // Determine overall system status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (modalConnected) {
      status = 'healthy';
    } else {
      // System is degraded if Modal.com is down (offline features still work)
      status = 'degraded';
    }

    const response: HealthCheckResponse = {
      status,
      modalConnected,
      timestamp: Date.now(),
    };

    // Add response time header
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(response, {
      headers: {
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Health check error:', error);

    const response: HealthCheckResponse = {
      status: 'unhealthy',
      modalConnected: false,
      timestamp: Date.now(),
    };

    return NextResponse.json(response, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

// HEAD handler for lightweight health checks
export async function HEAD(request: NextRequest) {
  try {
    // Quick check without full Modal.com connectivity test
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
    });
  }
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
      },
    }
  );
}
