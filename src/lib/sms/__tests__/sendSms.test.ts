import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendSms } from '../sendSms';

// Helper to reset env vars
function resetEnv() {
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.AWS_ACCESS_KEY_ID;
  delete process.env.AWS_SECRET_ACCESS_KEY;
  delete process.env.AWS_REGION;
}

describe('sendSms', () => {
  beforeEach(() => {
    resetEnv();
  });

  it('uses mock provider by default', async () => {
    const res = await sendSms({ to: '+1', message: 'hi' });
    expect(res).toEqual({ success: true, provider: 'mock' });
  });

  it('sends via Twilio when credentials provided', async () => {
    process.env.TWILIO_AUTH_TOKEN = 'token';
    process.env.TWILIO_ACCOUNT_SID = 'sid';
    const res = await sendSms({ to: '+1', message: 'hello', options: { provider: 'twilio' } });
    expect(res).toEqual({ success: true, provider: 'twilio' });
  });

  it('throws when Twilio credentials missing', async () => {
    await expect(
      sendSms({ to: '+1', message: 'fail', options: { provider: 'twilio' } })
    ).rejects.toThrow('Twilio credentials not configured');
  });

  it('sends via AWS when credentials provided', async () => {
    process.env.AWS_ACCESS_KEY_ID = 'id';
    process.env.AWS_SECRET_ACCESS_KEY = 'secret';
    const res = await sendSms({ to: '+1', message: 'hi', options: { provider: 'aws-sns', region: 'us-east-1' } });
    expect(res).toEqual({ success: true, provider: 'aws-sns' });
  });
});
