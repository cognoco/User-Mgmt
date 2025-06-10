// Create file: lib/auth/types.ts
export interface AuthContext {
  userId: string;
  user?: {
    id: string;
    email: string;
    role?: string;
    metadata?: Record<string, any>;
  };
  permissions: string[];
  authenticated: boolean;
  tokenExpiry?: Date;
}
