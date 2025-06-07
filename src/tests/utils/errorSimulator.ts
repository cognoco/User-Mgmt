/** Utility to simulate errors for testing */
export function simulateError(message = 'Simulated error'): never {
  const error = new Error(message);
  // eslint-disable-next-line no-throw-literal
  throw error;
}
