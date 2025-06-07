import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { getStorageService } from '@/services/storage';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const storage = getStorageService();
  const files = await storage.listFiles('files', `${user.id}/`);
  return NextResponse.json({ files });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { filePath } = await req.json();
  const storage = getStorageService();
  await storage.deleteFile('files', filePath);
  return NextResponse.json({ success: true });
}
