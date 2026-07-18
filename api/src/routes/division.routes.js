import { Router } from "express";
import {
  createDivision,
  deleteDivision,
  getDivision,
  listDivisions,
  reorderDivisions,
  updateDivision
} from "../controllers/division.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadDivision,
  requireDivisionLeagueAdmin
} from "../middleware/division.middleware.js";
import {
  loadSeason,
  requireSeasonLeagueAdmin
} from "../middleware/season.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  createDivisionSchema,
  divisionIdParamsSchema,
  reorderDivisionsSchema,
  updateDivisionSchema
} from "../validators/division.validator.js";
import { seasonIdParamsSchema } from "../validators/season.validator.js";

export const seasonDivisionRouter = Router({ mergeParams: true });

seasonDivisionRouter.use(requireAuth);

seasonDivisionRouter.get(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  listDivisions
);

seasonDivisionRouter.post(
  "/",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(createDivisionSchema),
  createDivision
);

seasonDivisionRouter.put(
  "/order",
  validate(seasonIdParamsSchema, "params"),
  loadSeason,
  requireSeasonLeagueAdmin,
  verifyCsrf,
  validate(reorderDivisionsSchema),
  reorderDivisions
);

const divisionRouter = Router();

divisionRouter.use(requireAuth);

divisionRouter.get(
  "/:divisionId",
  validate(divisionIdParamsSchema, "params"),
  loadDivision,
  requireDivisionLeagueAdmin,
  getDivision
);

divisionRouter.patch(
  "/:divisionId",
  validate(divisionIdParamsSchema, "params"),
  loadDivision,
  requireDivisionLeagueAdmin,
  verifyCsrf,
  validate(updateDivisionSchema),
  updateDivision
);

divisionRouter.delete(
  "/:divisionId",
  validate(divisionIdParamsSchema, "params"),
  loadDivision,
  requireDivisionLeagueAdmin,
  verifyCsrf,
  deleteDivision
);

export default divisionRouter;
