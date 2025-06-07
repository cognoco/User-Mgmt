import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToast } from '@/src/hooks/notification/useToast'64;
import { toast } from 'sonner';

vi.mock('sonner', () => {
  const base = vi.fn();
  return {
    toast: Object.assign(base, {
      success: vi.fn(),
      error: vi.fn(),
    }),
  };
});

const mockedToast = toast as unknown as {
  (message: string, options?: unknown): void;
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls success toast', () => {
    const { showToast } = useToast();
    showToast('ok', 'success');
    expect(mockedToast.success).toHaveBeenCalledWith('ok', undefined);
  });

  it('calls error toast', () => {
    const { showToast } = useToast();
    showToast('fail', 'error');
    expect(mockedToast.error).toHaveBeenCalledWith('fail', undefined);
  });

  it('calls default toast', () => {
    const { showToast } = useToast();
    showToast('hello');
    expect(mockedToast).toHaveBeenCalledWith('hello', undefined);
  });
});
