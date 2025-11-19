import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";


const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api", router);

// Health check endpoint 
app.get("/", (req, res) => {
  res.json({ status: "ClassQR API running ... " });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);

export default app;
