import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: 'WebAuthn registration not implemented' }, { status: 501 });
}
