import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/session';
import { getApiNotificationService } from '@/services/notification/factory';
import {
  NotificationChannel,
  NotificationCategory
} from '@/core/notification/models';

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
    const service = getApiNotificationService();
    const batch = await service.getUserNotifications(user.id, {
      page,
      limit,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });

    return NextResponse.json({
      notifications: batch.notifications,
      pagination: {
        total: batch.total,
        page: batch.page,
        limit: batch.limit,
        pages: batch.totalPages
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
    
    const service = getApiNotificationService();
    const resultService = await service.sendNotification(
      notification.userId || user.id,
      {
        channel: notification.type as NotificationChannel,
        title: notification.title,
        message: notification.message,
        category: notification.category as NotificationCategory | undefined,
        data: notification.data
      }
    );

    if (!resultService.success) {
      return NextResponse.json(
        { error: resultService.error || 'Notification delivery failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: resultService.notificationId,
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
