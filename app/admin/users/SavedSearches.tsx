'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, Bookmark, Trash2, Edit } from 'lucide-react';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Textarea } from '@/ui/primitives/textarea';
import { Switch } from '@/ui/primitives/switch';
import { Label } from '@/ui/primitives/label';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/primitives/dialog';
import { useSavedSearches } from '@/hooks/admin/useSavedSearches';

interface SavedSearch {
  id: string;
  name: string;
  description: string;
  searchParams: Record<string, any>;
  isPublic: boolean;
  userId: string;
  createdAt: string;
}

interface SavedSearchesProps {
  onSelectSearch: (searchParams: Record<string, any>) => void;
  currentSearchParams: Record<string, any>;
}

export function SavedSearches({ onSelectSearch, currentSearchParams }: SavedSearchesProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const {
    savedSearches,
    isLoading,
    error,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    fetchSavedSearches,
  } = useSavedSearches();

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  const handleSave = async () => {
    if (isEditing) {
      await updateSavedSearch(isEditing, {
        name,
        description,
        isPublic,
      });
    } else {
      await createSavedSearch({
        name,
        description,
        searchParams: currentSearchParams,
        isPublic,
      });
    }
    resetForm();
    await fetchSavedSearches();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      await deleteSavedSearch(id);
      await fetchSavedSearches();
    }
  };

  const handleEdit = (search: SavedSearch) => {
    setIsEditing(search.id);
    setName(search.name);
    setDescription(search.description || '');
    setIsPublic(search.isPublic);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsEditing(null);
    setName('');
    setDescription('');
    setIsPublic(false);
    setIsCreating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Saved Searches</h3>
        <Dialog
          open={isCreating}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsCreating(open);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Save Current Search</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Saved Search' : 'Save Current Search'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="search-name">Name</Label>
                <Input
                  id="search-name"
                  placeholder="My saved search"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-description">Description (optional)</Label>
                <Textarea
                  id="search-description"
                  placeholder="What this search is for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="search-public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="search-public">Make this search available to all team members</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!name}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : savedSearches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved searches yet. Save your current search to quickly access it later.</p>
      ) : (
        <ul className="space-y-2">
          {savedSearches.map((search) => (
            <li key={search.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50">
              <button className="flex items-center gap-2 text-left flex-grow" onClick={() => onSelectSearch(search.searchParams)}>
                <Bookmark className="h-4 w-4 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{search.name}</p>
                  {search.description && <p className="text-xs text-muted-foreground truncate">{search.description}</p>}
                </div>
              </button>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(search)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(search.id)}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
