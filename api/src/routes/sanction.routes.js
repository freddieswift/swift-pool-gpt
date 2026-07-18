import { Router } from "express";
import {
  createSanctionAppeal,
  getSanction,
  issuePlayerSanction,
  listPlayerSanctions,
  listSanctionAppeals,
  listSanctionAudits,
  resolveSanctionAppeal,
  revokeSanction,
  updateSanction,
  withdrawSanctionAppeal
} from "../controllers/sanction.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { verifyCsrf } from "../middleware/csrf.js";
import {
  loadPlayer,
  requirePlayerLeagueAdmin
} from "../middleware/player.middleware.js";
import {
  loadAppeal,
  loadSanction,
  requireSanctionLeagueAdmin
} from "../middleware/sanction.middleware.js";
import { validate } from "../middleware/validate.js";
import { playerIdParamsSchema } from "../validators/player.validator.js";
import {
  appealIdParamsSchema,
  createAppealSchema,
  createSanctionSchema,
  listSanctionsQuerySchema,
  resolveAppealSchema,
  revokeSanctionSchema,
  sanctionIdParamsSchema,
  updateSanctionSchema,
  withdrawAppealSchema
} from "../validators/sanction.validator.js";

export const playerSanctionRouter = Router({ mergeParams: true });
playerSanctionRouter.use(requireAuth);
playerSanctionRouter.get(
  "/",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  validate(listSanctionsQuerySchema, "query"),
  listPlayerSanctions
);
playerSanctionRouter.post(
  "/",
  validate(playerIdParamsSchema, "params"),
  loadPlayer,
  requirePlayerLeagueAdmin,
  verifyCsrf,
  validate(createSanctionSchema),
  issuePlayerSanction
);

export const sanctionRouter = Router();
sanctionRouter.use(requireAuth);
sanctionRouter.get(
  "/:sanctionId",
  validate(sanctionIdParamsSchema, "params"),
  loadSanction,
  requireSanctionLeagueAdmin,
  getSanction
);
sanctionRouter.patch(
  "/:sanctionId",
  validate(sanctionIdParamsSchema, "params"),
  loadSanction,
  requireSanctionLeagueAdmin,
  verifyCsrf,
  validate(updateSanctionSchema),
  updateSanction
);
sanctionRouter.post(
  "/:sanctionId/revoke",
  validate(sanctionIdParamsSchema, "params"),
  loadSanction,
  requireSanctionLeagueAdmin,
  verifyCsrf,
  validate(revokeSanctionSchema),
  revokeSanction
);
sanctionRouter.get(
  "/:sanctionId/appeals",
  validate(sanctionIdParamsSchema, "params"),
  loadSanction,
  requireSanctionLeagueAdmin,
  listSanctionAppeals
);
sanctionRouter.post(
  "/:sanctionId/appeals",
  validate(sanctionIdParamsSchema, "params"),
  loadSanction,
  verifyCsrf,
  validate(createAppealSchema),
  createSanctionAppeal
);
sanctionRouter.get(
  "/:sanctionId/audits",
  validate(sanctionIdParamsSchema, "params"),
  loadSanction,
  requireSanctionLeagueAdmin,
  listSanctionAudits
);

export const appealRouter = Router();
appealRouter.use(requireAuth);
appealRouter.post(
  "/:appealId/resolve",
  validate(appealIdParamsSchema, "params"),
  loadAppeal,
  requireSanctionLeagueAdmin,
  verifyCsrf,
  validate(resolveAppealSchema),
  resolveSanctionAppeal
);
appealRouter.post(
  "/:appealId/withdraw",
  validate(appealIdParamsSchema, "params"),
  loadAppeal,
  verifyCsrf,
  validate(withdrawAppealSchema),
  withdrawSanctionAppeal
);
