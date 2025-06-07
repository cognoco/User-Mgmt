// SendGrid email provider implementation

import { EmailProviderOptions } from '@/lib/email/types';

export async function sendViaSendGrid(
  to: string, 
  subject: string, 
  html: string, 
  options?: EmailProviderOptions
) {
  const apiKey = options?.apiKey || process.env.SENDGRID_API_KEY;
  const from = options?.from || process.env.SENDGRID_FROM || process.env.SMTP_FROM;
  
  if (!apiKey) {
    throw new Error('SendGrid API key not configured');
  }
  
  if (!from) {
    throw new Error('SendGrid sender email not configured');
  }

  try {
    // In production, this would use the SendGrid SDK
    // For now we'll do a direct API call to demonstrate the integration
    
    const url = 'https://api.sendgrid.com/v3/mail/send';
    const payload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: { email: from },
      content: [
        {
          type: 'text/html',
          value: html,
        },
      ],
      tracking_settings: {
        click_tracking: {
          enable: false, // Important: disable click tracking for auth emails
        },
      },
    };

    if (process.env.NODE_ENV === 'production') {
      // In production, make the actual API call
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`SendGrid API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      return { success: true, provider: 'sendgrid' };
    } else {
      // In development or test, just log and return success
      console.log(`[SENDGRID] To: ${to} | Subject: ${subject}`);
      console.log('[SENDGRID] Email payload:', JSON.stringify(payload, null, 2));
      return { success: true, provider: 'sendgrid', development: true };
    }
  } catch (error) {
    console.error('SendGrid email delivery failed:', error);
    throw new Error('Failed to send email via SendGrid');
  }
} 