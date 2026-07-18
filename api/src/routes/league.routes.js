import { Router } from "express";
import {
  addLeagueAdmin,
  createLeague,
  createMatchFormat,
  deleteLeague,
  deleteMatchFormat,
  getLeague,
  getLeagueSettings,
  listLeagueAdmins,
  listLeagues,
  listMatchFormats,
  removeLeagueAdmin,
  updateLeague,
  updateLeagueAdmin,
  updateLeagueSettings,
  updateMatchFormat
} from "../controllers/league.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadLeague,
  loadMatchFormat,
  requireLeagueAdmin,
  requireLeagueOwner,
  requireMatchFormatLeagueAdmin
} from "../middleware/league.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  addLeagueAdminSchema,
  adminParamsSchema,
  createLeagueSchema,
  createMatchFormatSchema,
  leagueIdParamsSchema,
  matchFormatParamsSchema,
  updateLeagueAdminSchema,
  updateLeagueSchema,
  updateLeagueSettingsSchema,
  updateMatchFormatSchema
} from "../validators/league.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/", listLeagues);
router.post("/", verifyCsrf, validate(createLeagueSchema), createLeague);

router.get(
  "/:leagueId",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  getLeague
);
router.patch(
  "/:leagueId",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  verifyCsrf,
  validate(updateLeagueSchema),
  updateLeague
);
router.delete(
  "/:leagueId",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueOwner,
  verifyCsrf,
  deleteLeague
);

router.get(
  "/:leagueId/admins",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  listLeagueAdmins
);
router.post(
  "/:leagueId/admins",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueOwner,
  verifyCsrf,
  validate(addLeagueAdminSchema),
  addLeagueAdmin
);
router.patch(
  "/:leagueId/admins/:userId",
  validate(adminParamsSchema, "params"),
  loadLeague,
  requireLeagueOwner,
  verifyCsrf,
  validate(updateLeagueAdminSchema),
  updateLeagueAdmin
);
router.delete(
  "/:leagueId/admins/:userId",
  validate(adminParamsSchema, "params"),
  loadLeague,
  requireLeagueOwner,
  verifyCsrf,
  removeLeagueAdmin
);

router.get(
  "/:leagueId/settings",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  getLeagueSettings
);
router.patch(
  "/:leagueId/settings",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  verifyCsrf,
  validate(updateLeagueSettingsSchema),
  updateLeagueSettings
);

router.get(
  "/:leagueId/match-formats",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  listMatchFormats
);
router.post(
  "/:leagueId/match-formats",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  verifyCsrf,
  validate(createMatchFormatSchema),
  createMatchFormat
);

export default router;

export const matchFormatRouter = Router();

matchFormatRouter.use(requireAuth);
matchFormatRouter.patch(
  "/:matchFormatId",
  validate(matchFormatParamsSchema, "params"),
  loadMatchFormat,
  requireMatchFormatLeagueAdmin,
  verifyCsrf,
  validate(updateMatchFormatSchema),
  updateMatchFormat
);
matchFormatRouter.delete(
  "/:matchFormatId",
  validate(matchFormatParamsSchema, "params"),
  loadMatchFormat,
  requireMatchFormatLeagueAdmin,
  verifyCsrf,
  deleteMatchFormat
);
