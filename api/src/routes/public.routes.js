import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getPublicLeague,
  getPublicMatch,
  getPublicMatches,
  getPublicPlayerStatistics,
  getPublicRoster,
  getPublicSeason,
  getPublicStandings,
  getPublicTeams
} from "../controllers/public.controller.js";
import {
  loadPublicLeague,
  loadPublicSeason,
  publicCache
} from "../middleware/public.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  publicLeagueParamsSchema,
  publicMatchParamsSchema,
  publicMatchesQuerySchema,
  publicSeasonParamsSchema,
  publicStatisticsQuerySchema
} from "../validators/public.validator.js";

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

export const publicRouter = Router();

publicRouter.use(publicLimiter);
publicRouter.use(publicCache(60));

publicRouter.get(
  "/leagues/:leagueSlug",
  validate(publicLeagueParamsSchema, "params"),
  loadPublicLeague,
  getPublicLeague
);

publicRouter.get(
  "/leagues/:leagueSlug/seasons/:seasonSlug",
  validate(publicSeasonParamsSchema, "params"),
  loadPublicLeague,
  loadPublicSeason,
  getPublicSeason
);

publicRouter.get(
  "/leagues/:leagueSlug/seasons/:seasonSlug/teams",
  validate(publicSeasonParamsSchema, "params"),
  loadPublicLeague,
  loadPublicSeason,
  getPublicTeams
);

publicRouter.get(
  "/leagues/:leagueSlug/seasons/:seasonSlug/roster",
  validate(publicSeasonParamsSchema, "params"),
  loadPublicLeague,
  loadPublicSeason,
  getPublicRoster
);

publicRouter.get(
  "/leagues/:leagueSlug/seasons/:seasonSlug/matches",
  validate(publicSeasonParamsSchema, "params"),
  loadPublicLeague,
  loadPublicSeason,
  validate(publicMatchesQuerySchema, "query"),
  getPublicMatches
);

publicRouter.get(
  "/leagues/:leagueSlug/seasons/:seasonSlug/matches/:matchId",
  validate(publicMatchParamsSchema, "params"),
  loadPublicLeague,
  loadPublicSeason,
  getPublicMatch
);

publicRouter.get(
  "/leagues/:leagueSlug/seasons/:seasonSlug/standings",
  validate(publicSeasonParamsSchema, "params"),
  loadPublicLeague,
  loadPublicSeason,
  getPublicStandings
);

publicRouter.get(
  "/leagues/:leagueSlug/seasons/:seasonSlug/statistics/players",
  validate(publicSeasonParamsSchema, "params"),
  loadPublicLeague,
  loadPublicSeason,
  validate(publicStatisticsQuerySchema, "query"),
  getPublicPlayerStatistics
);
