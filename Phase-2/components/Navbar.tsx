import { signal } from "@preact/signals";
import { SearchBar } from "~/islands/SearchBar.tsx";
import type { Package } from "~/types/index.ts";

export default function Navbar() {
	const searchQuery = signal("");
	const searchResults = signal<Package[]>([]);

	return (
		<nav className="navbar">
			<img src="logo.png" />
			<SearchBar search={searchQuery} searchResults={searchResults} />
			<ul>
				<li>
					<a href="/">Home</a>
				</li>
				<li>
					<a href="/upload">Upload/Update</a>
				</li>
				<li>
					<a href="/login">Login</a>
				</li>
				<li>
					<a href="/admin">Admin</a>
				</li>
			</ul>
		</nav>
	);
}