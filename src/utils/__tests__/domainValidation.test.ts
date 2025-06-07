import { describe, test, expect, vi } from 'vitest';
import { validateDomain, generateVerificationToken, validateTxtRecord } from '@/src/utils/domainValidation';

describe('Domain Validation', () => {
  describe('validateDomain', () => {
    test('should accept valid domain formats', () => {
      const validDomains = [
        'example.com',
        'subdomain.example.com',
        'sub.sub.example.co.uk',
        'example-domain.com',
        'example.io',
        'domain.app'
      ];
      
      validDomains.forEach(domain => {
        expect(validateDomain(domain)).toBe(true);
      });
    });
    
    test('should reject invalid domain formats', () => {
      const invalidDomains = [
        'invalid domain.com', // contains space
        'domain!.com', // invalid character
        'http://example.com', // contains protocol
        'example.com/', // contains path
        'domain.com?query=1', // contains query
        'domain', // no TLD
        '.com', // no domain name
        'domain..com', // consecutive dots
        '-domain.com', // starts with hyphen
        'domain-.com', // ends with hyphen
        'domain.com-', // TLD starts with hyphen
        'domain.123', // numeric TLD
        'verylongdomainnameverylongdomainnameverylongdomainnameverylongdomainnameverylongdomainnameverylongdomainnamedomainname.com' // too long
      ];
      
      invalidDomains.forEach(domain => {
        expect(validateDomain(domain)).toBe(false);
      });
    });
  });
  
  describe('generateVerificationToken', () => {
    test('should generate a unique token', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(16); // Ensure reasonable length
    });
    
    test('should include prefix if provided', () => {
      const prefix = 'verify';
      const token = generateVerificationToken(prefix);
      
      expect(token.startsWith(`${prefix}-`)).toBe(true);
    });
  });
  
  describe('validateTxtRecord', () => {
    test('should return true when verification token matches', async () => {
      const domain = 'example.com';
      const verificationToken = 'verify-token-123';
      
      // Mock the DNS resolver function
      const mockResolveTxt = vi.fn().mockResolvedValue([
        ['verify-token-123'], // First TXT record matches
        ['other-txt-record']
      ]);
      
      const result = await validateTxtRecord(domain, verificationToken, mockResolveTxt);
      
      expect(result).toBe(true);
      expect(mockResolveTxt).toHaveBeenCalledWith(domain);
    });
    
    test('should return true when verification token is found among multiple records', async () => {
      const domain = 'example.com';
      const verificationToken = 'verify-token-123';
      
      // Mock the DNS resolver function
      const mockResolveTxt = vi.fn().mockResolvedValue([
        ['other-txt-record-1'],
        ['verify-token-123', 'other-value'], // Token in array with other values
        ['other-txt-record-2']
      ]);
      
      const result = await validateTxtRecord(domain, verificationToken, mockResolveTxt);
      
      expect(result).toBe(true);
      expect(mockResolveTxt).toHaveBeenCalledWith(domain);
    });
    
    test('should return false when verification token is not found', async () => {
      const domain = 'example.com';
      const verificationToken = 'verify-token-123';
      
      // Mock the DNS resolver function
      const mockResolveTxt = vi.fn().mockResolvedValue([
        ['other-txt-record-1'],
        ['different-token']
      ]);
      
      const result = await validateTxtRecord(domain, verificationToken, mockResolveTxt);
      
      expect(result).toBe(false);
      expect(mockResolveTxt).toHaveBeenCalledWith(domain);
    });
    
    test('should handle DNS errors gracefully', async () => {
      const domain = 'example.com';
      const verificationToken = 'verify-token-123';
      
      // Mock the DNS resolver function to throw error
      const mockResolveTxt = vi.fn().mockRejectedValue(new Error('DNS resolution failed'));
      
      const result = await validateTxtRecord(domain, verificationToken, mockResolveTxt);
      
      expect(result).toBe(false);
      expect(mockResolveTxt).toHaveBeenCalledWith(domain);
    });
    
    test('should handle case where no TXT records exist', async () => {
      const domain = 'example.com';
      const verificationToken = 'verify-token-123';
      
      // Mock the DNS resolver function to return empty array
      const mockResolveTxt = vi.fn().mockResolvedValue([]);
      
      const result = await validateTxtRecord(domain, verificationToken, mockResolveTxt);
      
      expect(result).toBe(false);
      expect(mockResolveTxt).toHaveBeenCalledWith(domain);
    });
  });
}); 