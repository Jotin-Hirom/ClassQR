import cron from "node-cron";
import { cleanupOldRefreshTokens } from "../services/auth.service.js";

cron.schedule("0 3 * * *", async () => {
  console.log("Cleaning old refresh tokens...");
  await cleanupOldRefreshTokens();
  console.log("Done.");
});
// This cron job runs daily at 3 AM and removes revoked refresh tokens older than 5 days.