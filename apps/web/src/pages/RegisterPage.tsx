import { useState } from "react";
import { useNavigate } from "react-router-dom";
// NOTE: your pasted Register file was a copy of the Login file, so the
// real register API was not visible. Adjust ONLY the call marked below
// (and this import) to match your actual ../api/auth signature.
import { register } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      // >>> ADJUST TO YOUR BACKEND SIGNATURE <<<
      await register(name, email, password);
      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-aside-brand">
          <span className="brand-mark">RS</span>
          <strong>Rahat Setu</strong>
        </div>

        <div className="auth-aside-copy">
          <h2>One account for every event.</h2>
          <p>
            Save offers, check facilities and plan around the
            crowd, all from your phone.
          </p>
        </div>

        <small>Event intelligence for attendees</small>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-brand">
            <h1>Create your account</h1>
            <p>It takes less than a minute.</p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <div className="password-wrap">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
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

            <div className="field">
              <label htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button block"
              disabled={submitting}
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
