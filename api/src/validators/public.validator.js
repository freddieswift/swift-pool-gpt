import Joi from "joi";
import { MATCH_STATUSES } from "../models/index.js";

const slug = Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(140);

export const publicLeagueParamsSchema = Joi.object({
  leagueSlug: slug.required()
});

export const publicSeasonParamsSchema = Joi.object({
  leagueSlug: slug.required(),
  seasonSlug: slug.required()
});

export const publicMatchParamsSchema = Joi.object({
  leagueSlug: slug.required(),
  seasonSlug: slug.required(),
  matchId: Joi.string().guid({ version: ["uuidv4"] }).required()
});

export const publicMatchesQuerySchema = Joi.object({
  status: Joi.string().valid(...Object.values(MATCH_STATUSES)),
  divisionId: Joi.string().guid({ version: ["uuidv4"] }),
  limit: Joi.number().integer().min(1).max(200).default(50),
  order: Joi.string().valid("asc", "desc").default("asc")
});

export const publicStatisticsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(25),
  minimumFrames: Joi.number().integer().min(0).max(999).default(0)
});
