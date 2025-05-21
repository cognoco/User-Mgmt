import React from 'react';

/**
 * SearchResults Component
 * Placeholder for displaying search results.
 */
export const SearchResults: React.FC<{ query: string }> = ({ query }) => {
  // Placeholder logic: Display the query and mock results/empty state
  const hasResults = query === 'test'; // Mock condition

  return (
    <div>
      <h2>Search Results for "{query}"</h2>
      {hasResults ? (
        <ul>
          <li>Result 1 for {query}</li>
          <li>Result 2 for {query}</li>
        </ul>
      ) : (
        <div>
          <p>No results found for "{query}".</p>
          <p>Try different keywords or check your spelling.</p>
          <div>
            <h4>Search Tips</h4>
            <ul><li>Use broader terms</li><li>Check for typos</li></ul>
          </div>
        </div>
      )}
      {/* Placeholder for search input to allow changing query in tests */}
      <label htmlFor="searchbox">Search:</label>
      <input type="search" id="searchbox" defaultValue={query} />
    </div>
  );
};

export default SearchResults; 