export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description: string;
  searchParams: Record<string, any>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearchCreatePayload {
  userId: string;
  name: string;
  description?: string;
  searchParams: Record<string, any>;
  isPublic?: boolean;
}

export interface SavedSearchUpdatePayload {
  name?: string;
  description?: string;
  searchParams?: Record<string, any>;
  isPublic?: boolean;
}
