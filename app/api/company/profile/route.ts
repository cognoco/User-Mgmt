import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';
import { logUserAction } from '@/lib/audit/auditLogger';

// Company Profile Schema
const CompanyProfileSchema = z.object({
  name: z.string().min(2).max(100),
  legal_name: z.string().min(2).max(100),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().min(2).max(50),
  size_range: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()),
  description: z.string().max(1000).optional()
});

type CompanyProfileRequest = z.infer<typeof CompanyProfileSchema>;

// Company Profile Update Schema - more permissive than creation schema
const CompanyProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  legal_name: z.string().min(2).max(100).optional(),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().min(2).max(50).optional(),
  size_range: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  description: z.string().max(1000).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

type CompanyProfileUpdateRequest = z.infer<typeof CompanyProfileUpdateSchema>;

export async function POST(request: NextRequest) {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get('user-agent');
  let userIdForLogging: string | null = null;

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
      // Log unauthorized attempt
      await logUserAction({
          action: 'COMPANY_PROFILE_CREATE_UNAUTHORIZED',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'company_profile',
          details: { reason: userError?.message ?? 'Invalid token' }
      });
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }
    userIdForLogging = user.id; // Store for logging

    // 3. Check if user already has a company profile
    const { data: existingProfile /*, error: existingProfileError */ } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Log attempt to create duplicate profile
      await logUserAction({
          userId: userIdForLogging,
          action: 'COMPANY_PROFILE_CREATE_DUPLICATE_ATTEMPT',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'company_profile',
          targetResourceId: userIdForLogging, 
          details: { existingProfileId: existingProfile.id }
      });
      return NextResponse.json({ error: 'User already has a company profile' }, { status: 409 });
    }

    // 4. Parse and Validate Request Body
    let body: CompanyProfileRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = CompanyProfileSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parseResult.error.format() 
      }, { status: 400 });
    }

    // 5. Create Company Profile
    const { data: profile, error: createError } = await supabaseService
      .from('company_profiles')
      .insert({
        ...parseResult.data,
        user_id: user.id,
        status: 'pending',
        verified: false
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating company profile:', createError);
      // Log creation failure
      await logUserAction({
          userId: userIdForLogging,
          action: 'COMPANY_PROFILE_CREATE_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'company_profile',
          targetResourceId: userIdForLogging, // Target is the user attempting creation
          details: { 
              reason: createError.message, 
              code: createError.code
          }
      });
      return NextResponse.json({ error: 'Failed to create company profile' }, { status: 500 });
    }

    // Log successful creation
    await logUserAction({
        userId: userIdForLogging,
        action: 'COMPANY_PROFILE_CREATE_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'company_profile',
        targetResourceId: profile.id, // The ID of the newly created profile
        details: { companyName: profile.name } // Log company name as context
    });

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Unexpected error in POST /api/company/profile:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Log unexpected error
    await logUserAction({
        userId: userIdForLogging, // May be null
        action: 'COMPANY_PROFILE_CREATE_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'company_profile',
        targetResourceId: userIdForLogging,
        details: { error: message }
    });
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    // 3. Get Company Profile
    const { data: profile, error: profileError } = await supabaseService
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
      }
      console.error('Error fetching company profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch company profile' }, { status: 500 });
    }

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Unexpected error in GET /api/company/profile:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get('user-agent');
  let userIdForLogging: string | null = null;
  let companyProfileIdForLogging: string | null = null;

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
      // Log unauthorized attempt
      await logUserAction({
          action: 'COMPANY_PROFILE_UPDATE_UNAUTHORIZED',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'company_profile',
          details: { reason: userError?.message ?? 'Invalid token' }
      });
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }
    userIdForLogging = user.id;

    // 3. Get Existing Profile ID (needed for logging and update)
    const { data: existingProfile /*, error: profileError - not used */ } = await supabaseService
      .from('company_profiles')
      .select('id') // Only select ID
      .eq('user_id', user.id)
      .single();

    if (!existingProfile) {
        // Log attempt to update non-existent profile
        await logUserAction({
            userId: userIdForLogging,
            action: 'COMPANY_PROFILE_UPDATE_NOT_FOUND',
            status: 'FAILURE',
            ipAddress: ipAddress,
            userAgent: userAgent,
            targetResourceType: 'company_profile',
            targetResourceId: userIdForLogging, // Target is the user
            details: { reason: 'Company profile not found for user' }
        });
        return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }
    companyProfileIdForLogging = existingProfile.id; // Store for logging

    // 4. Parse and Validate Request Body
    let body: CompanyProfileUpdateRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = CompanyProfileUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }

    // 5. Update Profile
    const fieldsToUpdate = parseResult.data;
    const { data: updatedProfile, error: updateError } = await supabaseService
      .from('company_profiles')
      .update({
        ...fieldsToUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyProfileIdForLogging) // Use the fetched ID
      .select()
      .single();

    if (updateError) {
      console.error('Error updating company profile:', updateError);
      // Log update failure
      await logUserAction({
          userId: userIdForLogging,
          action: 'COMPANY_PROFILE_UPDATE_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'company_profile',
          targetResourceId: companyProfileIdForLogging,
          details: { 
              reason: updateError.message, 
              code: updateError.code,
              attemptedFields: Object.keys(fieldsToUpdate) // Log which fields were attempted
          }
      });
      return NextResponse.json({ error: 'Failed to update company profile' }, { status: 500 });
    }

    // Log successful update
    await logUserAction({
        userId: userIdForLogging,
        action: 'COMPANY_PROFILE_UPDATE_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'company_profile',
        targetResourceId: companyProfileIdForLogging,
        details: { updatedFields: Object.keys(fieldsToUpdate) } // Log which fields were updated
    });

    return NextResponse.json(updatedProfile);

  } catch (error) {
    console.error('Unexpected error in PUT /api/company/profile:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Log unexpected error
    await logUserAction({
        userId: userIdForLogging, // May be null
        action: 'COMPANY_PROFILE_UPDATE_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'company_profile',
        targetResourceId: companyProfileIdForLogging, // May be null
        details: { error: message }
    });
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get('user-agent');
  let userIdForLogging: string | null = null;
  let companyProfileIdForLogging: string | null = null;

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
      // Log unauthorized attempt
      await logUserAction({
          action: 'COMPANY_PROFILE_DELETE_UNAUTHORIZED',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'company_profile',
          details: { reason: userError?.message ?? 'Invalid token' }
      });
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }
    userIdForLogging = user.id;

    // 3. Get Profile ID to delete
    const { data: profileToDelete /*, error: profileError */ } = await supabaseService // Commented out unused error variable
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profileToDelete) {
       // Log attempt to delete non-existent profile
        await logUserAction({
            userId: userIdForLogging,
            action: 'COMPANY_PROFILE_DELETE_NOT_FOUND',
            status: 'FAILURE',
            ipAddress: ipAddress,
            userAgent: userAgent,
            targetResourceType: 'company_profile',
            targetResourceId: userIdForLogging, // Target is the user
            details: { reason: 'Company profile not found to delete' }
        });
      return NextResponse.json({ error: 'Company profile not found to delete' }, { status: 404 });
    }
    companyProfileIdForLogging = profileToDelete.id;

    // Optional: Delete related data (e.g., documents, addresses) - requires careful handling
    // Example: Deleting associated documents from Storage
    // Fetch document paths first
    const { data: documents /*, error: documentsError */ } = await supabaseService // Commented out unused error variable
      .from('company_documents')
      .select('storage_path')
      .eq('company_id', companyProfileIdForLogging);
    
    if (documents && documents.length > 0) {
      const filePaths = documents.map(doc => doc.storage_path).filter(path => path);
      if (filePaths.length > 0) {
        // Delete from Storage
        const { error: storageError } = await supabaseService.storage
          .from('company-documents') // Replace with your actual bucket name
          .remove(filePaths);
        if (storageError) {
          console.error('Error deleting documents from storage:', storageError);
          // Decide if this is a fatal error or just log and continue
        }
        // Delete from DB table
        const { error: dbDeleteError } = await supabaseService
          .from('company_documents')
          .delete()
          .eq('company_id', companyProfileIdForLogging);
        if (dbDeleteError) {
          console.error('Error deleting document records from DB:', dbDeleteError);
          // Decide if this is a fatal error or just log and continue
        }
      }
    }

    // 4. Delete the Company Profile
    const { error: deleteError } = await supabaseService
      .from('company_profiles')
      .delete()
      .eq('id', companyProfileIdForLogging);

    if (deleteError) {
      console.error('Error deleting company profile:', deleteError);
      // Log deletion failure
      await logUserAction({
          userId: userIdForLogging,
          action: 'COMPANY_PROFILE_DELETE_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'company_profile',
          targetResourceId: companyProfileIdForLogging,
          details: { 
              reason: deleteError.message, 
              code: deleteError.code
          }
      });
      return NextResponse.json({ error: 'Failed to delete company profile' }, { status: 500 });
    }

    // Log successful deletion
    await logUserAction({
        userId: userIdForLogging,
        action: 'COMPANY_PROFILE_DELETE_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'company_profile',
        targetResourceId: companyProfileIdForLogging
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/company/profile:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    // Log unexpected error
    await logUserAction({
        userId: userIdForLogging, // May be null
        action: 'COMPANY_PROFILE_DELETE_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'company_profile',
        targetResourceId: companyProfileIdForLogging, // May be null
        details: { error: message }
    });
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 