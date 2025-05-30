import express from "express";
import {
  register,
  login,
  logout,
  getOtherUsers,
} from "../controllers/auth-controller.js";
import isAuthenticated from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/all", isAuthenticated, getOtherUsers);
router.post("/logout", isAuthenticated, logout);

export default router;
