import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nodemailer from 'nodemailer';
import { sendEmail } from '@/lib/email/sendEmail';

vi.mock('nodemailer');

const mockSendMail = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (nodemailer.createTransport as any).mockReturnValue({ sendMail: mockSendMail });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('sendEmail', () => {
  const emailParams = {
    to: 'test@example.com',
    subject: 'Test Subject',
    html: '<p>Hello</p>',
  };

  it('should call nodemailer.createTransport with correct config and sendMail with correct params', async () => {
    mockSendMail.mockResolvedValueOnce({ messageId: '123' });
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASSWORD = 'pass';
    process.env.SMTP_FROM = 'from@example.com';

    await sendEmail(emailParams);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user',
        pass: 'pass',
      },
    });
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'from@example.com',
      to: emailParams.to,
      subject: emailParams.subject,
      html: emailParams.html,
    });
  });

  it('should throw if sendMail fails', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('Send failed'));
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASSWORD = 'pass';
    process.env.SMTP_FROM = 'from@example.com';

    await expect(sendEmail(emailParams)).rejects.toThrow('Send failed');
  });
}); 