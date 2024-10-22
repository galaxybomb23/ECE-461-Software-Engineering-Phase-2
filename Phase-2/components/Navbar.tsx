import { signal } from "@preact/signals";
import { SearchBar } from "../islands/SearchBar.tsx";

export default function NavBar() {
    const searchQuery = signal("");
    const searchResults = signal<any[]>([]);

    return (
        <nav className="navbar">
            <SearchBar search={searchQuery} searchResults={searchResults} />
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/upload">Upload/Update</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/admin">Admin</a></li>
            </ul>
        </nav>
    );
}