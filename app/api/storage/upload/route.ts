import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth/utils';
import { getStorageService } from '@/services/storage';

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const uploaded = formData.get('file');
    if (!(uploaded instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await uploaded.arrayBuffer();
    const storage = getStorageService();
    const path = `${user.id}/${Date.now()}-${uploaded.name}`;
    const result = await storage.uploadFile('files', path, buffer, {
      contentType: uploaded.type,
    });

    if (!result.success || !result.path) {
      return NextResponse.json({ error: result.error || 'Upload failed' }, { status: 500 });
    }

    const url = await storage.getFileUrl('files', result.path);

    return NextResponse.json({ success: true, path: result.path, url });
  } catch (err) {
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
