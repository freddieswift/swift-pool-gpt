import { Router } from "express";
import {
  getMatchResult,
  listMatchResultAudits,
  reopenMatchResult,
  submitMatchResult
} from "../controllers/result.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadMatch,
  requireMatchLeagueAdmin
} from "../middleware/match.middleware.js";
import { validate } from "../middleware/validate.js";
import { matchIdParamsSchema } from "../validators/match.validator.js";
import {
  reopenMatchSchema,
  submitMatchResultSchema
} from "../validators/result.validator.js";

const router = Router();

router.use(requireAuth);
router.get(
  "/:matchId/result",
  validate(matchIdParamsSchema, "params"),
  loadMatch,
  requireMatchLeagueAdmin,
  getMatchResult
);
router.put(
  "/:matchId/result",
  validate(matchIdParamsSchema, "params"),
  loadMatch,
  requireMatchLeagueAdmin,
  verifyCsrf,
  validate(submitMatchResultSchema),
  submitMatchResult
);
router.post(
  "/:matchId/result/reopen",
  validate(matchIdParamsSchema, "params"),
  loadMatch,
  requireMatchLeagueAdmin,
  verifyCsrf,
  validate(reopenMatchSchema),
  reopenMatchResult
);
router.get(
  "/:matchId/result/audits",
  validate(matchIdParamsSchema, "params"),
  loadMatch,
  requireMatchLeagueAdmin,
  listMatchResultAudits
);

export default router;
