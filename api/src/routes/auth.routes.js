import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  changePassword,
  login,
  logout,
  me,
  register,
  updateMe
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { issueCsrfToken, verifyCsrf } from "../middleware/csrf.js";
import { validate } from "../middleware/validate.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateMeSchema
} from "../validators/auth.validator.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many attempts; try again later" } }
});

router.get("/csrf-token", issueCsrfToken);
router.post("/register", authLimiter, verifyCsrf, validate(registerSchema), register);
router.post("/login", authLimiter, verifyCsrf, validate(loginSchema), login);
router.post("/logout", requireAuth, verifyCsrf, logout);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, verifyCsrf, validate(updateMeSchema), updateMe);
router.post(
  "/change-password",
  requireAuth,
  verifyCsrf,
  validate(changePasswordSchema),
  changePassword
);

export default router;
