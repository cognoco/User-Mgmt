export const clientConfig = {
  env: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api'),
    apiTimeout: 10000, // Set your default or use another NEXT_PUBLIC_ variable
    // Add other public config values as needed
  }
}; 