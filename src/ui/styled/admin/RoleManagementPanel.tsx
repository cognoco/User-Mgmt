import React from 'react';
import { User } from '@/types/user';
import { useRBACStore } from '@/lib/stores/rbac.store';
import { UserRoleSchema, RoleSchema } from '@/types/rbac';

/**
 * RoleManagementPanel Component
 *
 * Purpose:
 *   - Provides an admin-facing UI for listing users, assigning/removing roles, and viewing role permissions.
 *   - Designed to be modular, pluggable, and database-agnostic (uses RBAC store abstraction).
 *
 * Props:
 *   - users: User[]
 *     List of user objects to display and manage roles for.
 *   - (Planned) Optional feature toggles and custom actions for further configuration.
 *
 * Usage Example:
 *   import RoleManagementPanel from '@/ui/styled/admin/RoleManagementPanel';
 *   <RoleManagementPanel users={users} />
 *
 * Feature Toggling:
 *   - To enable/disable this panel, control its rendering in the parent admin/dashboard page.
 *   - Future: Accepts feature toggle props for finer control (see TODO in props).
 *
 * Backend Abstraction:
 *   - All role/permission logic is abstracted via the RBAC store (see '@/lib/stores/rbac.store').
 *   - Swapping database providers only requires updating the store implementation.
 *
 * Accessibility & Responsiveness:
 *   - Follows accessibility best practices (ARIA labels, keyboard navigation).
 *   - Responsive design for mobile and desktop.
 *
 * For more details, see the implementation plan and file structure guidelines.
 */

export interface RoleManagementPanelProps {
  users: User[];
  // TODO: Add optional props for feature toggles, custom actions, etc.
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({ users }) => {
  // React 19 compatibility - Use individual selectors
  const roles = useRBACStore(state => state.roles);
  const userRoles = useRBACStore(state => state.userRoles);
  const isLoading = useRBACStore(state => state.isLoading);
  const error = useRBACStore(state => state.error);
  const assignRole = useRBACStore(state => state.assignRole);
  const removeRole = useRBACStore(state => state.removeRole);

  // Helper to get role assignments for a user
  const getUserRoleAssignments = (userId: string | number): UserRoleSchema[] =>
    userRoles.filter((ur: UserRoleSchema) => ur.userId === String(userId));

  // Helper to get roles not assigned to a user
  const getAssignableRoles = (userId: string | number): RoleSchema[] => {
    const assignedRoleIds = new Set(getUserRoleAssignments(userId).map((ur: UserRoleSchema) => ur.roleId));
    return roles.filter((role: RoleSchema) => !assignedRoleIds.has(role.id));
  };

  const handleAssignRole = async (userId: string | number, roleId: string) => {
    if (!isLoading) {
      await assignRole(userId.toString(), roleId);
    }
  };

  const handleRemoveRole = async (userId: string | number, roleId: string) => {
    if (!isLoading) {
      await removeRole(userId.toString(), roleId);
    }
  };

  return (
    <div className="rounded-md border p-4 w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">User Role Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Roles</th>
              <th className="px-4 py-2 text-left">Assign</th>
              <th className="px-4 py-2 text-left">Remove</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center text-red-500 py-4" role="alert">{error}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No users found.</td>
              </tr>
            ) : (
              users.map((user) => {
                const assignedRoles = getUserRoleAssignments(user.id);
                const assignableRoles = getAssignableRoles(user.id);
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-2">{user.fullName || user.username || user.email}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      {assignedRoles.length === 0 ? (
                        <span className="text-gray-400">None</span>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {assignedRoles.map((ur: UserRoleSchema) => {
                            const role = roles.find((r: RoleSchema) => r.id === ur.roleId);
                            return role ? (
                              <li key={ur.roleId} className="inline-flex items-center bg-gray-100 rounded px-2 py-1">
                                <span>{role.name}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <select
                        aria-label={`Assign role to ${user.fullName || user.email}`}
                        className="border rounded px-2 py-1"
                        disabled={isLoading || assignableRoles.length === 0}
                        defaultValue=""
                        onChange={e => {
                          if (e.target.value) {
                            handleAssignRole(user.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="" disabled>
                          {assignableRoles.length === 0 ? 'No roles' : 'Select role'}
                        </option>
                        {assignableRoles.map((role: RoleSchema) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <ul className="flex flex-wrap gap-2">
                        {assignedRoles.map((ur: UserRoleSchema) => (
                          <li key={ur.roleId}>
                            <button
                              aria-label={`Remove role ${roles.find((r: RoleSchema) => r.id === ur.roleId)?.name || ur.roleId} from ${user.fullName || user.email}`}
                              className="text-red-600 hover:underline disabled:opacity-50"
                              disabled={isLoading}
                              onClick={() => handleRemoveRole(user.id, ur.roleId)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Permissions Viewer Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Roles & Permissions</h3>
        {isLoading ? (
          <div className="py-4 text-center">Loading roles...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500" role="alert">{error}</div>
        ) : roles.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No roles defined.</div>
        ) : (
          <ul className="space-y-2">
            {roles.map((role: RoleSchema) => (
              <li key={role.id} className="border rounded p-3 bg-gray-50">
                <details>
                  <summary className="cursor-pointer font-bold text-base flex items-center">
                    {role.name}
                    {role.description && (
                      <span className="ml-2 text-gray-500 font-normal text-sm">{role.description}</span>
                    )}
                  </summary>
                  <ul className="ml-6 mt-2 list-disc">
                    {role.permissions.length === 0 ? (
                      <li className="text-gray-400">No permissions</li>
                    ) : (
                      role.permissions.map((perm: string) => (
                        <li key={perm} className="text-sm">{perm}</li>
                      ))
                    )}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoleManagementPanel; 