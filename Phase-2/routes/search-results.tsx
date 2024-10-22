import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface PackageMetadata {
  Version: string;
  Name: string;
}

export default function SearchResults() {
  const searchResults = useSignal<PackageMetadata[]>([]);
  const searchQuery = new URLSearchParams(window.location.search).get("query"); // Use window.location.search

  useEffect(() => {
    if (searchQuery && searchResults.value.length === 0) {
      const fetchResults = async () => {
        const response = await fetch(
          `/api/package/${encodeURIComponent(searchQuery)}/cost`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Authorization": "your-token-here",
            },
            body: JSON.stringify({ RegEx: searchQuery }),
          },
        );
        const result: PackageMetadata[] = await response.json();
        searchResults.value = result;
      };

      fetchResults();
    }
  }, [searchQuery]);

  return (
    <div>
      <h1>Search Results for "{searchQuery}"</h1>
      <ul>
        {searchResults.value.map((result) => (
          <li key={result.Name}>
            <strong>{result.Name}</strong> - Version: {result.Version}
          </li>
        ))}
      </ul>
    </div>
  );
}
