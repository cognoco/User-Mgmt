'use client';
import { useState } from 'react';
import { UserSearch } from './UserSearch';
import { SavedSearches } from './SavedSearches';
import { ExportOptions } from './ExportOptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';

export default function AdminUsersPage() {
  const [currentSearchParams, setCurrentSearchParams] = useState<Record<string, any>>({});

  const handleSearch = (params: Record<string, any>) => {
    setCurrentSearchParams(params);
  };

  const handleSelectSavedSearch = (params: Record<string, any>) => {
    setCurrentSearchParams(params);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <ExportOptions searchParams={currentSearchParams} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
            </CardHeader>
            <CardContent>
              <SavedSearches onSelectSearch={handleSelectSavedSearch} currentSearchParams={currentSearchParams} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-3">
          <UserSearch initialSearchParams={currentSearchParams} onSearch={handleSearch} />
        </div>
      </div>
    </div>
  );
}
