import { Router } from "express";
import {
  createMatch,
  deleteMatch,
  generateFixtures,
  getMatch,
  listMatches,
  updateMatch
} from "../controllers/match.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadDivision,
  requireDivisionLeagueAdmin
} from "../middleware/division.middleware.js";
import {
  loadMatch,
  requireMatchLeagueAdmin
} from "../middleware/match.middleware.js";
import {
  loadSeason,
  requireSeasonLeagueAdmin
} from "../middleware/season.middleware.js";
import { validate } from "../middleware/validate.js";
import { divisionIdParamsSchema } from "../validators/division.validator.js";
import {
  createMatchSchema,
  generateFixturesSchema,
  listMatchesQuerySchema,
  matchIdParamsSchema,
  updateMatchSchema
} from "../validators/match.validator.js";
import { seasonIdParamsSchema } from "../validators/season.validator.js";

export const seasonMatchRouter = Router({ mergeParams: true });
seasonMatchRouter.use(requireAuth);
seasonMatchRouter.get(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  validate(listMatchesQuerySchema, "query"),
  listMatches
);
seasonMatchRouter.post(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(createMatchSchema),
  createMatch
);

export const divisionFixtureRouter = Router({ mergeParams: true });
divisionFixtureRouter.use(requireAuth);
divisionFixtureRouter.post(
  "/generate",
  validate(divisionIdParamsSchema, "params"),
  loadDivision,
  requireDivisionLeagueAdmin,
  verifyCsrf,
  validate(generateFixturesSchema),
  generateFixtures
);

const matchRouter = Router();
matchRouter.use(requireAuth);
matchRouter.get(
  "/:matchId",
  validate(matchIdParamsSchema, "params"),
  loadMatch,
  requireMatchLeagueAdmin,
  getMatch
);
matchRouter.patch(
  "/:matchId",
  validate(matchIdParamsSchema, "params"),
  loadMatch,
  requireMatchLeagueAdmin,
  verifyCsrf,
  validate(updateMatchSchema),
  updateMatch
);
matchRouter.delete(
  "/:matchId",
  validate(matchIdParamsSchema, "params"),
  loadMatch,
  requireMatchLeagueAdmin,
  verifyCsrf,
  deleteMatch
);

export default matchRouter;
