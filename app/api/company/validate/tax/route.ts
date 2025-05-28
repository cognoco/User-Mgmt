import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';

const ValidationRequestSchema = z.object({
  taxId: z.string().min(1),
  countryCode: z.string().min(2).max(3), // ISO 3166-1 alpha-2 or alpha-3
});

interface ValidationRequest extends z.infer<typeof ValidationRequestSchema> {}

interface ValidationResult {
  isValid: boolean;
  details: any;
  status: 'valid' | 'invalid' | 'not_supported' | 'error';
  message: string;
}

// --- Country-specific validation strategies ---
const countryValidators: Record<string, (taxId: string) => Promise<ValidationResult>> = {
  // EU VAT (mock VIES)
  'DE': async (taxId) => ({
    isValid: /^DE[0-9]{9}$/.test(taxId),
    details: { system: 'VIES', country: 'DE' },
    status: /^DE[0-9]{9}$/.test(taxId) ? 'valid' : 'invalid',
    message: /^DE[0-9]{9}$/.test(taxId) ? 'Valid German VAT ID' : 'Invalid German VAT ID',
  }),
  'FR': async (taxId) => ({
    isValid: /^FR[0-9A-Z]{2}[0-9]{9}$/.test(taxId),
    details: { system: 'VIES', country: 'FR' },
    status: /^FR[0-9A-Z]{2}[0-9]{9}$/.test(taxId) ? 'valid' : 'invalid',
    message: /^FR[0-9A-Z]{2}[0-9]{9}$/.test(taxId) ? 'Valid French VAT ID' : 'Invalid French VAT ID',
  }),
  // US EIN (mock)
  'US': async (taxId) => ({
    isValid: /^[0-9]{2}-[0-9]{7}$/.test(taxId),
    details: { system: 'IRS', country: 'US' },
    status: /^[0-9]{2}-[0-9]{7}$/.test(taxId) ? 'valid' : 'invalid',
    message: /^[0-9]{2}-[0-9]{7}$/.test(taxId) ? 'Valid US EIN' : 'Invalid US EIN',
  }),
  // Add more countries here as needed
};

async function handlePost(request: NextRequest, auth: RouteAuthContext) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    // 3. Parse and Validate Body
    let body: ValidationRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = ValidationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }
    
    const { taxId, countryCode } = parseResult.data;

    const validator = countryValidators[countryCode.toUpperCase()];
    let validationResult: ValidationResult;
    if (validator) {
      validationResult = await validator(taxId);
    } else {
      validationResult = {
        isValid: false,
        details: { message: 'Validation not supported for this country.' },
        status: 'not_supported',
        message: `Validation for country ${countryCode} is not yet implemented.`
      };
    }

    // Update company_profiles
    await supabaseService
      .from('company_profiles')
      .update({
        tax_id_verified: validationResult.isValid,
        tax_id_last_checked: new Date().toISOString(),
        tax_id_validation_details: validationResult.details,
      })
      .eq('user_id', userId);

    return NextResponse.json({
      status: validationResult.status,
      message: validationResult.message,
      details: validationResult.details,
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/company/validate/tax:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

export const POST = (req: NextRequest) => withRouteAuth(handlePost, req);
