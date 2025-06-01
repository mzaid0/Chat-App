import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth-route.js";
import messageRoute from "./src/routes/message-route.js";
import { initializeSocket } from "./src/services/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoute);

const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => {
    server.listen(PORT, () => {});
  })
  .catch((err) => {
    console.error(chalk.redBright(`❌ DB Connection Failed: ${err.message}`));
    process.exit(1);
  });
