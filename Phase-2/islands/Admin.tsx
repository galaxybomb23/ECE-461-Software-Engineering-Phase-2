import { useEffect, useState } from "preact/hooks";
import Navbar from "./Navbar.tsx";
import UserManagement from "~/islands/UserManagement.tsx";
import PermissionManagement from "~/islands/PermissionManagement.tsx";
import GroupManagement from "~/islands/GroupManagement.tsx";

export default function Admin() {
	const [selectedTab, setSelectedTab] = useState("user-management");
	const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // Track authorization status

	const checkAdminAuthorization = () => {
		// Retrieve the authToken and isAdmin from cookies
		const authToken = document.cookie
			.split("; ")
			.find((row) => row.startsWith("authToken="))
			?.split("=")[1];
		const isAdmin = document.cookie
			.split("; ")
			.find((row) => row.startsWith("isAdmin="))
			?.split("=")[1];

		// Check if the user is authorized as admin
		if (authToken && isAdmin === "true") {
			setIsAuthorized(true);
		} else {
			setIsAuthorized(false);
		}
	};

	useEffect(() => {
		checkAdminAuthorization();
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
