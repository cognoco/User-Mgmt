import crypto from 'crypto';

/**
 * Generates a new API key with a prefix
 * @returns Object containing the generated key, hashed key, and prefix
 */
export function generateApiKey(): { key: string; hashedKey: string; prefix: string } {
  // Create a random prefix (first 8 characters of the key)
  const prefix = crypto.randomBytes(4).toString('hex');
  
  // Generate the rest of the key (32 bytes = 64 hex characters)
  const keyBody = crypto.randomBytes(32).toString('hex');
  
  // Full key is prefix + delimiter + keyBody
  const key = `${prefix}_${keyBody}`;
  
  // Hash the key for storage
  const hashedKey = hashApiKey(key);
  
  return { key, hashedKey, prefix };
}

/**
 * Hashes an API key for secure storage
 * @param key The API key to hash
 * @returns Hashed version of the key
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Verifies if a provided API key matches the stored hash
 * @param providedKey The key provided in the request
 * @param storedHash The hash stored in the database
 * @returns Boolean indicating if the key is valid
 */
export function verifyApiKey(providedKey: string, storedHash: string): boolean {
  const hashedProvidedKey = hashApiKey(providedKey);
  return crypto.timingSafeEqual(
    Buffer.from(hashedProvidedKey, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
}

/**
 * Extracts the prefix from an API key
 * @param key The API key
 * @returns The prefix portion of the key
 */
export function getKeyPrefix(key: string): string {
  return key.split('_')[0];
} 