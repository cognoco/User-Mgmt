"use client";
import { useState, useEffect } from "react";
import { UserSearch } from "@/app/admin/users/UserSearch";
import { SavedSearches } from "@/app/admin/users/SavedSearches";
import { ExportOptions } from "@/app/admin/users/ExportOptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/primitives/card";
import { RealtimeStatus } from "@/components/ui/RealtimeStatus";
import { useAdminRealtimeChannel } from "@/hooks/admin/useAdminRealtimeChannel";

export default function AdminUsersPageClient() {
  const [currentSearchParams, setCurrentSearchParams] = useState<
    Record<string, any>
  >({});
  const { isConnected, addUserChangeListener } = useAdminRealtimeChannel();

  const handleSearch = (params: Record<string, any>) => {
    setCurrentSearchParams(params);
  };

  const handleSelectSavedSearch = (params: Record<string, any>) => {
    setCurrentSearchParams(params);
  };

  useEffect(() => {
    const handleUserChange = () => {
      if (currentSearchParams && Object.keys(currentSearchParams).length > 0) {
        handleSearch(currentSearchParams);
      }
    };
    const remove = addUserChangeListener(handleUserChange);
    return () => remove();
  }, [addUserChangeListener, handleSearch, currentSearchParams]);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <RealtimeStatus isConnected={isConnected} />
        </div>
        <ExportOptions searchParams={currentSearchParams} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <SavedSearches
                onSelectSearch={handleSelectSavedSearch}
                currentSearchParams={currentSearchParams}
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <UserSearch
            initialSearchParams={currentSearchParams}
            onSearch={handleSearch}
          />
        </div>
      </div>
    </div>
  );
}
