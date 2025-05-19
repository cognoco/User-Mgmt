import { z } from 'zod';
import { NextResponse } from 'next/server';

const CompanySchema = z.object({ companyName: z.string() });

export async function POST(req: Request) {
  const body = await req.json();
  const parse = CompanySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  // TODO: Implement real company registration validation logic
  const { companyName } = parse.data;
  const isValid = companyName.length > 2; // mock logic
  return NextResponse.json({ valid: isValid });
} 