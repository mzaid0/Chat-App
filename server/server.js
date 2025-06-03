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

// ✅ CORS allowed origins
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://chat-app-mg5l.vercel.app", // Deployed frontend
];

// ✅ CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Optional: handle preflight
app.options("*", cors());

// Middleware
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

// ✅ Keep your condition: only listen when NOT in production
connectDB()
  .then(() => {
    if (NODE_ENV !== "production") {
      server.listen(PORT, () => {
        console.log(
          chalk.greenBright(`✅ Server running on port ${PORT} [${NODE_ENV}]`)
        );
      });
    } else {
      console.log(chalk.yellow("⚠️ Server not started in production mode."));
    }
  })
  .catch((err) => {
    console.error(chalk.redBright(`❌ DB Connection Failed: ${err.message}`));
    process.exit(1);
  });

export default server;
