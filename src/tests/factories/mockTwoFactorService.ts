import { vi } from "vitest";
export const createMockTwoFactorService = () => ({
  startWebAuthnRegistration: vi.fn().mockResolvedValue({ success: true, challenge: 'challenge123' }),
  verifyWebAuthnRegistration: vi.fn().mockResolvedValue({ success: true }),
  setupTOTP: vi.fn().mockResolvedValue({ secret: 'secret123', qrCode: 'qr-data' }),
  verifyTOTP: vi.fn().mockResolvedValue({ success: true }),
  generateBackupCodes: vi.fn().mockResolvedValue(['code1', 'code2']),
  disableMFA: vi.fn().mockResolvedValue({ success: true }),
});

