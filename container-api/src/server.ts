import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import chatRouter from "./routes/chat";

// Prevent unhandled Promise rejections from crashing the process
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection (caught):", err);
});

const app = express();

// CORS — allow SWA domain + localhost for dev
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse JSON bodies (with generous limit for file uploads)
app.use(express.json({ limit: "10mb" }));

// Routes — all under /api to match the SWA convention
app.use("/api", healthRouter);
app.use("/api", chatRouter);

const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, () => {
  console.log(`PM Studio API listening on port ${port}`);
  console.log(`  Health: http://localhost:${port}/api/health`);
  console.log(`  Chat:   http://localhost:${port}/api/chat`);
});
