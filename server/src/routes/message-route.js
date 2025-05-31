import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message-controller.js";
import isAuthenticated from "../middlewares/auth-middleware.js";

const router = Router();

router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/:id").get(isAuthenticated, getMessages);

export default router;
