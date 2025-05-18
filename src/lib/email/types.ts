// Email provider type definitions

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  options?: EmailProviderOptions;
}

export interface EmailProviderOptions {
  provider?: string;
  apiKey?: string;
  from?: string;
  replyTo?: string;
  region?: string;
  // Additional provider-specific options
}

export interface EmailProviderResponse {
  success: boolean;
  provider: string;
  messageId?: string;
  development?: boolean;
  error?: string;
} 