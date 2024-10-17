import { signal } from "@preact/signals";
import { SearchBar } from "../components/SearchBar.tsx";

export default function Admin() {
  const searchQuery = signal("");

  return (
    <div>
        <div>
            <nav className = "navbar">
                <SearchBar search={searchQuery}/>
                <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/admin">Admin</a></li>
                </ul>
            </nav>
        </div>
        <div className = "title">
            Admin
        </div>
    </div>
  );
}
