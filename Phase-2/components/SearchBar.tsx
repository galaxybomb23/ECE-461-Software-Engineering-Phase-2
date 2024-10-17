import type { Signal } from "@preact/signals";

interface SearchBarProps {
    search: Signal<string>;
}

export function SearchBar({ search }: SearchBarProps) {
    const handleSearchSubmit = async (event: Event) => {
        event.preventDefault();
        const searchQuery = search.value;
        
        // Dynamically update the endpoint with the search term
        const endpoint = `/api/package/byName/${encodeURIComponent(searchQuery)}`;
        console.log("Searching for:", searchQuery);
        console.log("API Endpoint:", endpoint);

        try {
            // Fetching data from the dynamic API endpoint
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            console.log("Search results:", data);
            // Handle the search results here (e.g., updating state, displaying results)
        } catch (error) {
            console.error("Error fetching search results:", error);
        }
    };

    return (
        <form className="search-form" onSubmit={handleSearchSubmit}>   
            <label htmlFor="default-search" className="search-label">Search</label>
            <div className="search-input-container">
                <div className="search-icon">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input
                    type="search"
                    id="default-search"
                    className="search-input"
                    placeholder="Search Packages"
                    required
                    value={search.value || ""}
                    onInput={(e) => {
                        search.value = (e.target as HTMLInputElement).value;  // Updates the signal value
                        console.log("Search value updated to:", search.value);  // Log updates for debugging
                    }}
                />
                <button type="submit" className="search-button">Search</button>
            </div>
        </form>
    );
}