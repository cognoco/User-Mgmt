/**
 * API Authentication Middleware
 * 
 * This file provides authentication middleware for API routes that validates
 * bearer tokens, checks permissions, and creates authentication context.
 */

import { NextRequest } from 'next/server';
import type { AuthContext } from '@/core/config/interfaces';
import type { AuthService } from '@/core/auth/interfaces';
import type { PermissionService } from '@/core/permission/interfaces';
import { ApiError, ERROR_CODES } from '@/src/lib/api/common'443;

/**
 * Configuration for authentication middleware
 */
export interface AuthMiddlewareConfig {
  /**
   * Auth service to use for token validation
   */
  authService: AuthService;
  
  /**
   * Permission service for checking user permissions
   */
  permissionService?: PermissionService;
  
  /**
   * Whether authentication is required for this endpoint
   */
  requireAuth: boolean;
  
  /**
   * Specific permissions required to access this endpoint
   */
  requiredPermissions?: string[];
  
  /**
   * Whether to include full user object in auth context
   */
  includeUser?: boolean;
  
  /**
   * Whether to include user permissions in auth context
   */
  includePermissions?: boolean;
}

/**
 * Extract bearer token from request headers or cookies
 */
function extractBearerToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try cookie as fallback
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

/**
 * Create authentication middleware with the given configuration
 */
export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  return async (request: NextRequest): Promise<AuthContext> => {
    const token = extractBearerToken(request);
    
    // Handle case where no token is provided
    if (!token) {
      if (config.requireAuth) {
        throw new ApiError(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication required',
          401
        );
      }
      
      // Return unauthenticated context for public endpoints
      return {
        isAuthenticated: false,
        userId: undefined,
        user: undefined,
        permissions: undefined,
        token: undefined,
      };
    }
    
    try {
      // Validate token and get user
      const user = await config.authService.getCurrentUser();
      
      if (!user) {
        if (config.requireAuth) {
          throw new ApiError(
            ERROR_CODES.UNAUTHORIZED,
            'Invalid or expired token',
            401
          );
        }
        
        return {
          isAuthenticated: false,
          userId: undefined,
          user: undefined,
          permissions: undefined,
          token,
        };
      }
      
      // Create base auth context
      const authContext: AuthContext = {
        isAuthenticated: true,
        userId: user.id,
        token,
        user: config.includeUser ? user : undefined,
        permissions: undefined,
      };
      
      // Include permissions if requested
      if (config.includePermissions && config.permissionService) {
        try {
          // TODO: Implement permission loading when PermissionService is available
          // const permissions = await config.permissionService.getUserPermissions(user.id);
          // authContext.permissions = permissions;
        } catch (error) {
          console.warn('Failed to load user permissions:', error);
        }
      }
      
      // Check required permissions
      if (config.requiredPermissions?.length) {
        if (!authContext.permissions) {
          throw new ApiError(
            ERROR_CODES.FORBIDDEN,
            'Insufficient permissions',
            403
          );
        }
        
        const hasAllPermissions = config.requiredPermissions.every(
          permission => authContext.permissions?.includes(permission)
        );
        
        if (!hasAllPermissions) {
          throw new ApiError(
            ERROR_CODES.FORBIDDEN,
            'Insufficient permissions',
            403
          );
        }
      }
      
      return authContext;
      
    } catch (error) {
      // Re-throw API errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle auth service errors
      console.error('Auth service error:', error);
      
      if (config.requireAuth) {
        throw new ApiError(
          ERROR_CODES.UNAUTHORIZED,
          'Authentication failed',
          401
        );
      }
      
      // Return unauthenticated context for public endpoints
      return {
        isAuthenticated: false,
        userId: undefined,
        user: undefined,
        permissions: undefined,
        token,
      };
    }
  };
}
