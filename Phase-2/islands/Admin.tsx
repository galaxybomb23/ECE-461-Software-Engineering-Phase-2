import { useEffect, useState } from "preact/hooks";
import Navbar from "./Navbar.tsx";

interface User {
	username: string;
	isAdmin: boolean;
	canSearch: boolean;
	canDownload: boolean;
	canUpload: boolean;
	userGroup: string;
	tokenStartTime: number;
	tokenApiInteractions: number;
}

export default function Admin() {
	const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
	const [users, setUsers] = useState<User[]>([]);
	const [expandedUser, setExpandedUser] = useState<string | null>(null);
	const [editUser, setEditUser] = useState<User | null>(null); // Track the user being edited

	const checkAdminAuthorization = () => {
		const authToken = document.cookie
			.split("; ")
			.find((row) => row.startsWith("authToken="))
			?.split("=")[1];
		const isAdmin = document.cookie
			.split("; ")
			.find((row) => row.startsWith("isAdmin="))
			?.split("=")[1];

		if (authToken && isAdmin === "true") {
			setIsAuthorized(true);
		} else {
			setIsAuthorized(false);
		}
	};

	const fetchUsers = async () => {
		try {
			const response = await fetch("/api/users");
			if (!response.ok) throw new Error("Failed to fetch users.");
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	const updateUser = async (user: User) => {
		try {
			const response = await fetch(`/api/users/${user.username}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(user),
			});
			if (!response.ok) throw new Error("Failed to update user.");
			fetchUsers(); // Refresh user list
			setEditUser(null); // Close the edit form
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	useEffect(() => {
		checkAdminAuthorization();
		if (isAuthorized) {
			fetchUsers();
		}
	}, [isAuthorized]);

	if (isAuthorized === null) {
		return (
			<div>
				<Navbar />
				<div className="admin-panel">
					<p>Loading...</p>
				</div>
			</div>
		);
	}

	if (isAuthorized === false) {
		return (
			<div>
				<Navbar />
				<div className="admin-panel">
					<h1 className="admin-title">Access Denied</h1>
					<p>You do not have permission to access this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div>
			<Navbar />
			<div className="admin-panel">
				<h1 className="admin-title">Admin Panel</h1>
				<div className="user-list">
					{users.map((user) => (
						<div
							className={`user-card ${expandedUser === user.username ? "expanded" : ""}`}
							key={user.username}
							onClick={() => setExpandedUser((prev) => (prev === user.username ? null : user.username))}
						>
							<div className="user-summary">
								<span>{user.username}</span>
								<span className="expand-icon">{expandedUser === user.username ? "▲" : "▼"}</span>
							</div>
							<div className="user-details">
								<p>
									<strong>Group:</strong> {user.userGroup}
								</p>
								<ul className="permission-list">
									<li>
										<strong>Search:</strong> {user.canSearch ? "Yes" : "No"}
									</li>
									<li>
										<strong>Download:</strong> {user.canDownload ? "Yes" : "No"}
									</li>
									<li>
										<strong>Upload:</strong> {user.canUpload ? "Yes" : "No"}
									</li>
								</ul>
								<button
									className="edit-button"
									onClick={(e) => {
										e.stopPropagation();
										setEditUser(user);
									}}
								>
									Edit User
								</button>
							</div>
						</div>
					))}
				</div>
				{editUser && (
					<>
						{/* Overlay Background */}
						<div
							className="overlay-background"
							onClick={() => setEditUser(null)} // Close form on background click
						>
						</div>

						{/* Edit Form */}
						<div className="edit-user-form-overlay">
							<h2>Edit User: {editUser.username}</h2>
							<label>
								<span>User Group:</span>
								<input
									type="text"
									value={editUser.userGroup}
									onChange={(e) =>
										setEditUser({ ...editUser, userGroup: (e.target as HTMLInputElement).value })}
								/>
							</label>

							<label>
								<span>Can Search:</span>
								<input
									type="checkbox"
									checked={editUser.canSearch}
									onChange={(e) =>
										setEditUser({ ...editUser, canSearch: (e.target as HTMLInputElement).checked })}
								/>
							</label>
							<label>
								<span>Can Download:</span>
								<input
									type="checkbox"
									checked={editUser.canDownload}
									onChange={(e) =>
										setEditUser({
											...editUser,
											canDownload: (e.target as HTMLInputElement).checked,
										})}
								/>
							</label>
							<label>
								<span>Can Upload:</span>
								<input
									type="checkbox"
									checked={editUser.canUpload}
									onChange={(e) =>
										setEditUser({ ...editUser, canUpload: (e.target as HTMLInputElement).checked })}
								/>
							</label>
							<label>
								<span>Admin:</span>
								<input
									type="checkbox"
									checked={editUser.isAdmin}
									onChange={(e) =>
										setEditUser({ ...editUser, isAdmin: (e.target as HTMLInputElement).checked })}
								/>
							</label>
							<button onClick={() => updateUser(editUser)}>Save Changes</button>
							<button onClick={() => setEditUser(null)}>Cancel</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
