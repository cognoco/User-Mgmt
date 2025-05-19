export async function triggerWebhook(eventType: string, payload: any) {
  // Replace with your actual webhook endpoint(s) or use env var
  const webhookUrl = process.env.WEBHOOK_URL || 'https://your-webhook-endpoint.com/api/webhooks/sso';
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventType, data: payload }),
    });
  } catch (err) {
    // Log but do not block main flow
    console.error('Failed to trigger webhook:', err);
  }
} 