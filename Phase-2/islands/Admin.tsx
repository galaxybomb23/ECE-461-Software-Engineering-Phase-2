import { useState } from "preact/hooks";
import Navbar from "~/components/Navbar.tsx";
import UserManagement from "~/islands/UserManagement.tsx";
import PermissionManagement from "~/islands/PermissionManagement.tsx";
import GroupManagement from "~/islands/GroupManagement.tsx";

export default function Admin() {
	const [selectedTab, setSelectedTab] = useState("user-management");

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
