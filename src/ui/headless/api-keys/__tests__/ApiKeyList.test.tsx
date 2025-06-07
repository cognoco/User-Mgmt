// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ApiKeyList } from '@/src/ui/headless/api-keys/ApiKeyList';

describe('ApiKeyList', () => {
  it('renders api keys', () => {
    const { getByText } = render(
      <ApiKeyList
        apiKeys={[{ id: '1', name: 'Key', keyPrefix: 'pref', permissions: [], createdAt: new Date(), isActive: true }]}
        loading={false}
        error={null}
        onRevoke={vi.fn()}
        onRegenerate={vi.fn()}
        renderItem={(key) => <div>{key.name}</div>}
      />
    );
    expect(getByText('Key')).toBeInTheDocument();
  });
});
