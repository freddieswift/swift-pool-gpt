import Joi from "joi";
import { MATCH_STATUSES } from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });

export const matchIdParamsSchema = Joi.object({
  matchId: uuid.required()
});

export const listMatchesQuerySchema = Joi.object({
  divisionId: uuid,
  status: Joi.string().valid(...Object.values(MATCH_STATUSES)),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from"))
});

export const generateFixturesSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  kickoffTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .default("19:30"),
  intervalDays: Joi.number().integer().min(1).max(60).default(7),
  replaceExisting: Joi.boolean().default(false)
});

export const createMatchSchema = Joi.object({
  divisionId: uuid.required(),
  homeSeasonTeamId: uuid.required(),
  awaySeasonTeamId: uuid.invalid(Joi.ref("homeSeasonTeamId")).required(),
  roundNumber: Joi.number().integer().min(1).max(999).required(),
  legNumber: Joi.number().integer().min(1).max(20).default(1),
  scheduledAt: Joi.date().iso().required(),
  venueName: Joi.string().trim().max(160).allow(null, ""),
  notes: Joi.string().trim().max(5000).allow(null, "")
});

export const updateMatchSchema = Joi.object({
  scheduledAt: Joi.date().iso(),
  venueName: Joi.string().trim().max(160).allow(null, ""),
  status: Joi.string().valid(...Object.values(MATCH_STATUSES)),
  postponedReason: Joi.string().trim().max(500).allow(null, ""),
  notes: Joi.string().trim().max(5000).allow(null, "")
})
  .min(1)
  .custom((value, helpers) => {
    if (value.status === MATCH_STATUSES.POSTPONED && !value.postponedReason) {
      return helpers.message({
        custom: "postponedReason is required when postponing a match"
      });
    }
    return value;
  });
