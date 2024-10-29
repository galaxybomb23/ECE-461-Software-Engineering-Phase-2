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

			{/* Custom Checkboxes for Permissions */}
			<div className="debloat-container">
				<label className="upload-label">Permissions:</label>
				{(["upload", "search", "download", "admin"] as PermissionType[]).map((perm) => (
					<div
						key={perm}
						className={`custom-checkbox ${permissions[perm] ? "checked" : ""}`}
						onClick={() => togglePermission(perm)}
					>
						<input
							type="checkbox"
							checked={permissions[perm]}
							onChange={() => togglePermission(perm)}
							className="hidden-checkbox"
						/>
						<span className="checkmark"></span>
						<span className="permission-label">{perm.charAt(0).toUpperCase() + perm.slice(1)}</span>
					</div>
				))}
			</div>

			<button onClick={handleSetPermissions} className="upload-button">
				Set Permissions
			</button>
		</div>
	);
}
