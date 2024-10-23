import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { SearchBar } from "../islands/SearchBar.tsx";
import { SearchResult } from "../types/SearchResult.ts";

export default function Home() {
	const searchQuery = signal("");
	const searchResults = signal<SearchResult[]>([]);

	useEffect(() => {
		console.log("Updated search results in Home:", searchResults.value);
	}, [searchResults.value]);

	return (
		<div>
			<nav className="navbar">
				<SearchBar search={searchQuery} searchResults={searchResults} />
				<ul>
					<li>
						<a href="/">Home</a>
					</li>
					<li>
						<a href="/login">Login</a>
					</li>
					<li>
						<a href="/admin">Admin</a>
					</li>
				</ul>
			</nav>

			<div className="title">Home</div>

			<div className="search-results">
				{searchResults.value.length > 0
					? (
						<ul>
							{searchResults.value.map((result, index) => (
								<li key={index}>
									Standalone Cost: ${result.standaloneCost}
									{" "}
									- Total Cost: ${result.totalCost}
								</li>
							))}
						</ul>
					)
					: <p>No results found</p>}
			</div>
		</div>
	);
}
