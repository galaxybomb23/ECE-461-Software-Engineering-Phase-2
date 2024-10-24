import type { Signal } from "@preact/signals";
import type { Package } from "~/types/index.ts";

interface SearchBarProps {
	search: Signal<string>;
	searchResults: Signal<Package[]>; // Pass in searchResults as a prop
}

export function SearchBar({ search, searchResults }: SearchBarProps) {
	const handleSearchSubmit = async (event: Event) => {
		event.preventDefault(); // Prevent form submission

		const searchQuery = search.value.trim(); // Get trimmed search value

		if (searchQuery) {
			const redirectUrl = `/api/package/${
				encodeURIComponent(searchQuery)
			}`;
			console.log("Fetching results from:", redirectUrl);

			try {
				const response = await fetch(redirectUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Authorization": "your-token-here",
					},
					body: JSON.stringify({ RegEx: searchQuery }),
				});

				if (!response.ok) {
					throw new Error("Network response was not ok");
				}

				const result: Package[] = await response.json();
				console.log("Fetched result:", result);

				searchResults.value = result; // Update the results

				// Use window.location.href for redirection
				globalThis.location.href = `/search-results?query=${
					encodeURIComponent(searchQuery)
				}`;
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
