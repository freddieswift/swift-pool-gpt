import Joi from "joi";
import { SEASON_STATUSES } from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });
const dateOnly = Joi.date().iso();

export const seasonIdParamsSchema = Joi.object({
  seasonId: uuid.required()
});

export const listSeasonsQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(SEASON_STATUSES))
});

export const createSeasonSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  startDate: dateOnly.required(),
  endDate: dateOnly.min(Joi.ref("startDate")).required(),
  registrationOpensAt: Joi.date().iso().allow(null),
  registrationClosesAt: Joi.date()
    .iso()
    .min(Joi.ref("registrationOpensAt"))
    .allow(null),
  matchFormatId: uuid.required(),
  teamsPlayEachOther: Joi.number().integer().min(1).max(20).default(1),
  useHomeAndAway: Joi.boolean().default(false),
  pointsDeductionEnabled: Joi.boolean().default(false),
  notes: Joi.string().trim().max(10000).allow(null, "")
}).custom((value, helpers) => {
  if (
    value.registrationClosesAt &&
    new Date(value.registrationClosesAt) > new Date(value.startDate)
  ) {
    return helpers.message({
      custom: "registrationClosesAt must be on or before the season start date"
    });
  }

  return value;
});

export const updateSeasonSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  startDate: dateOnly,
  endDate: dateOnly,
  registrationOpensAt: Joi.date().iso().allow(null),
  registrationClosesAt: Joi.date().iso().allow(null),
  matchFormatId: uuid,
  teamsPlayEachOther: Joi.number().integer().min(1).max(20),
  useHomeAndAway: Joi.boolean(),
  pointsDeductionEnabled: Joi.boolean(),
  notes: Joi.string().trim().max(10000).allow(null, "")
}).min(1);

export const updateSeasonStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(SEASON_STATUSES)).required()
});
