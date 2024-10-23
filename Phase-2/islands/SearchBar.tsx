import type { Signal } from "@preact/signals";
import type { SearchResult } from "../types/SearchResult.ts";
interface SearchBarProps {
	search: Signal<string>;
	searchResults: Signal<SearchResult[]>; // Pass in searchResults as a prop
}

export function SearchBar({ search, searchResults }: SearchBarProps) {
	const handleSearchSubmit = async (event: Event) => {
		event.preventDefault(); // Prevent form submission

		const searchQuery = search.value.trim(); // Get trimmed search value

		if (searchQuery) {
			const redirectUrl = `/api/package/${
				encodeURIComponent(searchQuery)
			}/cost`;
			console.log("Fetching results from:", redirectUrl);

			try {
				const response = await fetch(redirectUrl);
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				const result = await response.json();
				console.log("Fetched result:", result); // Log fetched result

				// Extract the first key from the result object
				const resultKey = Object.keys(result)[0]; // Get the first key in the result object

				if (resultKey && result[resultKey]) {
					searchResults.value = [result[resultKey]]; // Update results based on fetched data
				} else {
					searchResults.value = []; // Clear results if no data found
				}
			} catch (error) {
				console.error("Error fetching search results:", error);
			}
		} else {
			console.error("Search query is empty. Not redirecting.");
		}
	};

	return (
		<form className="search-form" onSubmit={handleSearchSubmit}>
			<label htmlFor="default-search" className="search-label">
				Search
			</label>
			<div className="search-input-container">
				<div className="search-icon">
					<svg
						className="w-4 h-4 text-gray-500 dark:text-gray-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 20"
					>
						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
						/>
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
						search.value = (e.target as HTMLInputElement).value; // Updates the signal value
					}}
				/>
				<button type="submit" className="search-button">Search</button>
			</div>
		</form>
	);
}
