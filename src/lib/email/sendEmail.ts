import nodemailer from 'nodemailer';
import { EmailParams, EmailProviderOptions, EmailProviderResponse } from '@/src/lib/email/types'38;
import { sendViaSendGrid } from '@/src/lib/email/sendViaSendGrid'123;

export async function sendEmail({ to, subject, html, options }: EmailParams): Promise<EmailProviderResponse> {
  const provider = options?.provider || process.env.EMAIL_PROVIDER || 'nodemailer';
  
  try {
    switch (provider.toLowerCase()) {
      case 'sendgrid':
        return await sendViaSendGrid(to, subject, html, options);
        
      case 'aws-ses':
        return await sendViaAWS(to, subject, html, options);
        
      case 'nodemailer':
      default:
        return await sendViaNodemailer(to, subject, html, options);
    }
  } catch (error) {
    console.error(`Email delivery failed: ${error}`);
    throw new Error('Failed to send email');
  }
}

async function sendViaNodemailer(
  to: string, 
  subject: string, 
  html: string, 
  options?: EmailProviderOptions
): Promise<EmailProviderResponse> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const result = await transporter.sendMail({
    from: options?.from || process.env.SMTP_FROM,
    to,
    subject,
    html,
    ...(options?.replyTo ? { replyTo: options.replyTo } : {}),
  });
  
  return { 
    success: true, 
    provider: 'nodemailer',
    messageId: result.messageId
  };
}

async function sendViaAWS(
  to: string, 
  subject: string, 
  html: string, 
  options?: EmailProviderOptions
): Promise<EmailProviderResponse> {
  // AWS SES implementation
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = options?.region || process.env.AWS_REGION || 'us-east-1';
  
  if (!accessKey || !secretKey) {
    throw new Error('AWS credentials not configured');
  }
  
  // In a real implementation, you would use the AWS SDK:
  // const AWS = require('aws-sdk');
  // const ses = new AWS.SES({ region });
  
  console.log(`[AWS SES] To: ${to} | Subject: ${subject} | Using region: ${region}`);
  
  // Mock successful response for now
  return { success: true, provider: 'aws-ses' };
} 