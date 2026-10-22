import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes.js";
import crowdRoutes from "./modules/crowd/crowd.routes.js";

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
export default app;