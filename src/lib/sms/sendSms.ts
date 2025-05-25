// SMS provider integration for MFA and notifications
// Abstracted to support multiple SMS providers easily

interface SMSProviderOptions {
  provider?: string;
  apiKey?: string;
  from?: string;
  region?: string;
  // Additional provider-specific options can be added here
}

export async function sendSms({ 
  to, 
  message,
  options
}: { 
  to: string; 
  message: string;
  options?: SMSProviderOptions;
}) {
  const provider = options?.provider || process.env.SMS_PROVIDER || 'mock';
  
  try {
    switch (provider.toLowerCase()) {
      case 'twilio':
        return await sendViaTwilio(to, message, options);
      
      case 'aws-sns':
        return await sendViaAWS(to, message, options);
        
      case 'mock':
      default:
        return mockSend(to, message);
    }
  } catch (error) {
    console.error(`SMS delivery failed: ${error}`);
    throw new Error('Failed to send SMS verification code');
  }
}

async function sendViaTwilio(to: string, message: string, options?: SMSProviderOptions) {
  // Implementation for Twilio SMS provider
  const apiKey = options?.apiKey || process.env.TWILIO_AUTH_TOKEN;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  
  if (!accountSid || !apiKey) {
    throw new Error('Twilio credentials not configured');
  }
  
  // In a real implementation, you would use the Twilio SDK:
  // const twilio = require('twilio');
  // const client = twilio(accountSid, apiKey);
  
  console.log(`[TWILIO SMS] To: ${to} | Message: ${message}`);
  
  // Mock successful response for now
  return { success: true, provider: 'twilio' };
}

async function sendViaAWS(
  to: string,
  message: string,
  options?: SMSProviderOptions,
) {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = options?.region || process.env.AWS_REGION || 'us-east-1';

  if (!accessKey || !secretKey) {
    throw new Error('AWS credentials not configured');
  }

  // In a real implementation, you would use the AWS SDK to send the SMS
  console.log(`Using AWS region: ${region}`);
  console.log(`[AWS SNS] To: ${to} | Message: ${message}`);

  // Mock successful response for now
  return { success: true, provider: 'aws-sns' };
}

function mockSend(to: string, message: string) {
  // For development/testing purposes
  console.log(`[MOCK SMS] To: ${to} | Message: ${message}`);
  return { success: true, provider: 'mock' };
} 