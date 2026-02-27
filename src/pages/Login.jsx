import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username aur Password dono bharo");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed. Check credentials.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020817",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .login-input { 
          width:100%; padding:12px 16px; background:#0f172a; 
          border:1px solid #1e293b; border-radius:10px; 
          color:#e2e8f0; font-size:14px; font-family:inherit;
          outline:none; transition:all 0.2s; box-sizing:border-box;
        }
        .login-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px #6366f120; }
        .login-input::placeholder { color:#334155; }
        .login-btn {
          width:100%; padding:13px; background:linear-gradient(135deg,#6366f1,#8b5cf6);
          border:none; border-radius:10px; color:white; font-size:15px;
          font-weight:700; cursor:pointer; font-family:inherit;
          transition:all 0.2s; letter-spacing:0.3px;
        }
        .login-btn:hover { opacity:0.9; transform:translateY(-1px); box-shadow:0 8px 25px #6366f140; }
        .login-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
      `}</style>

      {/* Background glow blobs */}
      <div style={{
        position: "absolute", top: "20%", left: "15%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, #6366f115, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "20%", right: "15%",
        width: 250, height: 250, borderRadius: "50%",
        background: "radial-gradient(circle, #8b5cf615, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Login Card */}
      <div style={{
        width: "100%", maxWidth: 420, margin: "20px",
        animation: "fadeUp 0.5s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 16px",
            boxShadow: "0 0 40px #6366f140",
            animation: "float 3s ease-in-out infinite"
          }}>₹</div>
          <h1 style={{ color: "#e2e8f0", fontSize: 26, fontWeight: 800, margin: 0 }}>
            Rupiksha
          </h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
            Admin Panel — Secure Login
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          border: "1px solid #1e293b",
          borderRadius: 16, padding: "32px 28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <h2 style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 700, marginBottom: 24, marginTop: 0 }}>
            Welcome Back 👋
          </h2>

          {error && (
            <div style={{
              background: "#ef444415", border: "1px solid #ef444440",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              color: "#f87171", fontSize: 13
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                USERNAME
              </label>
              <input
                className="login-input"
                type="text"
                placeholder="apna username daalo"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="login-input"
                  type={showPass ? "text" : "password"}
                  placeholder="password daalo"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#475569", fontSize: 16, padding: 4
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid white", borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite", display: "inline-block"
                  }} />
                  Logging in...
                </span>
              ) : "Login Karo →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 20 }}>
          Rupiksha Services © 2024 · Secure Dashboard
        </p>
      </div>
    </div>
  );
}
