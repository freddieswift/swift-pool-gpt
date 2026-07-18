import { Router } from "express";
import {
  createSeason,
  deleteSeason,
  getSeason,
  listSeasons,
  updateSeason,
  updateSeasonStatus
} from "../controllers/season.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadLeague,
  requireLeagueAdmin
} from "../middleware/league.middleware.js";
import {
  loadSeason,
  requireSeasonLeagueAdmin
} from "../middleware/season.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  createSeasonSchema,
  listSeasonsQuerySchema,
  seasonIdParamsSchema,
  updateSeasonSchema,
  updateSeasonStatusSchema
} from "../validators/season.validator.js";
import { leagueIdParamsSchema } from "../validators/league.validator.js";

export const leagueSeasonRouter = Router({ mergeParams: true });

leagueSeasonRouter.use(requireAuth);
leagueSeasonRouter.get(
  "/",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  validate(listSeasonsQuerySchema, "query"),
  listSeasons
);
leagueSeasonRouter.post(
  "/",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  verifyCsrf,
  validate(createSeasonSchema),
  createSeason
);

const seasonRouter = Router();

seasonRouter.use(requireAuth);
seasonRouter.get(
  "/:seasonId",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  getSeason
);
seasonRouter.patch(
  "/:seasonId",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(updateSeasonSchema),
  updateSeason
);
seasonRouter.patch(
  "/:seasonId/status",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(updateSeasonStatusSchema),
  updateSeasonStatus
);
seasonRouter.delete(
  "/:seasonId",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  deleteSeason
);

export default seasonRouter;
