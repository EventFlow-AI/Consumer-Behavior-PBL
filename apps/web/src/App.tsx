import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { getToken } from "./api/client";
import EventDetailsPage from "./pages/EventDetailsPage";
import "./App.css";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
  path="/events/:id"
  element={
    <ProtectedRoute>
      <EventDetailsPage />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default App;