import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    setUsernameError(false);
    setPasswordError(false);

    if (!username.trim()) {
      setUsernameError(true);
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError(true);
      valid = false;
    }

    if (valid) {
      setSuccess(true);
      setTimeout(() => {
        onLogin();
        setSuccess(false);
      }, 1000);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h2>Member Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, color: "#333", display: "block", marginBottom: 8 }}>
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "12px",
                border: usernameError ? "1px solid #d93025" : "1px solid #ccc",
                borderRadius: 8,
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {usernameError && (
              <div style={{ color: "#d93025", fontSize: 13, marginTop: 6 }}>Username is required</div>
            )}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 14, color: "#333", display: "block", marginBottom: 8 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "12px",
                border: passwordError ? "1px solid #d93025" : "1px solid #ccc",
                borderRadius: 8,
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {passwordError && (
              <div style={{ color: "#d93025", fontSize: 13, marginTop: 6 }}>Password is required</div>
            )}
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              background: success ? "#10b981" : "#1f4037",
              border: "none",
              color: "white",
              padding: "14px",
              fontSize: 16,
              fontWeight: "bold",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 0.3s",
            }}
          >
            {success ? "Login Successful!" : "Login"}
          </button>
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
            <a
              href="#"
              style={{ color: "#1f4037", margin: "0 6px", textDecoration: "none" }}
              onClick={e => { e.preventDefault(); alert("Contact admin for password reset"); }}
            >
              Forgot Password?
            </a>
            {" | "}
            <a
              href="#"
              style={{ color: "#1f4037", margin: "0 6px", textDecoration: "none" }}
              onClick={e => { e.preventDefault(); alert("Contact admin for new account"); }}
            >
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
