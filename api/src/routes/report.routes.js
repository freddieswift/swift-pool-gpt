import { Router } from "express";
import {
  getFixturesReport,
  getLeagueActivity,
  getLeagueDashboard,
  getResultsReport,
  getSeasonDashboard,
  getStandingsReport
} from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  loadLeague,
  requireLeagueAdmin
} from "../middleware/league.middleware.js";
import {
  loadSeason,
  requireSeasonLeagueAdmin
} from "../middleware/season.middleware.js";
import { validate } from "../middleware/validate.js";
import { leagueIdParamsSchema } from "../validators/league.validator.js";
import { seasonIdParamsSchema } from "../validators/season.validator.js";
import {
  dashboardQuerySchema,
  reportQuerySchema
} from "../validators/report.validator.js";

export const leagueReportRouter = Router({ mergeParams: true });
leagueReportRouter.use(requireAuth);
leagueReportRouter.get(
  "/dashboard",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  getLeagueDashboard
);
leagueReportRouter.get(
  "/activity",
  validate(leagueIdParamsSchema, "params"),
  loadLeague,
  requireLeagueAdmin,
  getLeagueActivity
);

export const seasonReportRouter = Router({ mergeParams: true });
seasonReportRouter.use(requireAuth);
seasonReportRouter.get(
  "/dashboard",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(dashboardQuerySchema, "query"),
  getSeasonDashboard
);
seasonReportRouter.get(
  "/fixtures",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(reportQuerySchema, "query"),
  getFixturesReport
);
seasonReportRouter.get(
  "/results",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(reportQuerySchema, "query"),
  getResultsReport
);
seasonReportRouter.get(
  "/standings",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(reportQuerySchema, "query"),
  getStandingsReport
);
