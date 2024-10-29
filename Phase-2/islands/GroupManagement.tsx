import { useState } from "preact/hooks";

export default function GroupManagement() {
	const [username, setUsername] = useState("");
	const [group, setGroup] = useState("default");

	const handleSetGroup = async () => {
		console.log(`User ${username} assigned to group ${group}`);
	};

	return (
		<div>
			<h3 className="title">Group Management</h3>
			<div className="url-input-row">
				<label className="upload-label">Username:</label>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
					className="url-input"
				/>
			</div>
			<div className="url-input-row">
				<label className="upload-label">Group:</label>
				<input
					type="text"
					value={group}
					onChange={(e) => setGroup((e.target as HTMLInputElement).value)}
					className="url-input"
				/>
			</div>
			<button onClick={handleSetGroup} className="upload-button">Set Group</button>
		</div>
	);
}
