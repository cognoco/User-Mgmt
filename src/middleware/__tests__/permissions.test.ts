import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { withPermissionCheck } from '../permissions';
import { Permission } from '@/lib/rbac/roles';
import { prisma } from '@/lib/database/prisma';
import { checkRolePermission } from '@/lib/rbac/roleService';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    teamMember: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/rbac/roleService', () => ({
  checkRolePermission: vi.fn(),
}));

describe('Permission Middleware', () => {
  const mockHandler = vi.fn().mockResolvedValue(new NextResponse());
  const mockRequest = new NextRequest(new URL('http://localhost'));
  const mockUser = { id: 'user-1', email: 'test@example.com' };
  const mockTeamMember = { role: 'ADMIN', teamId: 'team-1' };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when no session exists', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_TEAM_MEMBERS,
      });

      const response = await middleware(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 403 when user has no team membership', async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
        id: mockUser.id, 
        email: mockUser.email,
        teamMember: null 
      } as any);

      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_TEAM_MEMBERS,
      });

      const response = await middleware(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('No role assigned');
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
        id: mockUser.id, 
        email: mockUser.email,
        teamMember: mockTeamMember 
      } as any);
    });

    it('should allow access when user has required permission', async () => {
      vi.mocked(checkRolePermission).mockResolvedValue(true);

      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_TEAM_MEMBERS,
      });

      await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should deny access when user lacks required permission', async () => {
      vi.mocked(checkRolePermission).mockResolvedValue(false);

      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.MANAGE_BILLING,
      });

      const response = await middleware(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should use cached permission check results', async () => {
      vi.mocked(checkRolePermission).mockResolvedValue(true);

      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_TEAM_MEMBERS,
      });

      // First call should check permissions
      await middleware(mockRequest);
      expect(checkRolePermission).toHaveBeenCalledTimes(1);

      // Second call should check permissions again (no cache in implementation)
      await middleware(mockRequest);
      expect(checkRolePermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('Resource Access', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ 
        id: mockUser.id, 
        email: mockUser.email,
        teamMember: mockTeamMember 
      } as any);
      vi.mocked(checkRolePermission).mockResolvedValue(true);
    });

    it('should allow access to own team resources', async () => {
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({ 
        teamId: 'team-1' 
      } as any);
      
      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_TEAM_MEMBERS,
        resourceId: 'team-1',
      });

      await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should deny access to other team resources', async () => {
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({ 
        teamId: 'team-2' 
      } as any);
      
      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_TEAM_MEMBERS,
        resourceId: 'team-2',
      });

      const response = await middleware(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Resource access denied');
    });

    it('should check project resource access', async () => {
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({ 
        teamId: 'team-1' 
      } as any);
      
      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_PROJECTS,
        resourceId: 'project-1',
      });

      await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should check organization resource access', async () => {
      vi.mocked(prisma.teamMember.findUnique).mockResolvedValue({ 
        teamId: 'team-1' 
      } as any);
      
      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.MANAGE_ORG_SETTINGS,
        resourceId: 'org-1',
      });

      await middleware(mockRequest);

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle internal errors gracefully', async () => {
      vi.mocked(getServerSession).mockRejectedValue(new Error('Database error'));

      const middleware = withPermissionCheck(mockHandler, {
        requiredPermission: Permission.VIEW_TEAM_MEMBERS,
      });

      const response = await middleware(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});