import { signal } from "@preact/signals";

// Track the user's authentication state and username
export const isLoggedIn = signal(false);
export const loggedInUser = signal<string | null>(null);
