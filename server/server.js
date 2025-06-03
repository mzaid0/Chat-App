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

// Initialize socket.io
initializeSocket(server);

// Middleware
app.use(cors({ origin:"https://chat-app-mg5l.vercel.app", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoute);

// Health check route
app.get("/", (req, res) => {
  res.send("🚀 Chat Backend Server is Running Successfully!");
});

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";

// Connect to DB and start server only if not explicitly blocked
connectDB()
  .then(() => {
    if (NODE_ENV !== "production") {
      server.listen(PORT, () => {
        console.log(
          chalk.greenBright(`✅ Server running on port ${PORT} [${NODE_ENV}]`)
        );
      });
    } else {
      console.log(chalk.yellow("⚠️ Server not started in test mode."));
    }
  })
  .catch((err) => {
    console.error(chalk.redBright(`❌ DB Connection Failed: ${err.message}`));
    process.exit(1);
  });

export default server;
