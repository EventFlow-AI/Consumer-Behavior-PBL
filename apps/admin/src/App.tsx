import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import VenuesPage from "./pages/VenuesPage";
import ZonesPage from "./pages/ZonesPage";
import LocationsPage from "./pages/LocationsPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import IncidentsPage from "./pages/IncidentsPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/zones" element={<ZonesPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;