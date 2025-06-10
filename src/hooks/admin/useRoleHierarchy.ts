import { useApi } from '@/hooks/core/useApi';

export function useRoleHierarchy() {
  const { isLoading, error, fetchApi } = useApi();

  const fetchHierarchy = async (rootRoleId: string) => {
    return fetchApi<{ ancestors: any[]; descendants: any[] }>(
      `/api/roles/${rootRoleId}/hierarchy`,
    );
  };

  const updateParent = async (roleId: string, parentRoleId: string | null) => {
    return fetchApi(`/api/roles/${roleId}/hierarchy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentRoleId }),
    });
  };

  return { isLoading, error, fetchHierarchy, updateParent };
}
export default useRoleHierarchy;
