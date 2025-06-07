import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RepositoryUserService } from '@/services/user/repositoryUser.service';
import { MockAuthService } from '@/services/auth/__tests__/mocks/mockAuthService';
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository';

function createRepoMock(): IUserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

describe('RepositoryUserService', () => {
  let repo: IUserRepository;
  let auth: MockAuthService;
  let service: RepositoryUserService;

  beforeEach(() => {
    repo = createRepoMock();
    auth = new MockAuthService();
    service = new RepositoryUserService({ userRepository: repo, authService: auth });
  });

  it('registers user through auth and repository', async () => {
    (auth.register as any).mockResolvedValue({ success: true, user: { id: '1', email: 'a' } });
    (repo.create as any).mockResolvedValue({ id: '1', email: 'a' });

    const res = await service.register({ email: 'a', password: 'p', firstName: 'A', lastName: 'B' });

    expect(auth.register).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it('does not create profile if auth fails', async () => {
    (auth.register as any).mockResolvedValue({ success: false, error: 'fail' });

    const res = await service.register({ email: 'a', password: 'p', firstName: 'A', lastName: 'B' });

    expect(repo.create).not.toHaveBeenCalled();
    expect(res.success).toBe(false);
    expect(res.error).toBe('fail');
  });

  it('updates profile via repository', async () => {
    (repo.update as any).mockResolvedValue({ id: '1', email: 'a', firstName: 'A' });

    const res = await service.updateProfile('1', { firstName: 'A' });

    expect(repo.update).toHaveBeenCalledWith('1', { firstName: 'A' });
    expect(res).toEqual({ success: true, user: { id: '1', email: 'a', firstName: 'A' } });
  });

  it('forwards login to auth service', async () => {
    (auth.login as any).mockResolvedValue({ success: true, token: 't' });

    const res = await service.login({ email: 'e', password: 'p' });

    expect(auth.login).toHaveBeenCalledWith({ email: 'e', password: 'p' });
    expect(res).toEqual({ success: true, token: 't' });
  });
});
