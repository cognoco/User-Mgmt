import { prisma } from '@/lib/database/prisma';
import { auth } from '@/lib/auth/authConfig';

/**
 * Retrieves the authenticated user from the session
 * 
 * @returns The authenticated user or null if not authenticated
 */
export async function getUser() {
  // For E2E tests and development, return a mock user
  if (process.env.NODE_ENV === 'development' || process.env.E2E_TEST === 'true') {
    console.log('[DEV/TEST] Returning mock user');
    return {
      id: 'mock-user-id',
      name: 'Mock Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return null;
    }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
} 