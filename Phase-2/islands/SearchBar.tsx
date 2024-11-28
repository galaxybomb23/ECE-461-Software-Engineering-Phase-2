import type { Signal } from "@preact/signals";

interface SearchBarProps {
	search: Signal<string>;
}

export function SearchBar({ search }: SearchBarProps) {
	const handleSearchSubmit = (event: Event) => {
		event.preventDefault(); // Prevent form submission

		const searchQuery = search.value.trim(); // Get trimmed search value

		if (searchQuery) {
			// Redirect to the dynamic route
			globalThis.location.href = `/package/byRegEx/${encodeURIComponent(searchQuery)}`;
		} else {
			alert("Search query cannot be empty.");
		}
	};

	return (
		<form className="search-form" onSubmit={handleSearchSubmit}>
			<label htmlFor="default-search" className="search-label">
				Search
			</label>
			<div className="search-input-container">
				<input
					type="search"
					id="default-search"
					className="search-input"
					placeholder="Search Packages By Regex"
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
