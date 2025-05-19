import { z } from 'zod';
import { NextResponse } from 'next/server';

const TaxIdSchema = z.object({ taxId: z.string() });

export async function POST(req: Request) {
  const body = await req.json();
  const parse = TaxIdSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  // TODO: Implement real tax ID validation logic
  const { taxId } = parse.data;
  const isValid = taxId.length > 5; // mock logic
  return NextResponse.json({ valid: isValid });
} 