import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';

const ValidationRequestSchema = z.object({
  registrationNumber: z.string().min(1),
  countryCode: z.string().min(2).max(3), // ISO 3166-1 alpha-2 or alpha-3
});

type ValidationRequest = z.infer<typeof ValidationRequestSchema>;

export async function POST(request: NextRequest) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Get User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }

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
    
    const { registrationNumber, countryCode } = parseResult.data;

    // --- TODO: Implement Country-Specific Validation Logic ---
    console.warn(`Registration number (${registrationNumber}) validation for ${countryCode} not implemented yet.`);
    
    // Placeholder: Update DB as 'unchecked' or similar? Or wait for real validation?
    // For now, return a placeholder indicating it's not implemented for this country
    
    return NextResponse.json({ 
        status: 'error', // Or 'pending', 'not_supported'
        message: `Validation for country ${countryCode} is not yet implemented.` 
    }, { status: 501 }); // 501 Not Implemented

    /* 
    // --- Example of Future Implementation ---
    
    let validationResult = { isValid: false, details: { message: 'Not implemented' } };
    if (countryCode === 'GB') {
       // validationResult = await callCompaniesHouseAPI(registrationNumber);
    } else if (['DE', 'FR', 'ES'].includes(countryCode)) {
       // validationResult = await callEURegistryAPI(registrationNumber, countryCode);
    } else {
       // validationResult = { isValid: false, details: { message: 'Validation not supported for this country yet.' } };
    }

    // Update company_profiles table in Supabase
    await supabaseService
        .from('company_profiles')
        .update({
            registration_number_verified: validationResult.isValid,
            registration_number_last_checked: new Date().toISOString(),
            registration_number_validation_details: validationResult.details,
         })
        .eq('user_id', user.id); // Assuming company_profiles has a user_id link

    // Return result to frontend
    return NextResponse.json({
       status: validationResult.isValid ? 'valid' : 'invalid',
       message: validationResult.details.message
    }); 
    */

  } catch (error) {
    console.error('Unexpected error in POST /api/company/validate/registration:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 