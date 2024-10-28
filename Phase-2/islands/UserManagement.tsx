import { useState } from "preact/hooks";

export default function UserManagement() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [group, setGroup] = useState("default");
  const [message, setMessage] = useState("");

  const handleRegisterUser = async () => {
    // Placeholder for API call to register user
    setMessage(`User ${username} registered successfully!`);
  };

  const handleDeleteUser = async () => {
    // Placeholder for API call to delete user
    setMessage(`User ${username} deleted successfully!`);
  };

  return (
    <div className="user-management">
      <h3>Register New User</h3>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
      />
      <input
        type="text"
        placeholder="Group"
        value={group}
        onChange={(e) => setGroup((e.target as HTMLInputElement).value)}
      />
      <button onClick={handleRegisterUser}>Register User</button>

      <h3>Delete User</h3>
      <button onClick={handleDeleteUser}>Delete User</button>

      {message && <p>{message}</p>}
    </div>
  );
}
