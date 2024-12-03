import { useEffect, useState } from "preact/hooks";
import Navbar from "~/islands/Navbar.tsx";
import Modal from "~/components/Modal.tsx";
import { APIBaseURL } from "~/types/index.ts";

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
	const [editUser, setEditUser] = useState<User | null>(null);
	const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
	const [newUser, setNewUser] = useState({
		username: "",
		password: "",
		canSearch: false,
		canDownload: false,
		canUpload: false,
		userGroup: "",
		isAdmin: false,
	});

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
			const authToken = document.cookie
				.split("; ")
				.find((row) => row.startsWith("authToken="))
				?.split("=")[1];

			const response = await fetch(`${APIBaseURL}users`, {
				headers: {
					"Content-Type": "application/json",
					"X-authorization": authToken || "",
				},
			});
			if (!response.ok) throw new Error("Failed to fetch users.");
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.error("Error fetching users:", error);
		}
	};

	const createUser = async () => {
		try {
			const authToken = document.cookie
				.split("; ")
				.find((row) => row.startsWith("authToken="))
				?.split("=")[1];

			const response = await fetch(`${APIBaseURL}users`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-authorization": authToken || "",
				},
				body: JSON.stringify(newUser),
			});
			if (!response.ok) throw new Error("Failed to create user.");
			fetchUsers(); // Refresh user list
			setShowCreateForm(false); // Close the create form
			setNewUser({
				username: "",
				password: "",
				canSearch: false,
				canDownload: false,
				canUpload: false,
				userGroup: "",
				isAdmin: false,
			}); // Reset form fields
		} catch (error) {
			console.error("Error creating user:", error);
		}
	};

	const updateUser = async (user: User) => {
		try {
			const authToken = document.cookie
				.split("; ")
				.find((row) => row.startsWith("authToken="))
				?.split("=")[1];

			const response = await fetch(`${APIBaseURL}users/${user.username}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-authorization": authToken || "",
				},
				body: JSON.stringify(user),
			});
			if (!response.ok) throw new Error("Failed to update user.");
			fetchUsers(); // Refresh user list
			setEditUser(null); // Close the edit form
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	const handleEscKey = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			setEditUser(null);
			setShowCreateForm(false);
		}
	};

	const handleDeleteUser = async () => {
		setShowDeleteModal(false); // Close modal

		if (!userToDelete) return;

		try {
			const authToken = document.cookie
				.split("; ")
				.find((row) => row.startsWith("authToken="))
				?.split("=")[1];

			const response = await fetch(`${APIBaseURL}users/${userToDelete}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"X-authorization": authToken || "",
				},
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Failed to delete user.");
			}

			setFeedbackMessage(`User ${userToDelete} deleted successfully.`);
			setUserToDelete(null);
			fetchUsers(); // Refresh user list
			setTimeout(() => {
				setFeedbackMessage(null);
			}, 3000);
		} catch (error) {
			setFeedbackMessage(
				error instanceof Error
					? `Failed to delete user: ${error.message}`
					: "An unknown error occurred while deleting the user.",
			);
		}
	};

	useEffect(() => {
		checkAdminAuthorization();
		if (isAuthorized) {
			fetchUsers();
		}

		// Add event listener for Esc key
		document.addEventListener("keydown", handleEscKey);
		return () => {
			// Clean up event listener
			document.removeEventListener("keydown", handleEscKey);
		};
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
				<button className="create-button" onClick={() => setShowCreateForm(true)}>
					Create Account
				</button>

				{/* Feedback Message */}
				{feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}

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
								<p>
									<strong>Token Start Time:</strong>{" "}
									{new Date(user.tokenStartTime * 1000).toLocaleString()}
								</p>
								<p>
									<strong>API Interactions:</strong> {user.tokenApiInteractions}
								</p>
								<button
									className="edit-button"
									onClick={(e) => {
										e.stopPropagation();
										setEditUser(user);
									}}
								>
									Edit User
								</button>
								<button
									className="delete-button"
									onClick={() => {
										setUserToDelete(user.username);
										setShowDeleteModal(true);
									}}
								>
									Delete User
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Delete Modal */}
				{showDeleteModal && (
					<Modal
						title="Confirm Delete"
						message={`Are you sure you want to delete user "${userToDelete}"? This action cannot be undone.`}
						onConfirm={handleDeleteUser}
						onCancel={() => setShowDeleteModal(false)}
						confirmText="Delete"
						cancelText="Cancel"
					/>
				)}

				{showCreateForm && (
					<>
						<div
							className="overlay-background"
							onClick={() => setShowCreateForm(false)}
						>
						</div>
						<div className="edit-user-form-overlay">
							<h2>Create New User</h2>
							<label>
								<span>Username:</span>
								<input
									type="text"
									value={newUser.username}
									onChange={(e) =>
										setNewUser({ ...newUser, username: (e.target as HTMLInputElement).value })}
								/>
							</label>
							<label>
								<span>Password:</span>
								<input
									type="password"
									value={newUser.password || ""}
									onChange={(e) =>
										setNewUser({ ...newUser, password: (e.target as HTMLInputElement).value })}
								/>
							</label>
							<label>
								<span>Group:</span>
								<input
									type="text"
									value={newUser.userGroup}
									onChange={(e) =>
										setNewUser({ ...newUser, userGroup: (e.target as HTMLInputElement).value })}
								/>
							</label>
							<label>
								<span>Can Search:</span>
								<input
									type="checkbox"
									checked={newUser.canSearch}
									onChange={(e) =>
										setNewUser({ ...newUser, canSearch: (e.target as HTMLInputElement).checked })}
								/>
							</label>
							<label>
								<span>Can Download:</span>
								<input
									type="checkbox"
									checked={newUser.canDownload}
									onChange={(e) =>
										setNewUser({ ...newUser, canDownload: (e.target as HTMLInputElement).checked })}
								/>
							</label>
							<label>
								<span>Can Upload:</span>
								<input
									type="checkbox"
									checked={newUser.canUpload}
									onChange={(e) =>
										setNewUser({ ...newUser, canUpload: (e.target as HTMLInputElement).checked })}
								/>
							</label>
							<label>
								<span>Admin:</span>
								<input
									type="checkbox"
									checked={newUser.isAdmin}
									onChange={(e) =>
										setNewUser({ ...newUser, isAdmin: (e.target as HTMLInputElement).checked })}
								/>
							</label>
							<button
								className="save-button"
								onClick={createUser}
							>
								Create Account
							</button>
							<button
								className="cancel-button"
								onClick={() => setShowCreateForm(false)}
							>
								Cancel
							</button>
						</div>
					</>
				)}

				{editUser && (
					<>
						<div
							className="overlay-background"
							onClick={() => setEditUser(null)}
						>
						</div>
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
							<button
								className="save-button"
								onClick={() => updateUser(editUser)}
							>
								Save Changes
							</button>
							<button
								className="cancel-button"
								onClick={() => setEditUser(null)}
							>
								Cancel
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
