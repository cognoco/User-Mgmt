// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ApiKeyList } from '../ApiKeyList';
import { useApiKeys } from '@/hooks/api-keys/use-api-keys';

vi.mock('@/hooks/api-keys/use-api-keys', () => ({ useApiKeys: vi.fn() }));

describe('ApiKeyList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useApiKeys as unknown as vi.Mock).mockReturnValue({
      apiKeys: [{ id: '1', name: 'Key', keyPrefix: 'pref', permissions: [], createdAt: new Date(), isActive: true }],
      isLoading: false,
      error: null,
      revokeApiKey: vi.fn(),
      regenerateApiKey: vi.fn(),
      fetchApiKeys: vi.fn()
    });
  });

  it('provides api keys to children', () => {
    let props: any;
    render(
      <ApiKeyList>
        {(p) => {
          props = p;
          return <div />;
        }}
      </ApiKeyList>
    );
    expect(props.apiKeys.length).toBe(1);
  });
});
