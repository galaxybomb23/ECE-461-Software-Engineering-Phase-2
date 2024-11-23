import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { SearchBar } from "~/islands/SearchBar.tsx";
import { isLoggedIn } from "~/signals/auth.ts";
import type { Package } from "~/types/index.ts";

export default function Navbar() {
	const searchQuery = signal("");
	const searchResults = signal<Package[]>([]);

	const checkLoginState = () => {
		const authToken = localStorage.getItem("authToken");
		if (authToken) {
			try {
				isLoggedIn.value = true;
			} catch (error) {
				console.error("Error decoding token:", error);
				isLoggedIn.value = false;
			}
		} else {
			isLoggedIn.value = false;
		}
	};

	useEffect(() => {
		checkLoginState();
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
					{isLoggedIn.value ? <a href="/login">Account</a> : <a href="/login">Login</a>}
				</li>
				<li>
					<a href="/admin">Admin</a>
				</li>
			</ul>
		</nav>
	);
}
