import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { fetchCurrentAdmin, getStoredAdminUser } from "../api/auth";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearToken,
  getToken,
} from "../api/client";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getToken();
  const cachedAdmin = getStoredAdminUser();

  const [status, setStatus] = useState<
    "checking" | "authorized" | "unauthorized"
  >(() => {
    if (!token) {
      return "unauthorized";
    }
    return cachedAdmin ? "authorized" : "checking";
  });

  useEffect(() => {
    function handleUnauthorized() {
      setStatus("unauthorized");
      navigate("/login", {
        replace: true,
        state: { sessionExpired: true, from: location.pathname },
      });
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        handleUnauthorized,
      );
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      return;
    }

    fetchCurrentAdmin()
      .then(() => {
        if (!cancelled) {
          setStatus("authorized");
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
          setStatus("unauthorized");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "unauthorized" || !token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (status === "checking") {
    return (
      <main className="auth-checking" aria-busy="true">
        <div className="auth-checking-card">
          <span className="auth-spinner" aria-hidden="true" />
          <span>Verifying administrator session...</span>
        </div>
      </main>
    );
  }

  return children;
}
