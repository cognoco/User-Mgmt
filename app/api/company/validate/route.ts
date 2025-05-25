import { z } from 'zod';
import { NextResponse } from 'next/server';

const CompanySchema = z.object({ companyName: z.string() });

export async function POST(req: Request) {
  const body = await req.json();
  const parse = CompanySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  // Basic company name validation
  const { companyName } = parse.data;

  const cleaned = companyName.trim();
  const validChars = /^[a-zA-Z0-9 .,&'-]+$/;
  const words = cleaned.split(/\s+/);

  const isValid =
    cleaned.length >= 3 &&
    validChars.test(cleaned) &&
    words.length >= 2 &&
    words.every((w) => w.length > 1);
  return NextResponse.json({ valid: isValid });
} 