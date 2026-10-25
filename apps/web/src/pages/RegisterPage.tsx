import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError("");

      await register({
        name,
        email,
        password,
        phone: phone || undefined,
      });

      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed",
      );
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span>RAHAT SETU</span>
          <h1>Create your account</h1>
          <p>
            Join Rahat Setu for safer and smarter
            event navigation.
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
            <label htmlFor="register-name">
              Name
            </label>

            <input
              id="register-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="register-email">
              Email
            </label>

            <input
              id="register-email"
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
            <label htmlFor="register-phone">
              Phone
            </label>

            <input
              id="register-phone"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Optional"
            />
          </div>

          <div>
            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <button
            type="button"
            className="text-button"
            onClick={() =>
              navigate("/login")
            }
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}