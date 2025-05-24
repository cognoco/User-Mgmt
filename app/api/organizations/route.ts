import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiOrganizationService } from '@/services/organization/factory';

const CreateOrgSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const service = getApiOrganizationService();
  const orgs = await service.getUserOrganizations(userId);
  return NextResponse.json({ organizations: orgs });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const parsed = CreateOrgSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const result = await getApiOrganizationService().createOrganization(userId, parsed.data);
  if (!result.success || !result.organization) {
    return NextResponse.json({ error: result.error || 'Failed to create organization' }, { status: 400 });
  }
  return NextResponse.json({ organization: result.organization }, { status: 201 });
}
