import { useState, useEffect } from "preact/hooks";
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
          <h1>Access Denied</h1>
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
              onClick={() =>
                setExpandedUser((prev) => (prev === user.username ? null : user.username))
              }
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
