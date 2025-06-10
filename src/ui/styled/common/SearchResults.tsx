import React from 'react';
import HeadlessSearchResults from '@/ui/headless/common/SearchResults';

/**
 * SearchResults Component
 * Styled component for displaying search results using the headless component.
 */
export const SearchResults: React.FC<{ query: string }> = ({ query }) => {
  return (
    <HeadlessSearchResults
      query={query}
      render={({ hasResults }) => (
        <div className="search-results-container">
          <h2 className="search-results-title">Search Results for &quot;{query}&quot;</h2>
          {hasResults ? (
            <ul className="search-results-list">
              <li className="search-result-item">Result 1 for {query}</li>
              <li className="search-result-item">Result 2 for {query}</li>
            </ul>
          ) : (
            <div className="search-results-empty">
              <p className="search-results-empty-message">No results found for &quot;{query}&quot;.</p>
              <p className="search-results-empty-suggestion">Try different keywords or check your spelling.</p>
              <div className="search-results-tips">
                <h4 className="search-results-tips-title">Search Tips</h4>
                <ul className="search-results-tips-list">
                  <li className="search-results-tip-item">Use broader terms</li>
                  <li className="search-results-tip-item">Check for typos</li>
                </ul>
              </div>
            </div>
          )}
          {/* Placeholder for search input to allow changing query in tests */}
          <div className="search-input-container">
            <label htmlFor="searchbox" className="search-input-label">Search:</label>
            <input type="search" id="searchbox" defaultValue={query} className="search-input" />
          </div>
        </div>
      )}
    />
  );
};

export default SearchResults;