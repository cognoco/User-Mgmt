/**
 * Headless Search Results
 */
export default function SearchResults({
  query,
  render
}: {
  query: string;
  render: (props: { hasResults: boolean }) => React.ReactNode;
}) {
  const hasResults = query === 'test';
  return <>{render({ hasResults })}</>;
}
