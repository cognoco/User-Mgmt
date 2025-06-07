import crypto from 'crypto';
import { prisma } from '@/lib/database/prisma';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function saveRefreshToken(
  userId: string,
  token: string,
  parent?: string,
): Promise<void> {
  await prisma.refresh_tokens.create({
    data: {
      token: hashToken(token),
      user_id: userId,
      revoked: false,
      parent: parent ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
}

export async function rotateRefreshToken(
  userId: string,
  oldToken: string,
  newToken: string,
): Promise<void> {
  const hashedOld = hashToken(oldToken);
  await prisma.$transaction(async (tx) => {
    const existing = await tx.refresh_tokens.findFirst({
      where: { token: hashedOld, user_id: userId, revoked: false },
    });
    if (!existing) {
      throw new Error('Invalid refresh token');
    }
    await tx.refresh_tokens.update({
      where: { id: existing.id },
      data: { revoked: true, updated_at: new Date() },
    });
    await tx.refresh_tokens.create({
      data: {
        token: hashToken(newToken),
        user_id: userId,
        revoked: false,
        parent: hashedOld,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  });
}

