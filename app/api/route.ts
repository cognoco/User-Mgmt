import { NextResponse } from 'next/server';

// Simple health check endpoint
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error); // Should not happen
    return NextResponse.json({ status: 'error', message: 'API health check failed' }, { status: 500 });
  }
} 