/**
 * Domain Validation Utilities
 * 
 * This module provides utilities for validating domains and generating
 * verification tokens for domain ownership verification.
 */

/**
 * Validates if a domain string is in correct format
 * 
 * @param domain - The domain string to validate
 * @returns true if domain is valid, false otherwise
 */
export function validateDomain(domain: string): boolean {
  // Basic domain validation regex
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  // Check if domain matches basic format
  if (!domainRegex.test(domain)) {
    return false;
  }
  
  // Check length constraints
  if (domain.length > 253) {
    return false;
  }
  
  // Check for consecutive dots
  if (domain.includes('..')) {
    return false;
  }
  
  // Check for invalid characters (spaces, protocols, paths, queries)
  if (domain.includes(' ') || 
      domain.includes('http') || 
      domain.includes('/') || 
      domain.includes('?') ||
      domain.includes('!')) {
    return false;
  }
  
  // Check if starts or ends with hyphen
  const parts = domain.split('.');
  for (const part of parts) {
    if (part.startsWith('-') || part.endsWith('-')) {
      return false;
    }
  }
  
  // Check for numeric TLD
  const tld = parts[parts.length - 1];
  if (/^\d+$/.test(tld)) {
    return false;
  }
  
  return true;
}

/**
 * Generates a unique verification token for domain ownership verification
 * 
 * @param prefix - Optional prefix for the token
 * @returns A unique verification token string
 */
export function generateVerificationToken(prefix?: string): string {
  const randomPart = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  
  const token = `${randomPart}-${timestamp}`;
  
  return prefix ? `${prefix}-${token}` : token;
}

/**
 * Validates a TXT record for domain verification
 * 
 * @param domain - The domain to check
 * @param verificationToken - The expected verification token
 * @param resolveTxt - DNS resolver function (for testing injection)
 * @returns Promise that resolves to true if verification token is found
 */
export async function validateTxtRecord(
  domain: string, 
  verificationToken: string, 
  resolveTxt?: (domain: string) => Promise<string[][]>
): Promise<boolean> {
  try {
    let txtRecords: string[][];
    
    if (resolveTxt) {
      // Use injected resolver (for testing)
      txtRecords = await resolveTxt(domain);
    } else {
      // Use Node.js DNS module in production
      const dns = await import('dns');
      const { promisify } = await import('util');
      const resolveTxtAsync = promisify(dns.resolveTxt);
      txtRecords = await resolveTxtAsync(domain);
    }
    
    // Check if any TXT record contains the verification token
    for (const record of txtRecords) {
      if (record.includes(verificationToken)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // DNS resolution failed or other error
    console.error('TXT record validation failed:', error);
    return false;
  }
}