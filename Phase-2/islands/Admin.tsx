import { useState } from "preact/hooks";
import UserManagement from "~/islands/UserManagement.tsx";
import PermissionManagement from "~/islands/PermissionManagement.tsx";
import GroupManagement from "~/islands/GroupManagement.tsx";

export default function Admin() {
  const [selectedTab, setSelectedTab] = useState("user-management");

  return (
    <div className="horizontal-container">
      <div className="vertical-container">
        <div className="title">Admin Panel</div>

        {/* Tabs for Admin Sections */}
        <div className="tab-container">
          <button
            className={`tab-button ${selectedTab === "user-management" ? "active" : ""}`}
            onClick={() => setSelectedTab("user-management")}
          >
            User Management
          </button>
          <button
            className={`tab-button ${selectedTab === "permission-management" ? "active" : ""}`}
            onClick={() => setSelectedTab("permission-management")}
          >
            Permission Management
          </button>
          <button
            className={`tab-button ${selectedTab === "group-management" ? "active" : ""}`}
            onClick={() => setSelectedTab("group-management")}
          >
            Group Management
          </button>
        </div>

        {/* Render the selected tab content */}
        <div className="tab-content">
          {selectedTab === "user-management" && <UserManagement />}
          {selectedTab === "permission-management" && <PermissionManagement />}
          {selectedTab === "group-management" && <GroupManagement />}
        </div>
      </div>
    </div>
  );
}
