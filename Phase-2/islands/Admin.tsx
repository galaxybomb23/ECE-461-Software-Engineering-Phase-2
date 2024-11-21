import { useState, useEffect } from "preact/hooks";
import Navbar from "~/components/Navbar.tsx";
import UserManagement from "~/islands/UserManagement.tsx";
import PermissionManagement from "~/islands/PermissionManagement.tsx";
import GroupManagement from "~/islands/GroupManagement.tsx";

export default function Admin() {
	const [selectedTab, setSelectedTab] = useState("user-management");
	const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // Track authorization status

	useEffect(() => {
		// Check admin authorization
		const authToken = localStorage.getItem("authToken");
		if (!authToken) {
			setIsAuthorized(false);
			return;
		}

		try {
			// Decode or validate token (if using a JWT or custom logic)
			const user = JSON.parse(atob(authToken.split(".")[1])); // For JWTs, decode the payload
			setIsAuthorized(user.isAdmin === true); // Set authorization based on user role
		} catch (error) {
			console.error("Error validating token:", error);
			setIsAuthorized(false);
		}
	}, []);

	// Show a loading message while checking authorization
	if (isAuthorized === null) {
		return (
			<div>
				<Navbar />
				<div className="horizontal-container">
					<div className="vertical-container">
						<p>Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	// If the user is not authorized, display an error message
	if (isAuthorized === false) {
		return (
			<div>
				<Navbar />
				<div className="horizontal-container">
					<div className="vertical-container">
						<h1>Access Denied</h1>
						<p>You do not have permission to access this page.</p>
					</div>
				</div>
			</div>
		);
	}

	// Render the admin panel if authorized
	return (
		<div>
			<Navbar />
			<div className="horizontal-container">
				<div className="vertical-container">
					<div className="title">Admin Panel</div>

					{/* Tabs for Admin Sections */}
					<div className="custom-selector">
						<button
							className={`selector-option ${selectedTab === "user-management" ? "active" : ""}`}
							onClick={() => setSelectedTab("user-management")}
						>
							User Management
						</button>
						<button
							className={`selector-option ${selectedTab === "permission-management" ? "active" : ""}`}
							onClick={() => setSelectedTab("permission-management")}
						>
							Permission Management
						</button>
						<button
							className={`selector-option ${selectedTab === "group-management" ? "active" : ""}`}
							onClick={() => setSelectedTab("group-management")}
						>
							Group Management
						</button>
					</div>

					{/* Render the selected tab content */}
					<div className="upload-form tab-content">
						{selectedTab === "user-management" && <UserManagement />}
						{selectedTab === "permission-management" && <PermissionManagement />}
						{selectedTab === "group-management" && <GroupManagement />}
					</div>
				</div>
			</div>
		</div>
	);
}
