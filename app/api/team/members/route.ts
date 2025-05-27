import { type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';
import { prisma } from '@/lib/database/prisma';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { z } from 'zod';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { getApiTeamService } from '@/services/team/factory';

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
  data: z.infer<typeof querySchema>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', 401);
  }

  const { page, limit, search, status, sortBy, sortOrder } = data;
  const skip = (page - 1) * limit;

  const baseWhere = {
    teamMember: {
      team: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
    },
  } as any;

  let where: any = { ...baseWhere };
  if (search) {
    where = {
      ...where,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    };
  }
  if (status !== 'all') {
    where = {
      ...where,
      teamMember: {
        ...where.teamMember,
        status,
      },
    };
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        teamMember: {
          select: { id: true, role: true, status: true, joinedAt: true },
        },
      },
      orderBy: {
        ...(sortBy === 'joinedAt' && { teamMember: { joinedAt: sortOrder } }),
        ...(sortBy === 'name' && { name: sortOrder }),
        ...(sortBy === 'email' && { email: sortOrder }),
        ...(sortBy === 'role' && { teamMember: { role: sortOrder } }),
        ...(sortBy === 'status' && { teamMember: { status: sortOrder } }),
      },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const team = await prisma.team.findFirst({
    where: {
      members: { some: { userId: session.user.id } },
    },
    select: {
      subscription: { select: { seats: true } },
      _count: { select: { members: true } },
    },
  });

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return createSuccessResponse({
    users,
    pagination: { page, limit, totalCount, totalPages, hasNextPage, hasPreviousPage },
    seatUsage: {
      used: team?._count.members ?? 0,
      total: team?.subscription?.seats ?? 0,
      percentage: team?.subscription?.seats ? (team._count.members / team.subscription.seats) * 100 : 0,
    },
  });
}

async function handleAddMember(req: NextRequest, data: z.infer<typeof addMemberSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', 401);
  }
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

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());
  return withValidation(querySchema, handleTeamMembers, req, params);
}

export const GET = createProtectedHandler(
  (req) => withErrorHandling(handler, req),
  'team.members.list'
);

async function postHandler(req: NextRequest) {
  const body = await req.json();
  return withValidation(addMemberSchema, handleAddMember, req, body);
}

export const POST = createProtectedHandler(
  (req) => withSecurity((r) => withErrorHandling(postHandler, r))(req),
  'team.members.add'
);
