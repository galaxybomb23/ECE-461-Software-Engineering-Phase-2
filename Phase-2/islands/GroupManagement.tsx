import { useState } from "preact/hooks";

export default function GroupManagement() {
  const [username, setUsername] = useState("");
  const [group, setGroup] = useState("default");

  const handleSetGroup = async () => {
    // Placeholder for API call to set group
    console.log(`User ${username} assigned to group ${group}`);
  };

  return (
    <div className="group-management">
      <h3>Assign User to Group</h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
      />
      <input
        type="text"
        placeholder="Group"
        value={group}
        onChange={(e) => setGroup((e.target as HTMLInputElement).value)}
      />
      <button onClick={handleSetGroup}>Set Group</button>
    </div>
  );
}
