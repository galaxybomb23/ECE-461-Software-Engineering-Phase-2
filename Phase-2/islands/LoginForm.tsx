import { useState } from "preact/hooks";

export default function LoginForm() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginStatus, setLoginStatus] = useState<string>("");

  const handleLogin = async (event: Event) => {
    event.preventDefault();

    if (!username || !password) {
      setLoginStatus("Please enter both username and password.");
      return;
    }

    try {
      // Mock login request, replace with actual endpoint
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error("Login failed");

      setLoginStatus("Login successful!");
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginStatus("Invalid username or password.");
    }
  };

  return (
    <div className="center-wrapper">
      <form onSubmit={handleLogin} className="upload-form">
        <h2 className="title">Login</h2>

        <div className="url-input-row">
          <label htmlFor="username" className="upload-label">
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
            className="url-input"
          />
        </div>

        <div className="url-input-row">
          <label htmlFor="password" className="upload-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
            className="url-input"
          />
        </div>

        <button type="submit" className="upload-button">
          Log In
        </button>

        {loginStatus && <p>{loginStatus}</p>}
      </form>
    </div>
  );
}
