import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';

const domainSchema = z.object({
  domain: z.string().min(1),
  isVerified: z.boolean().optional(),
});


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const domains = await prisma.domain.findMany({
      where: { organizationId: orgId }
    });
    return NextResponse.json(domains);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const body = await request.json();
    const validatedData = domainSchema.parse(body);

    const existingDomain = await prisma.domain.findFirst({
      where: { 
        domain: validatedData.domain,
        organizationId: orgId 
      }
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain already exists' },
        { status: 400 }
      );
    }

    const domain = await prisma.domain.create({
      data: {
        ...validatedData,
        organizationId: orgId
      }
    });

    return NextResponse.json(domain);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }
    console.error('Error adding domain:', error);
    return NextResponse.json(
      { error: 'Failed to add domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { domain } = await request.json();
    
    const existingDomain = await prisma.domain.findFirst({
      where: { 
        domain,
        organizationId: orgId 
      }
    });

    if (!existingDomain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    await prisma.domain.delete({
      where: { id: existingDomain.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    );
  }
} 