import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError("");
      setSubmitting(true);
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-aside-brand">
          <img className="brand-mark" src="/logo.webp" alt="Rahat Setu logo" />
          <strong>Rahat Setu</strong>
        </div>

        <div className="auth-aside-copy">
          <h2>Know the crowd before you get there.</h2>
          <p>
            Crowd forecasts, facility status, live alerts and
            offers for every event you attend.
          </p>
        </div>

        <small>Event intelligence for attendees</small>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-brand">
            <h1>Welcome back</h1>
            <p>Sign in to see your events.</p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="primary-button block"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-footer">
            New to Rahat Setu?{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
