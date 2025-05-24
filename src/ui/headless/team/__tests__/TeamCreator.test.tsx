import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { TeamCreator } from '../TeamCreator';
import { useTeams } from '@/hooks/team/useTeams';
import { useAuth } from '@/hooks/auth/useAuth';

vi.mock('@/hooks/team/useTeams');
vi.mock('@/hooks/auth/useAuth');

const renderWithProps = () => {
  let props: any;
  render(
    <TeamCreator
      render={(p) => {
        props = p;
        return <div />;
      }}
    />
  );
  return props;
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
    const props = renderWithProps();

    act(() => {
      props.setNameValue('My Team');
    });

    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });

    expect(createTeam).toHaveBeenCalledTimes(1);
    expect(createTeam.mock.calls[0][0]).toBe('u1');
    expect(createTeam.mock.calls[0][1]).toEqual({
      name: 'My Team',
      description: undefined,
      isPublic: false,
    });
  });

  it('uses custom onSubmit when provided', async () => {
    const onSubmit = vi.fn();
    let props: any;
    render(
      <TeamCreator
        onSubmit={onSubmit}
        render={(p) => {
          props = p;
          return <div />;
        }}
      />
    );

    act(() => {
      props.setNameValue('Custom');
    });

    await act(async () => {
      await props.handleSubmit({ preventDefault() {} } as any);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Custom',
      description: undefined,
      isPublic: false,
    });
    expect(createTeam).not.toHaveBeenCalled();
  });

  it('reports validation state via onValidationChange', () => {
    const onValidationChange = vi.fn();
    let props: any;
    render(
      <TeamCreator
        onValidationChange={onValidationChange}
        render={(p) => {
          props = p;
          return <div />;
        }}
      />
    );

    expect(onValidationChange).toHaveBeenCalledWith(false);

    act(() => {
      props.setNameValue('ok');
      props.handleBlur('name');
    });

    expect(onValidationChange).toHaveBeenLastCalledWith(true);
  });
});
