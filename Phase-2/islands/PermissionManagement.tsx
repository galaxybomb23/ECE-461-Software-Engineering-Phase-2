import { useState } from "preact/hooks";

type PermissionType = "upload" | "search" | "download" | "admin";

export default function PermissionManagement() {
  const [username, setUsername] = useState("");
  const [permissions, setPermissions] = useState<Record<PermissionType, boolean>>({
    upload: false,
    search: false,
    download: false,
    admin: false,
  });

  const togglePermission = (perm: PermissionType) => {
    setPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  const handleSetPermissions = async () => {
    // Placeholder for API call to set permissions
    console.log(`Permissions set for ${username}`, permissions);
  };

  return (
    <div className="permission-management">
      <h3>Set Permissions for User</h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
      />

      <div>
        <label>
          <input
            type="checkbox"
            checked={permissions.upload}
            onChange={() => togglePermission("upload")}
          />
          Upload
        </label>
        <label>
          <input
            type="checkbox"
            checked={permissions.search}
            onChange={() => togglePermission("search")}
          />
          Search
        </label>
        <label>
          <input
            type="checkbox"
            checked={permissions.download}
            onChange={() => togglePermission("download")}
          />
          Download
        </label>
        <label>
          <input
            type="checkbox"
            checked={permissions.admin}
            onChange={() => togglePermission("admin")}
          />
          Admin
        </label>
      </div>

      <button onClick={handleSetPermissions}>Set Permissions</button>
    </div>
  );
}
