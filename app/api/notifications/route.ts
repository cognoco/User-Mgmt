import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { z } from 'zod';
import { sendEmail } from '@/lib/email/sendEmail';
import { getCurrentUser } from '@/lib/auth/session';

// Schema for incoming notification payloads
const notificationSchema = z.object({
  type: z.enum(['email', 'push', 'sms', 'marketing', 'inApp']),
  title: z.string().min(1),
  message: z.string().min(1),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  category: z.enum(['system', 'security', 'account', 'promotional', 'updates', 'activity']).optional(),
  data: z.record(z.any()).optional(),
});

// GET endpoint to retrieve notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = req.nextUrl.searchParams.get('limit') ? 
      parseInt(req.nextUrl.searchParams.get('limit') as string) : 
      20;
    
    const page = req.nextUrl.searchParams.get('page') ? 
      parseInt(req.nextUrl.searchParams.get('page') as string) : 
      1;

    const offset = (page - 1) * limit;

    // Query notifications table using standard pattern
    const supabase = getServiceSupabase();
    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('userId', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    return NextResponse.json({ 
      notifications: data, 
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST endpoint to send a notification
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate the notification payload
    const result = notificationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid notification format', 
        details: result.error.errors 
      }, { status: 400 });
    }

    const notification = result.data;
    
    // Store the notification in the database for tracking and in-app display
    const supabase = getServiceSupabase();
    const { data: insertData, error: insertError } = await supabase
      .from('notifications')
      .insert({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        userId: notification.userId || user.id,
        category: notification.category || 'system',
        data: notification.data || {},
        isRead: false,
      })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to store notification' }, { status: 500 });
    }

    // Process the notification based on type
    let deliveryResult = null;
    
    switch (notification.type) {
      case 'email':
        // Send email notification
        deliveryResult = await processEmailNotification(notification);
        break;
        
      case 'push':
        // Send push notification
        deliveryResult = await processPushNotification(notification);
        break;
        
      case 'sms':
        // Send SMS notification
        deliveryResult = await processSMSNotification(notification);
        break;
        
      case 'inApp':
        // For in-app, just storing in the database is enough
        deliveryResult = { success: true, id: insertData.id };
        break;
        
      default:
        deliveryResult = { success: false, error: 'Unsupported notification type' };
    }

    // Update notification status based on delivery result
    if (deliveryResult && !deliveryResult.success) {
      await supabase
        .from('notifications')
        .update({ 
          status: 'failed',
          errorDetails: deliveryResult.error
        })
        .eq('id', insertData.id);
        
      return NextResponse.json({ 
        error: 'Notification delivery failed', 
        details: deliveryResult.error 
      }, { status: 500 });
    }

    // Mark as sent
    await supabase
      .from('notifications')
      .update({ status: 'sent' })
      .eq('id', insertData.id);

    return NextResponse.json({ 
      success: true, 
      id: insertData.id,
      message: 'Notification sent successfully' 
    });
    
  } catch (error) {
    console.error('Error processing notification:', error);
    return NextResponse.json({ 
      error: 'Failed to process notification',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Process email notification
async function processEmailNotification(notification: z.infer<typeof notificationSchema>) {
  try {
    if (!notification.userEmail) {
      return { success: false, error: 'User email is required for email notifications' };
    }

    const emailResult = await sendEmail({
      to: notification.userEmail,
      subject: notification.title,
      html: notification.message,
    });

    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error: 'Failed to send email notification' };
  }
}

// Process push notification
async function processPushNotification(notification: z.infer<typeof notificationSchema>) {
  try {
    if (!notification.userId) {
      return { success: false, error: 'User ID is required for push notifications' };
    }

    // Get user's push subscription
    const supabase = getServiceSupabase();
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('userId', notification.userId);

    if (error || !subscriptions || subscriptions.length === 0) {
      return { success: false, error: 'No push subscriptions found for user' };
    }

    // In a real implementation, we would send the push notification to each subscription
    // This would typically use web-push or a similar library
    // For now, we'll simulate success
    
    return { success: true };
  } catch (error) {
    console.error('Push notification error:', error);
    return { success: false, error: 'Failed to send push notification' };
  }
}

// Process SMS notification
async function processSMSNotification(notification: z.infer<typeof notificationSchema>) {
  try {
    // Check for required information
    if (!notification.userId) {
      return { success: false, error: 'User ID is required for SMS notifications' };
    }

    // In a real implementation, we would integrate with Twilio, AWS SNS, etc.
    // For now, we'll simulate success
    console.log('Simulating SMS notification:', notification.title);
    
    return { success: true };
  } catch (error) {
    console.error('SMS notification error:', error);
    return { success: false, error: 'Failed to send SMS notification' };
  }
} 