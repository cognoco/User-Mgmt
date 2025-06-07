import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, waitFor } from '@testing-library/react';
import { TeamCreator } from '@/src/ui/headless/team/TeamCreator';
import { useTeams } from '@/hooks/team/useTeams';
import { useAuth } from '@/hooks/auth/useAuth';

vi.mock('@/hooks/team/useTeams');
vi.mock('@/hooks/auth/useAuth');

let lastProps: any;
const renderWithProps = () => {
  render(
    <TeamCreator
      render={(p) => {
        lastProps = p;
        return <div />;
      }}
    />
  );
  return () => lastProps;
};

describe('TeamCreator', () => {
  const createTeam = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    createTeam.mockResolvedValue({ success: true, team: { id: 't1', name: 'My Team' } });
    (useTeams as unknown as vi.Mock).mockReturnValue({
      createTeam,
      isLoading: false,
      error: null,
      successMessage: null,
    });
    (useAuth as unknown as vi.Mock).mockReturnValue({ user: { id: 'u1' } });
  });

  it('calls createTeam with user id when submitted', async () => {
    const getProps = renderWithProps();

    await act(async () => {
      getProps().setNameValue('My Team');
    });

    await act(async () => {
      await getProps().handleSubmit({ preventDefault() {} } as any);
    });

    await waitFor(() => {
      expect(createTeam).toHaveBeenCalledTimes(1);
    });
    expect(createTeam.mock.calls[0][0]).toBe('u1');
    expect(createTeam.mock.calls[0][1]).toEqual({
      name: 'My Team',
      description: undefined,
      isPublic: false,
    });
  });

  it('uses custom onSubmit when provided', async () => {
    const onSubmit = vi.fn();
    let currentProps: any;
    render(
      <TeamCreator
        onSubmit={onSubmit}
        render={(p) => {
          currentProps = p;
          return <div />;
        }}
      />
    );

    act(() => {
      currentProps.setNameValue('Custom');
    });

    await act(async () => {
      await currentProps.handleSubmit({ preventDefault() {} } as any);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Custom',
      description: undefined,
      isPublic: false,
    });
    expect(createTeam).not.toHaveBeenCalled();
  });

  it('reports validation state via onValidationChange', async () => {
    const onValidationChange = vi.fn();
    let currentProps: any;
    render(
      <TeamCreator
        onValidationChange={onValidationChange}
        render={(p) => {
          currentProps = p;
          return <div />;
        }}
      />
    );

    expect(onValidationChange).toHaveBeenCalledWith(false);

    act(() => {
      currentProps.setNameValue('ok');
    });

    act(() => {
      currentProps.handleBlur('name');
    });

    expect(onValidationChange).toHaveBeenCalledWith(false);

    await waitFor(() => {
      expect(onValidationChange).toHaveBeenLastCalledWith(true);
    });
  });
});
