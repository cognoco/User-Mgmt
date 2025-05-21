import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/database/supabase';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchItem {
  id: string;
  title: string;
  category: string;
  date: string;
}

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy categories for filter options
  const categories = ['report', 'presentation', 'spreadsheet', 'other']; 

  // Effect for data loading and filtering using Supabase
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        if (process.env.NODE_ENV === 'development') { console.log('Fetching/filtering data with:', { debouncedSearchTerm, selectedCategories, startDate, endDate }); }

        try {
            let query = supabase
                .from('items') // Replace 'items' with your actual table name
                .select('*'); // Select all columns or specify needed ones

            // Apply DEBOUNCED search term filter
            if (debouncedSearchTerm) {
                query = query.ilike('title', `%${debouncedSearchTerm}%`);
            }

            // Apply category filter
            if (selectedCategories.length > 0) {
                query = query.in('category', selectedCategories);
            }

            // Apply date range filter
            if (startDate) {
                 query = query.gte('date', startDate.toISOString().split('T')[0]);
            }
            if (endDate) {
                query = query.lte('date', endDate.toISOString().split('T')[0]);
            }

            // Execute the query
            const { data, error: dbError } = await query;

            if (dbError) {
                throw dbError;
            }

            // Update state on success: set items first, then loading false
            setItems(data || []); 
            setError(null); // Explicitly clear error
            setLoading(false); // Set loading false AFTER data is set

        } catch (err: any) { 
            if (process.env.NODE_ENV === 'development') { console.error("Error fetching search data:", err); }
            // Update state on error: set error and clear items first, then loading false
            setError(err.message || 'Failed to fetch search results.'); 
            setItems([]); // Clear items on error
            setLoading(false); // Set loading false AFTER error is set
        }
        // setLoading is now handled within try/catch, so no finally block needed for it.
    };

    fetchData();

  }, [debouncedSearchTerm, selectedCategories, startDate, endDate]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const handleDateApply = () => {
    // This function might not be strictly needed anymore as useEffect handles data fetching
    // based on state changes. Keep it if there's a specific reason to manually trigger.
    if (process.env.NODE_ENV === 'development') { console.log("Applying date range (useEffect will fetch):", startDate, endDate); }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setStartDate(undefined);
    setEndDate(undefined);
    // useEffect will automatically refetch due to state changes
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Search</h1>

      {/* Search Input */}
      <Input
        type="search"
        aria-label="Search box"
        role="searchbox"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <Card>
            <CardHeader><Label>Category</Label></CardHeader>
            <CardContent className="space-y-2">
            {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                    id={`category-${category}`} 
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)} 
                />
                <Label htmlFor={`category-${category}`} className="capitalize">{category}</Label>
                </div>
            ))}
            </CardContent>
        </Card>

        {/* Date Range Filter */}
        <Card>
          <CardHeader><Label htmlFor='date-range-start'>Date Range</Label></CardHeader>
          <CardContent className="space-y-2">
            <div>
                <Label htmlFor="date-range-start">Start Date</Label>
                <Input type="date" id="date-range-start" aria-label="start date" value={startDate?.toISOString().split('T')[0] || ''} onChange={e => setStartDate(e.target.value ? new Date(e.target.value) : undefined)} />
            </div>
             <div>
                <Label htmlFor="date-range-end">End Date</Label>
                 <Input type="date" id="date-range-end" aria-label="end date" value={endDate?.toISOString().split('T')[0] || ''} onChange={e => setEndDate(e.target.value ? new Date(e.target.value) : undefined)} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reset Filters Button */}
      <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>

      {/* Results Area */}
      <div className="mt-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && items.length === 0 && <p>No results found.</p>}
        {!loading && !error && items.length > 0 && (
          <ul className="space-y-2 list-none p-0">
            {items.map(item => (
              <li key={item.id} role="listitem">
                <Card>
                  <CardHeader><CardTitle>{item.title}</CardTitle></CardHeader>
                  <CardContent>
                    <p>Category: {item.category}</p>
                    <p>Date: {item.date}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 