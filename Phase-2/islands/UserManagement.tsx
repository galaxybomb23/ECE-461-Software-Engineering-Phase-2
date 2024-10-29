import { useState } from "preact/hooks";

export default function UserManagement() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [group, setGroup] = useState("default");
	const [message, setMessage] = useState("");

	const handleRegisterUser = async () => {
		setMessage(`User ${username} registered successfully!`);
	};

	const handleDeleteUser = async () => {
		setMessage(`User ${username} deleted successfully!`);
	};

	return (
		<div>
			<h3 className="title">User Management</h3>
			<div className="url-input-row">
				<label className="upload-label">Username:</label>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
					className="url-input"
				/>
			</div>
			<div className="url-input-row">
				<label className="upload-label">Password:</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
					className="url-input"
				/>
			</div>
			<div className="url-input-row">
				<label className="upload-label">Group:</label>
				<input
					type="text"
					value={group}
					onChange={(e) => setGroup((e.target as HTMLInputElement).value)}
					className="url-input"
				/>
			</div>
			<button onClick={handleRegisterUser} className="upload-button">Register User</button>
			<button onClick={handleDeleteUser} className="upload-button">Delete User</button>
			{message && <p>{message}</p>}
		</div>
	);
}
