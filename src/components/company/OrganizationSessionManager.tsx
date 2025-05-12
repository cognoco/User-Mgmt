import React, { useEffect, useState } from 'react';
import { useOrganizationPolicies, useOrganizationMembers, useTerminateUserSessions, useReauthentication } from '@/hooks/useOrganizationSession';
import { useOrganization } from '@/lib/context/OrganizationContext';

interface OrganizationSessionManagerProps {
  orgId: string;
}

export const OrganizationSessionManager: React.FC<OrganizationSessionManagerProps> = ({ orgId }) => {
  const { organization } = useOrganization();
  const orgName = organization?.name || 'Organization';

  // Policies
  const { policies, loading: policiesLoading, error: policiesError, fetchPolicies, updatePolicies } = useOrganizationPolicies(orgId);
  const [editPolicies, setEditPolicies] = useState<any | null>(null);
  // Members
  const { members, loading: membersLoading, error: membersError, refetch: refetchMembers } = useOrganizationMembers(orgId);
  // Terminate Sessions
  const { terminateUserSessions, loading: terminateLoading, error: terminateError, count } = useTerminateUserSessions(orgId);

  const [activeTab, setActiveTab] = useState<'policies' | 'ip' | 'sensitive'>('policies');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync editPolicies with fetched policies
  useEffect(() => {
    if (policies) setEditPolicies({ ...policies });
  }, [policies]);

  // Fetch on mount
  useEffect(() => {
    fetchPolicies();
    refetchMembers();
  }, [fetchPolicies, refetchMembers]);

  const handleSavePolicies = async () => {
    if (!editPolicies) return;
    await updatePolicies(editPolicies);
    setSuccessMessage('Settings updated');
    setTimeout(() => setSuccessMessage(null), 2000);
    fetchPolicies();
  };

  const handleTerminateSessions = async (userId: string) => {
    await terminateUserSessions(userId);
    setSuccessMessage(`${count || 0} sessions terminated`);
    setPendingUserId(null);
    setTimeout(() => setSuccessMessage(null), 2000);
    refetchMembers();
  };

  if (policiesLoading || membersLoading) return <div className="p-4">Loading...</div>;
  if (policiesError) return <div className="p-4 text-red-600">{policiesError}</div>;
  if (membersError) return <div className="p-4 text-red-600">{membersError}</div>;
  if (!editPolicies) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-2">{orgName}</h2>
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{successMessage}</div>
      )}
      <div className="mb-4 flex space-x-2 border-b">
        <button
          className={`px-3 py-2 ${activeTab === 'policies' ? 'border-b-2 border-primary font-semibold' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          Session Policies
        </button>
        <button
          className={`px-3 py-2 ${activeTab === 'ip' ? 'border-b-2 border-primary font-semibold' : ''}`}
          onClick={() => setActiveTab('ip')}
        >
          IP Restrictions
        </button>
        <button
          className={`px-3 py-2 ${activeTab === 'sensitive' ? 'border-b-2 border-primary font-semibold' : ''}`}
          onClick={() => setActiveTab('sensitive')}
        >
          Sensitive Actions
        </button>
      </div>
      {activeTab === 'policies' && (
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            handleSavePolicies();
          }}
        >
          <div>
            <label className="block font-medium" htmlFor="session-timeout">Session Timeout (minutes)</label>
            <input
              id="session-timeout"
              type="number"
              className="input input-bordered w-full"
              value={editPolicies.session_timeout_mins}
              onChange={e => setEditPolicies((s: any) => ({ ...s, session_timeout_mins: Number(e.target.value) }))}
              aria-label="Session Timeout"
            />
          </div>
          <div>
            <label className="block font-medium" htmlFor="max-sessions">Max Sessions Per User</label>
            <input
              id="max-sessions"
              type="number"
              className="input input-bordered w-full"
              value={editPolicies.max_sessions_per_user}
              onChange={e => setEditPolicies((s: any) => ({ ...s, max_sessions_per_user: Number(e.target.value) }))}
              aria-label="Max Sessions Per User"
            />
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      )}
      {activeTab === 'ip' && (
        <div>
          <div className="mb-2 flex items-center">
            <input
              id="enforce-ip"
              type="checkbox"
              checked={editPolicies.enforce_ip_restrictions}
              onChange={e => setEditPolicies((s: any) => ({ ...s, enforce_ip_restrictions: e.target.checked }))}
              aria-label="Enforce IP Restrictions"
            />
            <label htmlFor="enforce-ip" className="ml-2">Enforce IP Restrictions</label>
          </div>
          <div className="mb-2">
            <div className="font-medium mb-1">Allowed IP Ranges</div>
            <ul className="mb-2">
              {editPolicies.allowed_ip_ranges.map((ip: string) => (
                <li key={ip} className="flex items-center space-x-2">
                  <span>{ip}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-secondary" type="button">Add IP Range</button>
          </div>
          <button className="btn btn-primary" onClick={handleSavePolicies}>Save</button>
        </div>
      )}
      {activeTab === 'sensitive' && (
        <div>
          <div className="mb-2 flex items-center">
            <input
              id="require-reauth"
              type="checkbox"
              checked={editPolicies.require_reauth_for_sensitive}
              onChange={e => setEditPolicies((s: any) => ({ ...s, require_reauth_for_sensitive: e.target.checked }))}
              aria-label="Require Reauthentication"
            />
            <label htmlFor="require-reauth" className="ml-2">Require Reauthentication for Sensitive Actions</label>
          </div>
          <div className="mb-2">
            <div className="font-medium mb-1">Sensitive Actions</div>
            <ul className="mb-2">
              {editPolicies.sensitive_actions.map((action: string) => (
                <li key={action} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={true}
                    aria-label={action.replace(/_/g, ' ')}
                    readOnly
                  />
                  <span>{action.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-secondary" type="button">Add Custom Action</button>
          </div>
          <button className="btn btn-primary" onClick={handleSavePolicies}>Save</button>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Organization Members</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Active Sessions</th>
                <th className="px-4 py-2 text-left">Last Active</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member: any) => (
                <tr key={member.user_id}>
                  <td className="px-4 py-2">{member.email}</td>
                  <td className="px-4 py-2">{member.role}</td>
                  <td className="px-4 py-2">{member.active_sessions} active sessions</td>
                  <td className="px-4 py-2">{new Date(member.last_active).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <button
                      className="btn btn-danger"
                      onClick={() => setPendingUserId(member.user_id)}
                      disabled={terminateLoading}
                    >
                      Terminate Sessions
                    </button>
                    {pendingUserId === member.user_id && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                        <div className="bg-white p-4 rounded shadow max-w-sm w-full">
                          <div className="font-semibold mb-2">Confirm Termination</div>
                          <div className="mb-4">Are you sure you want to terminate all sessions for {member.email}?</div>
                          <div className="flex justify-end space-x-2">
                            <button className="btn btn-secondary" onClick={() => setPendingUserId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => handleTerminateSessions(member.user_id)} disabled={terminateLoading}>
                              Confirm
                            </button>
                          </div>
                          {terminateError && <div className="text-red-600 mt-2">{terminateError}</div>}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 