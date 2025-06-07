// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountDeletion } from '@/src/ui/headless/auth/AccountDeletion'149;
import { UserType } from '@/types/userType'204;
import { useAuth } from '@/hooks/auth/useAuth';
import { useTeams } from '@/hooks/team/useTeams';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';

vi.mock('@/hooks/auth/useAuth');
vi.mock('@/hooks/team/useTeams');
vi.mock('@/lib/stores/subscription.store');

const mockUseAuth = useAuth as unknown as vi.Mock;
const mockUseTeams = useTeams as unknown as vi.Mock;
const mockUseSubscription = useSubscriptionStore as unknown as vi.Mock;

describe('AccountDeletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirms deletion for private account', async () => {
    const deleteAccount = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ deleteAccount, user: { id: '1', userType: UserType.PRIVATE }, isLoading: false, error: null });
    mockUseTeams.mockReturnValue({ teams: [] });
    mockUseSubscription.mockReturnValue({ userSubscription: null });

    let props: any;
    render(<AccountDeletion>{p => { props = p; return <div/>; }}</AccountDeletion>);

    await act(async () => { props.onInitiateDelete(); });
    expect(props.step).toBe('confirm');

    act(() => { props.onConfirmationChange('DELETE'); });
    await act(async () => { await props.onConfirmDelete(); });

    expect(deleteAccount).toHaveBeenCalledWith(undefined);
    expect(props.step).toBe('completed');
  });

  it('requires password for corporate account', async () => {
    const deleteAccount = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ deleteAccount, user: { id: '1', userType: UserType.CORPORATE }, isLoading: false, error: null });
    mockUseTeams.mockReturnValue({ teams: [] });
    mockUseSubscription.mockReturnValue({ userSubscription: null });

    let props: any;
    render(<AccountDeletion>{p => { props = p; return <div/>; }}</AccountDeletion>);

    await act(async () => { props.onInitiateDelete(); });
    expect(props.step).toBe('confirm');

    await act(async () => { await props.onConfirmDelete(); });
    expect(deleteAccount).not.toHaveBeenCalled();

    act(() => { props.onConfirmationChange('pass'); });
    await act(async () => { await props.onConfirmDelete(); });

    expect(deleteAccount).toHaveBeenCalledWith('pass');
  });

  it('blocks deletion when team owner or active subscription', async () => {
    const deleteAccount = vi.fn();
    mockUseAuth.mockReturnValue({ deleteAccount, user: { id: '1', userType: UserType.PRIVATE }, isLoading: false, error: null });
    mockUseTeams.mockReturnValue({ teams: [{ id: 't1', ownerId: '1' }] });
    mockUseSubscription.mockReturnValue({ userSubscription: { status: 'active' } });

    let props: any;
    render(<AccountDeletion>{p => { props = p; return <div/>; }}</AccountDeletion>);

    await act(async () => { props.onInitiateDelete(); });
    expect(props.step).toBe('initial');
    expect(props.errors.confirmation).toBeTruthy();
  });
});
