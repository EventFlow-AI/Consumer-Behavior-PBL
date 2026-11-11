import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCurrentAdmin, loginAdmin } from "../api/auth";
import { clearToken, getApiBaseUrl, getToken } from "../api/client";

interface LoginLocationState {
  sessionExpired?: boolean;
  from?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LoginLocationState | null) ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const existingToken = getToken();
    if (!existingToken) {
      return;
    }

    let cancelled = false;
    fetchCurrentAdmin()
      .then(() => {
        if (!cancelled) {
          navigate(locationState?.from || "/dashboard", { replace: true });
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, locationState?.from]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password);
      const target =
        locationState?.from && locationState.from !== "/login"
          ? locationState.from
          : "/dashboard";
      navigate(target, { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <aside className="login-brand-panel" aria-label="Rahat Setu Operations Console">
        <div className="login-brand-header">
          <img
            className="login-brand-mark"
            src="/logo.webp"
            alt="Rahat Setu logo"
          />
          <div className="login-brand-name">
            <strong>Rahat Setu</strong>
            <span>Operations Console</span>
          </div>
        </div>

        <div className="login-brand-body">
          <h2>Command and coordination for live events.</h2>
          <p>
            Manage venue infrastructure, monitor crowd conditions, triage active
            incidents, and publish verified updates across visitor channels.
          </p>

          <ul className="login-capabilities">
            <li>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 10h18" />
                <path d="M9 16h6" />
              </svg>
              <span>Events, venues, zones, and mapped facility status</span>
            </li>
            <li>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 3 7v6c0 5 3.8 8.7 9 10 5.2-1.3 9-5 9-10V7l-9-4Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <span>Incident severity triage and urgent announcements</span>
            </li>
            <li>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19h16" />
                <path d="M7 15v-4" />
                <path d="M12 15V7" />
                <path d="M17 15v-6" />
              </svg>
              <span>Brand offers and visitor behavior analytics</span>
            </li>
          </ul>
        </div>

        <div className="login-brand-footer">
          <span className="login-env-pill">
            <span className="login-env-dot" aria-hidden="true" />
            <span>API: {getApiBaseUrl()}</span>
          </span>
        </div>
      </aside>

      <section className="login-form-area">
        <div className="login-panel">
          <div className="login-heading">
            <h1>Sign in to Admin Portal</h1>
            <p>
              Enter your administrator credentials to access event operations.
            </p>
          </div>

          {locationState?.sessionExpired && !error && (
            <div className="login-notice" role="status">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
              <span>Your session expired. Sign in again to continue.</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="admin-email">Email address</label>
              <input
                id="admin-email"
                type="email"
                placeholder="admin@rahatsetu.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="admin-password">Password</label>
              <div className="login-password-wrap">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a16.8 16.8 0 0 1-3.3 4.3" />
                      <path d="M6.6 6.6A16.5 16.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
                      <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
                      <path d="m2 2 20 20" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="form-error" role="alert">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              className="login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="auth-spinner auth-spinner-light" aria-hidden="true" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="login-footnote">
            Restricted to accounts with the <code>ADMIN</code> role.
          </p>
        </div>
      </section>
    </main>
  );
}
