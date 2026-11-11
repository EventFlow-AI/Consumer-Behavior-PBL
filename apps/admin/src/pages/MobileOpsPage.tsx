import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  createVolunteer,
  getFacilityReports,
  getQueueGates,
  getQuietReservations,
  getSosAlerts,
  getVolunteers,
  updateFacilityReport,
  updateQueueGate,
  updateQuietReservation,
  updateSosAlert,
  updateVolunteer,
  type MobileFacilityReport,
  type MobileQueueGate,
  type MobileQuietReservation,
  type MobileSosAlert,
  type MobileVolunteer,
} from "../api/mobileOps";

type OpsTab = "sos" | "facilities" | "queues" | "community";

interface GateDraft {
  wait_minutes: number;
  active_lanes: number;
  trend: "falling" | "stable" | "rising";
  is_fastest: boolean;
}

export default function MobileOpsPage() {
  const [activeTab, setActiveTab] = useState<OpsTab>("sos");
  const [sosAlerts, setSosAlerts] = useState<MobileSosAlert[]>([]);
  const [facilityReports, setFacilityReports] = useState<
    MobileFacilityReport[]
  >([]);
  const [queueGates, setQueueGates] = useState<MobileQueueGate[]>([]);
  const [gateDrafts, setGateDrafts] = useState<Record<string, GateDraft>>({});
  const [reservations, setReservations] = useState<MobileQuietReservation[]>(
    [],
  );
  const [volunteers, setVolunteers] = useState<MobileVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");

  const [badgeCode, setBadgeCode] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerRole, setVolunteerRole] = useState("Field Marshal");
  const [volunteerSector, setVolunteerSector] = useState("Sector 4 Promenade");
  const [volunteerPin, setVolunteerPin] = useState("1234");
  const [volunteerPhone, setVolunteerPhone] = useState("");

  const loadAll = useCallback(async () => {
    try {
      const [sos, reports, gates, bookings, staff] = await Promise.all([
        getSosAlerts(),
        getFacilityReports(),
        getQueueGates(),
        getQuietReservations(),
        getVolunteers(),
      ]);

      setSosAlerts(sos);
      setFacilityReports(reports);
      setQueueGates(gates);
      setGateDrafts((prev) => {
        const next: Record<string, GateDraft> = {};
        for (const gate of gates) {
          next[gate.id] = prev[gate.id] ?? {
            wait_minutes: gate.wait_minutes,
            active_lanes: gate.active_lanes,
            trend: gate.trend,
            is_fastest: gate.is_fastest,
          };
        }
        return next;
      });
      setReservations(bookings);
      setVolunteers(staff);
      setError("");
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Supabase mobile operations",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void loadAll();
    }, 0);
    const interval = window.setInterval(() => {
      void loadAll();
    }, 8000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [loadAll]);

  async function handleSosUpdate(
    id: string,
    patch: {
      status?: MobileSosAlert["status"];
      assigned_volunteer?: string | null;
    },
  ) {
    try {
      setSavingId(id);
      setError("");
      await updateSosAlert(id, patch);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update alert");
    } finally {
      setSavingId(null);
    }
  }

  async function handleReportUpdate(
    id: string,
    patch: {
      status?: MobileFacilityReport["status"];
      handled_by?: string | null;
    },
  ) {
    try {
      setSavingId(id);
      setError("");
      await updateFacilityReport(id, patch);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report");
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveGate(gate: MobileQueueGate) {
    const draft = gateDrafts[gate.id];
    if (!draft) return;

    try {
      setSavingId(gate.id);
      setError("");
      const boundedLanes = Math.max(
        0,
        Math.min(gate.total_lanes, draft.active_lanes),
      );
      const estimatedRatio = Math.min(
        1,
        Math.max(0.05, Number((draft.wait_minutes / 50).toFixed(2))),
      );
      await updateQueueGate(gate.id, {
        wait_minutes: Math.max(0, draft.wait_minutes),
        active_lanes: boundedLanes,
        trend: draft.trend,
        is_fastest: draft.is_fastest,
        capacity_ratio: estimatedRatio,
      });
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update gate");
    } finally {
      setSavingId(null);
    }
  }

  async function handleAddVolunteer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!badgeCode.trim() || !volunteerName.trim()) return;

    try {
      setSavingId("new-volunteer");
      setError("");
      await createVolunteer({
        badge_code: badgeCode.trim().toUpperCase(),
        pin: volunteerPin.trim() || "1234",
        name: volunteerName.trim(),
        role_title: volunteerRole.trim() || "Field Marshal",
        assigned_sector: volunteerSector.trim() || "Sector 4",
        phone: volunteerPhone.trim() || undefined,
      });
      setBadgeCode("");
      setVolunteerName("");
      setVolunteerPhone("");
      await loadAll();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add volunteer",
      );
    } finally {
      setSavingId(null);
    }
  }

  const openSosCount = sosAlerts.filter(
    (item) => item.status === "OPEN" || item.status === "DISPATCHED",
  ).length;
  const openReportCount = facilityReports.filter(
    (item) => item.status !== "FIXED",
  ).length;
  const activeBookingsCount = reservations.filter(
    (item) => item.status === "CONFIRMED",
  ).length;
  const onDutyCount = volunteers.filter((item) => item.on_duty).length;

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Field &amp; Mobile Operations</h1>
          <p>
            Live SOS alerts, Water/WC issue reports, gate wait times, quiet spot
            bookings, and field volunteers synced via Supabase.
          </p>
        </div>

        <div className="ops-sync-bar">
          {lastSyncedAt && (
            <span className="ops-sync-time">Synced {lastSyncedAt}</span>
          )}
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadAll()}
          >
            Refresh now
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <span>Active SOS &amp; Triage</span>
          <strong>{openSosCount}</strong>
          <p>{sosAlerts.length} total mobile alerts recorded</p>
        </article>

        <article className="dashboard-card">
          <span>Open Water / WC Issues</span>
          <strong>{openReportCount}</strong>
          <p>{facilityReports.length} total facility reports</p>
        </article>

        <article className="dashboard-card">
          <span>Quiet Spot Reservations</span>
          <strong>{activeBookingsCount}</strong>
          <p>{reservations.length} total bookings from app</p>
        </article>

        <article className="dashboard-card">
          <span>Volunteers On Duty</span>
          <strong>
            {onDutyCount} / {volunteers.length}
          </strong>
          <p>Badge login active in mobile Portal Login</p>
        </article>
      </div>

      <div className="ops-tabs" role="tablist" aria-label="Mobile operations">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "sos"}
          className={`ops-tab ${activeTab === "sos" ? "active" : ""}`}
          onClick={() => setActiveTab("sos")}
        >
          SOS &amp; Triage ({sosAlerts.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "facilities"}
          className={`ops-tab ${activeTab === "facilities" ? "active" : ""}`}
          onClick={() => setActiveTab("facilities")}
        >
          Water &amp; WC Reports ({facilityReports.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "queues"}
          className={`ops-tab ${activeTab === "queues" ? "active" : ""}`}
          onClick={() => setActiveTab("queues")}
        >
          Queue Gate Control ({queueGates.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "community"}
          className={`ops-tab ${activeTab === "community" ? "active" : ""}`}
          onClick={() => setActiveTab("community")}
        >
          Bookings &amp; Volunteers ({volunteers.length})
        </button>
      </div>

      {loading ? (
        <div className="content-panel loading-panel">
          Loading mobile operations from Supabase...
        </div>
      ) : null}

      {!loading && activeTab === "sos" && (
        <div className="content-panel table-card">
          {sosAlerts.length === 0 ? (
            <div className="empty-state">
              <h2>No SOS alerts yet</h2>
              <p>
                Trigger an SOS or triage card from the mobile app to see it
                appear here immediately.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Alert</th>
                    <th>Type &amp; Severity</th>
                    <th>Reporter &amp; Sector</th>
                    <th>Assigned Volunteer</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sosAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>
                        <strong>{alert.title}</strong>
                        <span className="table-description">
                          {alert.description}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge status-upcoming">
                          {alert.alert_type}
                        </span>{" "}
                        <span
                          className={`status-badge ${
                            alert.severity === "CRITICAL" ||
                            alert.severity === "HIGH"
                              ? "status-cancelled"
                              : "status-busy"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td>
                        <strong>{alert.reporter_name}</strong>
                        <span className="table-description">
                          {alert.phone || "Guest"} · {alert.sector}
                        </span>
                      </td>
                      <td>
                        <select
                          aria-label={`Assign volunteer for ${alert.title}`}
                          value={alert.assigned_volunteer ?? ""}
                          disabled={savingId === alert.id}
                          onChange={(e) =>
                            void handleSosUpdate(alert.id, {
                              assigned_volunteer: e.target.value || null,
                              status:
                                e.target.value && alert.status === "OPEN"
                                  ? "DISPATCHED"
                                  : alert.status,
                            })
                          }
                        >
                          <option value="">Unassigned</option>
                          {volunteers.map((v) => (
                            <option
                              key={v.id}
                              value={`${v.name} (${v.badge_code})`}
                            >
                              {v.name} ({v.badge_code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          aria-label={`Status for ${alert.title}`}
                          value={alert.status}
                          disabled={savingId === alert.id}
                          onChange={(e) =>
                            void handleSosUpdate(alert.id, {
                              status: e.target
                                .value as MobileSosAlert["status"],
                            })
                          }
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td>{new Date(alert.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === "facilities" && (
        <div className="content-panel table-card">
          {facilityReports.length === 0 ? (
            <div className="empty-state">
              <h2>No Water or Restroom reports yet</h2>
              <p>
                Submit a facility issue from the mobile Water &amp; WC screen to
                track repairs here.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Issue</th>
                    <th>Reporter</th>
                    <th>Handled By</th>
                    <th>Status</th>
                    <th>Reported At</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityReports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <strong>{report.facility_name}</strong>
                        <span className="table-description">
                          {report.facility_type} ·{" "}
                          {report.sector || "Sector 4"}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge status-busy">
                          {report.issue_type}
                        </span>
                      </td>
                      <td>{report.reporter_phone || "Pilgrim / Guest"}</td>
                      <td>
                        <select
                          aria-label={`Assign handler for ${report.facility_name}`}
                          value={report.handled_by ?? ""}
                          disabled={savingId === report.id}
                          onChange={(e) =>
                            void handleReportUpdate(report.id, {
                              handled_by: e.target.value || null,
                              status:
                                e.target.value && report.status === "OPEN"
                                  ? "IN_PROGRESS"
                                  : report.status,
                            })
                          }
                        >
                          <option value="">Unassigned</option>
                          {volunteers.map((v) => (
                            <option
                              key={v.id}
                              value={`${v.name} (${v.badge_code})`}
                            >
                              {v.name} ({v.badge_code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          aria-label={`Status for ${report.facility_name}`}
                          value={report.status}
                          disabled={savingId === report.id}
                          onChange={(e) =>
                            void handleReportUpdate(report.id, {
                              status: e.target
                                .value as MobileFacilityReport["status"],
                            })
                          }
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="FIXED">FIXED</option>
                        </select>
                      </td>
                      <td>{new Date(report.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === "queues" && (
        <div className="content-panel table-card">
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Gate / Point</th>
                  <th>Category</th>
                  <th>Wait (min)</th>
                  <th>Active Lanes</th>
                  <th>Trend</th>
                  <th>Fastest</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queueGates.map((gate) => {
                  const draft = gateDrafts[gate.id] ?? {
                    wait_minutes: gate.wait_minutes,
                    active_lanes: gate.active_lanes,
                    trend: gate.trend,
                    is_fastest: gate.is_fastest,
                  };
                  return (
                    <tr key={gate.id}>
                      <td>
                        <strong>{gate.name}</strong>
                        <span className="table-description">{gate.sector}</span>
                      </td>
                      <td>
                        <span className="status-badge status-draft">
                          {gate.category.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <input
                          className="ops-inline-input"
                          type="number"
                          min={0}
                          max={240}
                          aria-label={`Wait minutes for ${gate.name}`}
                          value={draft.wait_minutes}
                          onChange={(e) =>
                            setGateDrafts((prev) => ({
                              ...prev,
                              [gate.id]: {
                                ...draft,
                                wait_minutes: Number(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <div className="ops-lanes-input">
                          <input
                            className="ops-inline-input"
                            type="number"
                            min={0}
                            max={gate.total_lanes}
                            aria-label={`Active lanes for ${gate.name}`}
                            value={draft.active_lanes}
                            onChange={(e) =>
                              setGateDrafts((prev) => ({
                                ...prev,
                                [gate.id]: {
                                  ...draft,
                                  active_lanes: Number(e.target.value) || 0,
                                },
                              }))
                            }
                          />
                          <span>/ {gate.total_lanes}</span>
                        </div>
                      </td>
                      <td>
                        <select
                          aria-label={`Trend for ${gate.name}`}
                          value={draft.trend}
                          onChange={(e) =>
                            setGateDrafts((prev) => ({
                              ...prev,
                              [gate.id]: {
                                ...draft,
                                trend: e.target.value as GateDraft["trend"],
                              },
                            }))
                          }
                        >
                          <option value="falling">falling</option>
                          <option value="stable">stable</option>
                          <option value="rising">rising</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Fastest gate toggle for ${gate.name}`}
                          checked={draft.is_fastest}
                          onChange={(e) =>
                            setGateDrafts((prev) => ({
                              ...prev,
                              [gate.id]: {
                                ...draft,
                                is_fastest: e.target.checked,
                              },
                            }))
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="primary-button"
                          disabled={savingId === gate.id}
                          onClick={() => void handleSaveGate(gate)}
                        >
                          {savingId === gate.id ? "Saving..." : "Update"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && activeTab === "community" && (
        <div className="ops-split-grid">
          <div className="content-panel create-panel">
            <h2>Add Field Volunteer</h2>
            <form className="admin-form" onSubmit={handleAddVolunteer}>
              <div className="form-grid">
                <label>
                  Badge Code
                  <input
                    value={badgeCode}
                    onChange={(e) => setBadgeCode(e.target.value)}
                    placeholder="VOL-103"
                    required
                  />
                </label>
                <label>
                  PIN
                  <input
                    value={volunteerPin}
                    onChange={(e) => setVolunteerPin(e.target.value)}
                    placeholder="1234"
                    required
                  />
                </label>
                <label>
                  Full Name
                  <input
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="Rohan Kulkarni"
                    required
                  />
                </label>
                <label>
                  Role Title
                  <input
                    value={volunteerRole}
                    onChange={(e) => setVolunteerRole(e.target.value)}
                    placeholder="Sector Marshal"
                  />
                </label>
                <label>
                  Assigned Sector
                  <input
                    value={volunteerSector}
                    onChange={(e) => setVolunteerSector(e.target.value)}
                    placeholder="Sector 4 Promenade"
                  />
                </label>
                <label>
                  Phone (optional)
                  <input
                    value={volunteerPhone}
                    onChange={(e) => setVolunteerPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                  />
                </label>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingId === "new-volunteer"}
                >
                  {savingId === "new-volunteer"
                    ? "Adding..."
                    : "Add Volunteer"}
                </button>
              </div>
            </form>

            <h3 className="ops-subheading">Field Volunteers</h3>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Badge</th>
                    <th>Volunteer</th>
                    <th>Sector</th>
                    <th>PIN</th>
                    <th>Duty Status</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <strong>{v.badge_code}</strong>
                      </td>
                      <td>
                        <strong>{v.name}</strong>
                        <span className="table-description">
                          {v.role_title}
                        </span>
                      </td>
                      <td>{v.assigned_sector}</td>
                      <td>
                        <code>{v.pin}</code>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={savingId === v.id}
                          onClick={async () => {
                            setSavingId(v.id);
                            await updateVolunteer(v.id, {
                              on_duty: !v.on_duty,
                            });
                            await loadAll();
                            setSavingId(null);
                          }}
                        >
                          {v.on_duty ? "On Duty" : "Off Duty"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="content-panel table-card">
            <h2 className="section-title">Quiet Spot Reservations</h2>
            {reservations.length === 0 ? (
              <div className="empty-state">
                <h2>No reservations yet</h2>
                <p>
                  Quiet Ghat spot bookings from the mobile Home screen will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Party Size</th>
                      <th>Zone</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong>{booking.visitor_name}</strong>
                          <span className="table-description">
                            {new Date(booking.created_at).toLocaleString()}
                          </span>
                        </td>
                        <td>{booking.people_count} people</td>
                        <td>{booking.zone_name}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              booking.status === "CONFIRMED"
                                ? "status-live"
                                : "status-cancelled"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="text-button"
                            onClick={async () => {
                              await updateQuietReservation(
                                booking.id,
                                booking.status === "CONFIRMED"
                                  ? "CANCELLED"
                                  : "CONFIRMED",
                              );
                              await loadAll();
                            }}
                          >
                            {booking.status === "CONFIRMED"
                              ? "Cancel"
                              : "Restore"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
