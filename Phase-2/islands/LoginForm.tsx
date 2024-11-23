import { useEffect, useState } from "preact/hooks";
import { isLoggedIn, loggedInUser } from "~/signals/auth.ts";
import { APIBaseURL } from "~/types/index.ts";

export default function LoginForm() {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loginStatus, setLoginStatus] = useState<string>("");

	const checkLoginState = () => {
		const authToken = localStorage.getItem("authToken");
		const username = localStorage.getItem("username");
		if (authToken) {
			try {
				isLoggedIn.value = true;
				loggedInUser.value = username;
			} catch (error) {
				console.error("Error decoding token:", error);
				isLoggedIn.value = false;
			}
		} else {
			isLoggedIn.value = false;
			loggedInUser.value = null;
		}
	};

	// Check if the user is already logged in
	useEffect(() => {
		checkLoginState();
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
		isLoggedIn.value = false;
		loggedInUser.value = null;
		checkLoginState();
		setLoginStatus("");
	};

	if (isLoggedIn.value) {
		return (
			<div className="center-wrapper">
				<div className="upload-form">
					<h2 className="title">Welcome, {loggedInUser.value}!</h2>
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
