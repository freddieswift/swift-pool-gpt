import Joi from "joi";
import {
  HANDICAP_METHODS,
  LEAGUE_ADMIN_ROLES,
  SCORING_METHODS
} from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });

export const leagueIdParamsSchema = Joi.object({
  leagueId: uuid.required()
});

export const adminParamsSchema = Joi.object({
  leagueId: uuid.required(),
  userId: uuid.required()
});

export const matchFormatParamsSchema = Joi.object({
  matchFormatId: uuid.required()
});

export const createLeagueSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  description: Joi.string().trim().max(5000).allow(null, "")
});

export const updateLeagueSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  description: Joi.string().trim().max(5000).allow(null, ""),
  isActive: Joi.boolean()
}).min(1);

export const addLeagueAdminSchema = Joi.object({
  userId: uuid.required(),
  role: Joi.string()
    .valid(LEAGUE_ADMIN_ROLES.OWNER, LEAGUE_ADMIN_ROLES.ADMIN)
    .default(LEAGUE_ADMIN_ROLES.ADMIN)
});

export const updateLeagueAdminSchema = Joi.object({
  role: Joi.string()
    .valid(LEAGUE_ADMIN_ROLES.OWNER, LEAGUE_ADMIN_ROLES.ADMIN)
    .required()
});

export const updateLeagueSettingsSchema = Joi.object({
  handicapEnabled: Joi.boolean(),
  handicapMethod: Joi.string().valid(...Object.values(HANDICAP_METHODS)),
  allowCaptainRosterManagement: Joi.boolean(),
  allowCaptainResultEditing: Joi.boolean(),
  resultsRequireApproval: Joi.boolean(),
  publicEnabled: Joi.boolean(),
  publicRosterNames: Joi.boolean(),
  publicPlayerStatistics: Joi.boolean(),
  publicVenueAddresses: Joi.boolean()
})
  .min(1)
  .custom((value, helpers) => {
    if (value.handicapEnabled === false && value.handicapMethod && value.handicapMethod !== "NONE") {
      return helpers.error("any.custom", {
        message: "handicapMethod must be NONE when handicapEnabled is false"
      });
    }

    if (value.handicapEnabled === true && value.handicapMethod === "NONE") {
      return helpers.error("any.custom", {
        message: "Choose PLAYER or TEAM when handicap is enabled"
      });
    }

    return value;
  });

const scoringFields = {
  pointsPerFrame: Joi.number().min(0).precision(2).allow(null),
  winPoints: Joi.number().min(0).precision(2).allow(null),
  drawPoints: Joi.number().min(0).precision(2).allow(null),
  lossPoints: Joi.number().min(0).precision(2).allow(null)
};

function validateScoring(value, helpers) {
  if (value.scoringMethod === SCORING_METHODS.FRAME_POINTS) {
    if (value.pointsPerFrame === undefined || value.pointsPerFrame === null) {
      return helpers.message({ custom: "pointsPerFrame is required for FRAME_POINTS" });
    }
    value.winPoints = null;
    value.drawPoints = null;
    value.lossPoints = null;
  }

  if (value.scoringMethod === SCORING_METHODS.MATCH_RESULT) {
    for (const field of ["winPoints", "drawPoints", "lossPoints"]) {
      if (value[field] === undefined || value[field] === null) {
        return helpers.message({ custom: `${field} is required for MATCH_RESULT` });
      }
    }
    value.pointsPerFrame = null;
  }

  return value;
}

export const createMatchFormatSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  framesPerMatch: Joi.number().integer().min(1).max(999).required(),
  scoringMethod: Joi.string().valid(...Object.values(SCORING_METHODS)).required(),
  ...scoringFields,
  isDefault: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true)
}).custom(validateScoring);

export const updateMatchFormatSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  framesPerMatch: Joi.number().integer().min(1).max(999),
  scoringMethod: Joi.string().valid(...Object.values(SCORING_METHODS)),
  ...scoringFields,
  isDefault: Joi.boolean(),
  isActive: Joi.boolean()
})
  .min(1)
  .custom((value, helpers) => {
    if (value.scoringMethod) return validateScoring(value, helpers);
    return value;
  });
