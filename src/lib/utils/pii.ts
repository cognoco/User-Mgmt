export const DEFAULT_PII_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, // email
  /(\+?\d{1,2}\s?)?(\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/, // phone
  /\b(?:\d[ -]*?){13,16}\b/, // credit card
  /\b\d{3}-\d{2}-\d{4}\b/ // SSN style
];

export function containsPII(value: string, patterns = DEFAULT_PII_PATTERNS): boolean {
  return patterns.some(re => re.test(value));
}

export function sanitizePII<T>(data: T, sensitiveFields: string[] = []): T {
  if (data == null) return data;
  if (typeof data === 'string') {
    return containsPII(data) ? ('[REDACTED]' as any) : data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizePII(item, sensitiveFields)) as any;
  }
  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (sensitiveFields.includes(key) || (typeof value === 'string' && containsPII(value))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizePII(value, sensitiveFields);
      }
    }
    return sanitized as T;
  }
  return data;
}
