// Placeholder for actual auth configuration
// In a real app, this would use NextAuth or similar

export async function auth() {
  return {
    user: {
      id: 'mock-user-id',
      name: 'Mock Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
    }
  };
} 