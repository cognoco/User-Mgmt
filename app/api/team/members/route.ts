import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/index';
import { prisma } from '@/lib/database/prisma';
import { createProtectedHandler } from '@/middleware/permissions';
import { z } from 'zod';

// Query parameters schema
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['active', 'pending', 'all']).optional().default('all'),
  sortBy: z.enum(['name', 'email', 'role', 'status', 'joinedAt']).optional().default('joinedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

async function handler(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate query parameters
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const { page, limit, search, status, sortBy, sortOrder } = querySchema.parse(queryParams);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build base where clause
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
    };

    // Add conditional filters
    let whereConditions: any = { ...baseWhere }; // Start with base, use any for flexibility

    if (search) {
      whereConditions = {
        ...whereConditions,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (status !== 'all') {
      whereConditions = {
        ...whereConditions,
        teamMember: {
          ...whereConditions.teamMember, // Ensure teamMember exists
          status: status,
        },
      };
    }

    // Execute queries in parallel
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions, // Use the fully constructed conditions
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          teamMember: {
            select: {
              id: true,
              role: true,
              status: true,
              joinedAt: true,
            },
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
      prisma.user.count({ where: whereConditions }), // Use the same conditions for count
    ]);

    // Get team subscription info for seat usage
    const team = await prisma.team.findFirst({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        subscription: {
          select: {
            seats: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return new NextResponse(
      JSON.stringify({
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        seatUsage: {
          used: team?._count.members ?? 0,
          total: team?.subscription?.seats ?? 0,
          percentage: team?.subscription?.seats
            ? (team._count.members / team.subscription.seats) * 100
            : 0,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching team members:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid query parameters', details: error.errors }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Protect the endpoint with the required permission
export const GET = createProtectedHandler(handler, 'team.members.list');