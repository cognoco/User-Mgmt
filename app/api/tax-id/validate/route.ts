import { z } from 'zod';
import { NextResponse } from 'next/server';

const TaxIdSchema = z.object({ taxId: z.string() });

export async function POST(req: Request) {
  const body = await req.json();
  const parse = TaxIdSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  // Simple real-world tax/VAT ID validation
  const { taxId } = parse.data;

  const patterns = [
    /^DE[0-9]{9}$/, // German VAT
    /^FR[0-9A-Z]{2}[0-9]{9}$/, // French VAT
    /^[0-9]{2}-[0-9]{7}$/, // US EIN
    /^[A-Z]{2}[0-9]{8,12}$/ // Generic prefix + digits
  ];

  const isValid = patterns.some((p) => p.test(taxId));
  return NextResponse.json({ valid: isValid });
} 