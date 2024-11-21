import { useState } from "preact/hooks";
import { APIBaseURL } from "~/types/index.ts";

export default function LoginForm() {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [loginStatus, setLoginStatus] = useState<string>("");

	const handleLogin = async (event: Event) => {
		event.preventDefault();

		if (!username || !password) {
			setLoginStatus("Please enter both username and password.");
			return;
		}

		try {
			const requestBody = {
				User: {
					name: username, // Use the username input value
					isAdmin: false, // Change this to `true` if admins are logging in
				},
				Secret: {
					password: password, // Use the password input value
				},
			};

			console.log('endpoint', `${APIBaseURL}/api/authenticate`);
			console.log('requestBody', requestBody);

			const response = await fetch(`${APIBaseURL}/api/authenticate`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody), // Send the request body in the expected format
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
			if (data.token) {
				localStorage.setItem("authToken", data.token); // Store token in localStorage
				setLoginStatus("Login successful!");
			}
		} catch (error) {
			console.error("Error during login:", error);
			setLoginStatus("An unexpected error occurred. Please try again.");
		}
	};

	return (
		<div className="center-wrapper">
			<form onSubmit={handleLogin} className="upload-form">
				<h2 className="title">Login</h2>

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

				<button type="submit" className="upload-button">
					Log In
				</button>

				{loginStatus && <p>{loginStatus}</p>}
			</form>
		</div>
	);
}
