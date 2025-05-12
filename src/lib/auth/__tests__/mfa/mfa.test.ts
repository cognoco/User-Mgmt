import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupMFA, verifyMFAToken, disableMFA } from '@/lib/auth/mfa';
import { prisma } from '@/lib/database/prisma';

vi.mock('@/lib/prisma');

describe('Multi-Factor Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setupMFA', () => {
    it('should generate secret and QR code for new MFA setup', async () => {
      const userId = 'test-user-id';
      const result = await setupMFA(userId);
      
      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result.secret).toBeTruthy();
      expect(result.qrCode).toBeTruthy();
    });

    it('should store MFA secret in database', async () => {
      const userId = 'test-user-id';
      await setupMFA(userId);
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { mfaEnabled: true, mfaSecret: expect.any(String) }
      });
    });
  });

  describe('verifyMFAToken', () => {
    it('should verify valid MFA token', async () => {
      const userId = 'test-user-id';
      const token = '123456';
      
      (prisma.user.findUnique as any).mockResolvedValue({
        id: userId,
        mfaSecret: 'test-secret',
        mfaEnabled: true
      });

      const result = await verifyMFAToken(userId, token);
      expect(result).toBe(true);
    });

    it('should reject invalid MFA token', async () => {
      const userId = 'test-user-id';
      const token = 'invalid';
      
      (prisma.user.findUnique as any).mockResolvedValue({
        id: userId,
        mfaSecret: 'test-secret',
        mfaEnabled: true
      });

      const result = await verifyMFAToken(userId, token);
      expect(result).toBe(false);
    });
  });

  describe('disableMFA', () => {
    it('should disable MFA for user', async () => {
      const userId = 'test-user-id';
      await disableMFA(userId);
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { mfaEnabled: false, mfaSecret: null }
      });
    });
  });
}); 