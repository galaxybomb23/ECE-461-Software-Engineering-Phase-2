import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { SearchBar } from "~/islands/SearchBar.tsx";
import { isLoggedIn } from "~/signals/auth.ts";
import type { Package } from "~/types/index.ts";

export default function Navbar() {
	const searchQuery = signal("");
	const searchResults = signal<Package[]>([]);

	const checkLoginState = () => {
		// Retrieve the auth token from cookies
		const authToken = document.cookie
			.split("; ")
			.find((row) => row.startsWith("authToken="))
			?.split("=")[1];

		if (authToken) {
			isLoggedIn.value = true;
		} else {
			isLoggedIn.value = false;
		}
	};

	useEffect(() => {
		checkLoginState();

		// Optionally, listen for storage changes to update login state in real-time
		const handleStorageChange = () => {
			checkLoginState();
		};

		globalThis.addEventListener("storage", handleStorageChange);

		return () => {
			globalThis.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	return (
		<nav className="navbar">
			<a href="/">
				<img src="/logo.png" alt="Logo" />
			</a>
			<SearchBar search={searchQuery} searchResults={searchResults} />
			<ul>
				<li>
					<a href="/">Home</a>
				</li>
				<li>
					<a href="/upload">Upload</a>
				</li>
				<li>
					{/* Dynamically change text based on login state */}
					{isLoggedIn.value ? <a href="/login">Account</a> : <a href="/login">Login</a>}
				</li>
				<li>
					<a href="/admin">Admin</a>
				</li>
			</ul>
		</nav>
	);
}
