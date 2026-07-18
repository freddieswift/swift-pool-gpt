import { Router } from "express";
import {
  applyTransitionPlan,
  approveTransitionPlan,
  cancelTransitionPlan,
  generateTransitionPlan,
  getTransitionPlan,
  listTransitionAudits,
  listTransitionPlans,
  replaceTransitionEntries
} from "../controllers/transition.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import { loadSeason, requireSeasonLeagueAdmin } from "../middleware/season.middleware.js";
import {
  loadTransitionPlan,
  requireTransitionLeagueAdmin
} from "../middleware/transition.middleware.js";
import { validate } from "../middleware/validate.js";
import { seasonIdParamsSchema } from "../validators/season.validator.js";
import {
  createTransitionPlanSchema,
  replaceTransitionEntriesSchema,
  transitionActionSchema,
  transitionPlanIdParamsSchema
} from "../validators/transition.validator.js";

export const seasonTransitionRouter = Router({ mergeParams: true });
seasonTransitionRouter.use(requireAuth);
seasonTransitionRouter.get(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  listTransitionPlans
);
seasonTransitionRouter.post(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(createTransitionPlanSchema),
  generateTransitionPlan
);

export const transitionPlanRouter = Router();
transitionPlanRouter.use(requireAuth);
transitionPlanRouter.get(
  "/:planId",
  validate(transitionPlanIdParamsSchema, "params"),
  loadTransitionPlan,
  requireTransitionLeagueAdmin,
  getTransitionPlan
);
transitionPlanRouter.put(
  "/:planId/entries",
  validate(transitionPlanIdParamsSchema, "params"),
  loadTransitionPlan,
  requireTransitionLeagueAdmin,
  verifyCsrf,
  validate(replaceTransitionEntriesSchema),
  replaceTransitionEntries
);
transitionPlanRouter.post(
  "/:planId/approve",
  validate(transitionPlanIdParamsSchema, "params"),
  loadTransitionPlan,
  requireTransitionLeagueAdmin,
  verifyCsrf,
  validate(transitionActionSchema),
  approveTransitionPlan
);
transitionPlanRouter.post(
  "/:planId/apply",
  validate(transitionPlanIdParamsSchema, "params"),
  loadTransitionPlan,
  requireTransitionLeagueAdmin,
  verifyCsrf,
  validate(transitionActionSchema),
  applyTransitionPlan
);
transitionPlanRouter.post(
  "/:planId/cancel",
  validate(transitionPlanIdParamsSchema, "params"),
  loadTransitionPlan,
  requireTransitionLeagueAdmin,
  verifyCsrf,
  validate(transitionActionSchema),
  cancelTransitionPlan
);
transitionPlanRouter.get(
  "/:planId/audits",
  validate(transitionPlanIdParamsSchema, "params"),
  loadTransitionPlan,
  requireTransitionLeagueAdmin,
  listTransitionAudits
);
