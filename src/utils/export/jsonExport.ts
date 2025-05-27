/**
 * Formats an array of objects for JSON export
 *
 * @param data Array of objects to export
 * @param options Optional formatting options
 * @returns Formatted JSON string
 */
export function formatJSONForExport<T extends Record<string, any>>(
  data: T[],
  options?: {
    pretty?: boolean;
    transform?: (item: T) => any;
  }
): string {
  const { pretty = true, transform } = options || {};
  const processed = transform ? data.map(transform) : data;
  return pretty ? JSON.stringify(processed, null, 2) : JSON.stringify(processed);
}
