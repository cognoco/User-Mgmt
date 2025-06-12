import { vi } from 'vitest';

class PrismaClientStub {
  constructor() {
    this.teamMember = {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    };
  }

  $connect = vi.fn();
  $disconnect = vi.fn();

  // Add other model stubs as needed
  teamMember: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
}

export { PrismaClientStub as PrismaClient }; 