import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/database/prisma';
import { z } from 'zod';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { getApiTeamService } from '@/services/team/factory';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware
} from '@/middleware/createMiddlewareChain';
import type { RouteAuthContext } from '@/middleware/auth';
import { Permission } from '@/lib/rbac/roles';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'pending', 'all']).optional().default('all'),
  sortBy: z.enum(['name', 'email', 'role', 'status', 'joinedAt']).optional().default('joinedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const addMemberSchema = z.object({
  teamId: z.string(),
  userId: z.string(),
  role: z.string()
});

async function handleTeamMembers(
  req: NextRequest,
  auth: RouteAuthContext,
  data?: z.infer<typeof querySchema>
) {
  let params;
  
  if (data) {
    // New approach: validated data is passed from middleware
    params = data;
  } else {
    // Legacy approach: parse and validate query params manually
    const query = Object.fromEntries(new URL(req.url).searchParams.entries());
    params = querySchema.parse(query);
  }
  
  const { page, limit, search, status, sortBy, sortOrder } = params;
  const skip = (page - 1) * limit;

  // Get the team ID first to ensure we're looking at the correct team
  const userTeam = await prisma.teamMember.findFirst({
    where: { userId: auth.userId! },
    select: { teamId: true },
  });

  if (!userTeam) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Team not found', 404);
  }

  try {
    // Single query for team data, including subscription info and count
    const teamWithData = await prisma.team.findUnique({
      where: { id: userTeam.teamId },
      select: {
        subscription: { select: { seats: true } },
        _count: { select: { members: true } },
      },
    });

    // Build query conditions for team members
    const whereCondition: any = {
      teamId: userTeam.teamId,
    };

    if (status !== 'all') {
      whereCondition.status = status;
    }

    if (search) {
      whereCondition.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Use a transaction to ensure count and data are consistent
    const [members, totalCount] = await prisma.$transaction([
      prisma.teamMember.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          ...(sortBy === 'joinedAt' && { joinedAt: sortOrder }),
          ...(sortBy === 'role' && { role: sortOrder }),
          ...(sortBy === 'status' && { status: sortOrder }),
          ...(sortBy === 'name' && { user: { name: sortOrder } }),
          ...(sortBy === 'email' && { user: { email: sortOrder } }),
        },
        skip,
        take: limit,
      }),
      prisma.teamMember.count({ where: whereCondition }),
    ]);

    // Transform data to match expected format
    const users = members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      teamMember: {
        id: member.id,
        role: member.role,
        status: member.status,
        joinedAt: member.joinedAt,
      },
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return createSuccessResponse({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      seatUsage: {
        used: teamWithData?._count.members ?? 0,
        total: teamWithData?.subscription?.seats ?? 0,
        percentage: teamWithData?.subscription?.seats
          ? (teamWithData._count.members / teamWithData.subscription.seats) * 100
          : 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new ApiError(ERROR_CODES.TIMEOUT, 'Database query timeout', 504);
    }
    throw error;
  }
}

async function handleAddMember(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof addMemberSchema>
) {
  const license = await prisma.teamLicense.findUnique({
    where: { id: data.teamId },
    select: { usedSeats: true, totalSeats: true },
  });

  if (license && license.usedSeats >= license.totalSeats) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      "You have reached your plan's seat limit. Please upgrade your plan or remove an existing member.",
      400,
    );
  }
  const service = getApiTeamService();
  const result = await service.addTeamMember(data.teamId, data.userId, data.role);
  if (!result.success || !result.member) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Failed');
  }
  return createSuccessResponse(result.member, 201);
}

const getMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: [Permission.VIEW_TEAM_MEMBERS] })
]);

const postMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: [Permission.INVITE_TEAM_MEMBER] }),
  validationMiddleware(addMemberSchema)
]);

export const GET = getMiddleware(handleTeamMembers);
export const POST = postMiddleware(handleAddMember);
