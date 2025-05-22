import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';

// DELETE /api/company/notifications/recipients/[id] - Delete a notification recipient
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Validate recipient ID
    const recipientId = params.id;
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 });
    }

    // 3. Authentication & Get User
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

    // 4. Get the recipient with preference and company info to check permissions
    const { data: recipient, error: recipientError } = await supabaseService
      .from('company_notification_recipients')
      .select(`
        *,
        preference:company_notification_preferences!inner(
          *,
          company:company_profiles!inner(id, user_id)
        )
      `)
      .eq('id', recipientId)
      .single();

    if (recipientError) {
      console.error(`Error fetching recipient ${recipientId}:`, recipientError);
      return NextResponse.json({ error: 'Notification recipient not found.' }, { status: 404 });
    }

    // 5. Verify user has permission (owns the company profile)
    if (recipient.preference.company.user_id !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to remove this recipient.' }, { status: 403 });
    }

    // 6. Prevent removing the last admin recipient for security alerts
    if (recipient.is_admin && 
        recipient.preference.notification_type === 'security_alert') {
      // Check if this is the last admin recipient for security alerts
      const { count, error: countError } = await supabaseService
        .from('company_notification_recipients')
        .select('id', { count: 'exact' })
        .eq('preference_id', recipient.preference_id)
        .eq('is_admin', true);
      
      if (countError) {
        console.error('Error counting admin recipients:', countError);
        return NextResponse.json({ error: 'Failed to verify if this is the last admin recipient.' }, { status: 500 });
      }
      
      if (count === 1) {
        return NextResponse.json({ 
          error: 'Cannot remove the last admin recipient for security alerts. Add another admin recipient first.' 
        }, { status: 400 });
      }
    }

    // 7. Delete the recipient
    const { error: deleteError } = await supabaseService
      .from('company_notification_recipients')
      .delete()
      .eq('id', recipientId);

    if (deleteError) {
      console.error(`Error deleting recipient ${recipientId}:`, deleteError);
      return NextResponse.json({ error: 'Failed to delete recipient.' }, { status: 500 });
    }

    // 8. Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Recipient removed successfully' 
    });

  } catch (error) {
    console.error(`Unexpected error in DELETE /api/company/notifications/recipients/${params.id}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 