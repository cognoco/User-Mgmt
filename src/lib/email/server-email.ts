/**
 * Server-only email functionality
 * This file should only be imported on the server side
 */

import { EmailParams, EmailProviderOptions, EmailProviderResponse } from './types';

export async function sendEmailServer({ to, subject, html, options }: EmailParams): Promise<EmailProviderResponse> {
  const provider = options?.provider || process.env.EMAIL_PROVIDER || 'nodemailer';
  
  try {
    switch (provider.toLowerCase()) {
      case 'sendgrid':
        const { sendViaSendGrid } = await import('./sendViaSendGrid');
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
  const nodemailer = await import('nodemailer');
  
  const transporter = nodemailer.default.createTransport({
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
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = options?.region || process.env.AWS_REGION || 'us-east-1';
  
  if (!accessKey || !secretKey) {
    throw new Error('AWS credentials not configured');
  }
  
  console.log(`[AWS SES] To: ${to} | Subject: ${subject} | Using region: ${region}`);
  
  return { success: true, provider: 'aws-ses' };
}