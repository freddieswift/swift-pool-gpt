import Joi from "joi";
import { SEASON_TEAM_STATUSES } from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });

export const teamIdParamsSchema = Joi.object({
  teamId: uuid.required()
});

export const seasonTeamIdParamsSchema = Joi.object({
  seasonTeamId: uuid.required()
});

export const listTeamsQuerySchema = Joi.object({
  includeInactive: Joi.boolean().default(false)
});

export const createTeamSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  shortName: Joi.string().trim().min(2).max(30).allow(null, ""),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  venueName: Joi.string().trim().max(160).allow(null, ""),
  venueAddress: Joi.string().trim().max(2000).allow(null, ""),
  contactEmail: Joi.string().trim().lowercase().email().max(254).allow(null, ""),
  contactPhone: Joi.string().trim().max(40).allow(null, ""),
  isActive: Joi.boolean().default(true)
});

export const updateTeamSchema = createTeamSchema
  .fork(["name"], (schema) => schema.optional())
  .min(1);

export const registerSeasonTeamSchema = Joi.object({
  teamId: uuid.required(),
  divisionId: uuid.allow(null),
  status: Joi.string()
    .valid(...Object.values(SEASON_TEAM_STATUSES))
    .default(SEASON_TEAM_STATUSES.PENDING),
  seed: Joi.number().integer().min(1).max(999).allow(null),
  pointsAdjustment: Joi.number().precision(2).min(-9999).max(9999).default(0),
  adjustmentReason: Joi.string().trim().max(500).allow(null, "")
}).custom((value, helpers) => {
  if (value.pointsAdjustment !== 0 && !value.adjustmentReason) {
    return helpers.message({
      custom: "adjustmentReason is required when pointsAdjustment is non-zero"
    });
  }
  return value;
});

export const updateSeasonTeamSchema = Joi.object({
  divisionId: uuid.allow(null),
  status: Joi.string().valid(...Object.values(SEASON_TEAM_STATUSES)),
  seed: Joi.number().integer().min(1).max(999).allow(null),
  pointsAdjustment: Joi.number().precision(2).min(-9999).max(9999),
  adjustmentReason: Joi.string().trim().max(500).allow(null, "")
})
  .min(1)
  .custom((value, helpers) => {
    if (
      value.pointsAdjustment !== undefined &&
      value.pointsAdjustment !== 0 &&
      !value.adjustmentReason
    ) {
      return helpers.message({
        custom: "adjustmentReason is required when pointsAdjustment is non-zero"
      });
    }
    return value;
  });
