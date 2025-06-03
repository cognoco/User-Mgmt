// Create file: lib/auth/unified-auth.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthContext } from './types';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiPermissionService } from '@/services/permission/factory';

export type AuthHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse> | NextResponse;

export const createAuthMiddleware = (options?: {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  includeUser?: boolean;
}) => {
  return (handler: AuthHandler) => {
    return async (req: NextRequest) => {
      const supabase = getServiceSupabase();
      const authHeader = req.headers.get('authorization');
      let token: string | null = null;
      
      // Try auth header first
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      
      // Fall back to cookies if no token in header
      if (!token) {
        // Get token from cookies
        token = req.cookies.get('auth-token')?.value || null;
      }
      
      // Default auth context - unauthenticated
      let context: AuthContext = {
        userId: '',
        permissions: [],
        authenticated: false
      };
      
      if (token) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          
          if (error || !data.user) {
            throw error || new Error('User not found');
          }
          
          const userId = data.user.id;
          context = {
            userId,
            authenticated: true,
            permissions: []
          };
          
          // Include full user object if requested
          if (options?.includeUser) {
            context.user = {
              id: userId,
              email: data.user.email || '',
              role: data.user.app_metadata?.role || data.user.user_metadata?.role,
              metadata: {
                ...data.user.app_metadata,
                ...data.user.user_metadata
              }
            };
          }
          
          // Load permissions if required
          if (options?.requiredPermissions?.length) {
            const permissionService = getApiPermissionService();
            const userPermissions = await permissionService.getUserPermissions(userId);
            context.permissions = userPermissions;
            
            // Check if user has all required permissions
            const hasAllPermissions = options.requiredPermissions.every(
              permission => userPermissions.includes(permission)
            );
            
            if (!hasAllPermissions) {
              return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
          }
        } catch (error) {
          console.error('Auth error:', error);
          
          if (options?.requireAuth !== false) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
          }
        }
      } else if (options?.requireAuth !== false) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      return handler(req, context);
    };
  };
};
