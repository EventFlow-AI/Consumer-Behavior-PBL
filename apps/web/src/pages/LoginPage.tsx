import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError("");

      await login(email, password);

      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed",
      );
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span>RAHAT SETU</span>
          <h1>Welcome back</h1>
          <p>
            Sign in to access event information,
            facilities, alerts and attendee services.
          </p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit">
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          New to Rahat Setu?{" "}
          <button
            type="button"
            className="text-button"
            onClick={() =>
              navigate("/register")
            }
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}