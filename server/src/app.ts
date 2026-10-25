import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import crowdRoutes from "./modules/crowd/crowd.routes.js";
import eventRoutes from "./modules/event/event.routes.js";
import venueRoutes from "./modules/venue/venue.routes.js";
import zoneRoutes from "./modules/zone/zone.routes.js";
import locationRoutes from "./modules/location/location.routes.js";
import facilityRoutes from "./modules/facility/facility.routes.js";
import preferencesRoutes from "./modules/preferences/preferences.routes.js";
import incidentRoutes from "./modules/incident/incident.routes.js";
import announcementRoutes from "./modules/announcement/announcement.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import brandRoutes from "./modules/brand/brand.routes.js";
import offerRoutes from "./modules/offer/offer.routes.js";
import interactionRoutes from "./modules/interaction/interaction.routes.js";
import consumerInsightsRoutes from "./modules/consumer-insights/consumer-insights.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({
    success: true,
    message: "EventFlow AI API is running",
  });
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/crowd", crowdRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1", venueRoutes);
app.use("/api/v1", zoneRoutes);
app.use("/api/v1", locationRoutes);
app.use("/api/v1", facilityRoutes);
app.use("/api/v1/preferences", preferencesRoutes);
app.use("/api/v1", incidentRoutes);
app.use("/api/v1", announcementRoutes);
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1", brandRoutes);
app.use("/api/v1", offerRoutes);
app.use("/api/v1", interactionRoutes);
app.use("/api/v1", consumerInsightsRoutes);
export default app;