import { NextResponse } from 'next/server';
import { logUserAction } from '@/lib/audit/auditLogger';
import { sendCompanyNotification } from '@/lib/notifications/sendCompanyNotification';

export async function POST(request: Request) {
  const body = await request.json();
  // Log the event to user_actions_log
  await logUserAction({
    userId: null, // System event
    action: 'SSO_PROVIDER_UPDATED',
    status: 'SUCCESS',
    targetResourceType: 'sso_provider',
    targetResourceId: body.data?.organizationId || null,
    details: body,
  });

  // Trigger admin notification for SSO event
  if (body.data?.organizationId) {
    await sendCompanyNotification({
      companyId: body.data.organizationId,
      notificationType: 'sso_event',
      subject: 'SSO Configuration Updated',
      content: `The SSO configuration for your organization has been updated. Details: ${JSON.stringify(body)}`,
      data: body
    });
  }

  return NextResponse.json({ received: true });
} 