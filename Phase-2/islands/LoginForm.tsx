import { useEffect, useState } from "preact/hooks";
import { isLoggedIn, loggedInUser } from "~/signals/auth.ts";
import { APIBaseURL } from "~/types/index.ts";
import Modal from "~/components/Modal.tsx";

export default function LoginForm() {
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loginStatus, setLoginStatus] = useState<string>("");
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

	const checkLoginState = () => {
		const authToken = document.cookie
			.split("; ")
			.find((row) => row.startsWith("authToken="))
			?.split("=")[1];
		const storedUsername = localStorage.getItem("username");

		if (authToken) {
			isLoggedIn.value = true;
			loggedInUser.value = storedUsername;
		} else {
			isLoggedIn.value = false;
			loggedInUser.value = null;
		}
	};

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

			const response = await fetch(`${APIBaseURL}authenticate`, {
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

			const data = await response.text() as string;
			const token = data.substring(1, data.length - 1); // Strip quotes

			localStorage.setItem("username", username);
			document.cookie = `isAdmin=${isAdmin}; path=/;`;
			document.cookie = `authToken=${token}; path=/;`;

			checkLoginState();
			setLoginStatus("Login successful!");
		} catch (error) {
			console.error("Error during login:", error);
			setLoginStatus("An unexpected error occurred. Please try again.");
		}
	};

	const handleLogout = () => {
		document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
		localStorage.removeItem("username");
		document.cookie = "isAdmin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

		isLoggedIn.value = false;
		loggedInUser.value = null;

		checkLoginState();
		setLoginStatus("");
	};

	const handleDeleteAccount = async () => {
		setShowDeleteModal(false);

		try {
			if (!loggedInUser.value) {
				throw new Error("No logged-in user to delete.");
			}

			const response = await fetch(`${APIBaseURL}users/${loggedInUser.value}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Failed to delete account.");
			}

			setFeedbackMessage(`Account ${loggedInUser.value} deleted successfully.`);
			setTimeout(() => {
				setFeedbackMessage(null);
			}, 3000);
			handleLogout();
		} catch (error) {
			setFeedbackMessage(
				error instanceof Error
					? `Failed to delete account: ${error.message}`
					: "An unknown error occurred while deleting the account.",
			);
		}
	};

	if (isLoggedIn.value) {
		return (
			<div className="center-wrapper">
				<div className="upload-form">
					<h2 className="title">Welcome, {loggedInUser.value}!</h2>
					<button onClick={handleLogout} className="upload-button">
						Log Out
					</button>
					<button onClick={() => setShowDeleteModal(true)} className="delete-button">
						Delete Account
					</button>
				</div>

				{/* Delete Account Modal */}
				{showDeleteModal && (
					<Modal
						title="Confirm Account Deletion"
						message="Are you sure you want to delete your account? This action cannot be undone."
						onConfirm={handleDeleteAccount}
						onCancel={() => setShowDeleteModal(false)}
						confirmText="Delete"
						cancelText="Cancel"
					/>
				)}

				{/* Feedback Message */}
				{feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}
			</div>
		);
	}

	return (
		<div className="center-wrapper">
			<div className="vertical-container">
				<h2 className="admin-title">{isAdmin ? "Admin Login" : "User Login"}</h2>
				<form onSubmit={handleLogin} className="upload-form">
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

					<div className="debloat-container">
						<label htmlFor="admin-toggle" className="upload-label">
							Admin login:
						</label>
						<div
							className={`custom-checkbox ${isAdmin ? "checked" : ""}`}
							onClick={() => setIsAdmin(!isAdmin)}
						>
							<input
								type="checkbox"
								id="admin-toggle"
								checked={isAdmin}
								onChange={(e) => setIsAdmin((e.target as HTMLInputElement).checked)}
								className="hidden-checkbox"
							/>
							<span className="checkmark"></span>
						</div>
					</div>

					<button type="submit" className="upload-button">
						Log In
					</button>

					{loginStatus && <p>{loginStatus}</p>}
				</form>
			</div>
		</div>
	);
}
