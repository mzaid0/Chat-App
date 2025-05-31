import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/auth-route.js";
import messageRoute from "./src/routes/message-route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoute);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        chalk.yellowBright(`✅ Server running on http://localhost:${PORT}`)
      );
    });
  })
  .catch((err) => {
    console.error(chalk.redBright(`❌ DB Connection Failed: ${err.message}`));
    process.exit(1);
  });
