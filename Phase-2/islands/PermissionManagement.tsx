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
		console.log(`Permissions set for ${username}`, permissions);
	};

	return (
		<div>
			<h3 className="title">Permission Management</h3>
			<div className="url-input-row">
				<label className="upload-label">Username:</label>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
					className="url-input"
				/>
			</div>
			<div className="file-input-row">
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
			<button onClick={handleSetPermissions} className="upload-button">Set Permissions</button>
		</div>
	);
}
