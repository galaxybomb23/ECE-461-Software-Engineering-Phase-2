import { useState, useEffect } from "preact/hooks";
import { APIBaseURL } from "~/types/index.ts";

export default function LoginForm() {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loginStatus, setLoginStatus] = useState<string>("");
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

	const checkLoginState = () => {
		const authToken = localStorage.getItem("authToken");
		const username = localStorage.getItem("username");
		if (authToken) {
			try {
				setIsLoggedIn(true);
				setLoggedInUser(username);
			} catch (error) {
				console.error("Error decoding token:", error);
				setIsLoggedIn(false);
			}
		} else {
			setIsLoggedIn(false);
			setLoggedInUser(null);
		}
	};

	// Check if the user is already logged in
	useEffect(() => {
		checkLoginState();

		// Listen for changes in localStorage to handle logout or login from another tab
		const handleStorageChange = () => checkLoginState();

		globalThis.addEventListener("storage", handleStorageChange);

		return () => {
			globalThis.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	const handleLogin = async (event: Event) => {
		event.preventDefault();

		if (!username || !password) {
			setLoginStatus("Please enter both username and password.");
			return;
		}

		try {
			const requestBody = {
				User: {
					name: username,
					isAdmin: isAdmin,
				},
				Secret: {
					password: password,
				},
			};

			const response = await fetch(`${APIBaseURL}/api/authenticate`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				if (response.status === 401) {
					setLoginStatus("Invalid username or password.");
				} else {
					setLoginStatus("An error occurred. Please try again.");
				}
				return;
			}

			const data = await response.json();

			localStorage.setItem("username", username);

			if (isAdmin) {
				localStorage.setItem("isAdmin", "true");
			}

			if (data.token) {
				localStorage.setItem("authToken", data.token);
				checkLoginState();
				setLoginStatus("Login successful!");
			}
		} catch (error) {
			console.error("Error during login:", error);
			setLoginStatus("An unexpected error occurred. Please try again.");
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("authToken");
		localStorage.removeItem("isAdmin");
		localStorage.removeItem("username");
		checkLoginState();
		setLoginStatus("");
	};

	if (isLoggedIn) {
		return (
			<div className="center-wrapper">
				<div className="upload-form">
					<h2 className="title">Welcome, {loggedInUser}!</h2>
					<button onClick={handleLogout} className="upload-button">
						Log Out
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="center-wrapper">
			<form onSubmit={handleLogin} className="upload-form">
				<h2 className="title">{isAdmin ? "Admin Login" : "User Login"}</h2>

				<div className="url-input-row">
					<label htmlFor="username" className="upload-label">
						Username:
					</label>
					<input
						type="text"
						id="username"
						value={username}
						onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
						className="url-input"
					/>
				</div>

				<div className="url-input-row">
					<label htmlFor="password" className="upload-label">
						Password:
					</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
						className="url-input"
					/>
				</div>

				<div className="url-input-row">
					<label htmlFor="admin-toggle" className="upload-label">
						Admin Login:
					</label>
					<input
						type="checkbox"
						id="admin-toggle"
						checked={isAdmin}
						onChange={(e) => setIsAdmin((e.target as HTMLInputElement).checked)}
					/>
				</div>

				<button type="submit" className="upload-button">
					Log In
				</button>

				{loginStatus && <p>{loginStatus}</p>}
			</form>
		</div>
	);
}
