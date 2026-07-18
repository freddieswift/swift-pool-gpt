import Joi from "joi";
import { HANDICAP_SOURCES } from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });

export const handicapIdParamsSchema = Joi.object({
  handicapId: uuid.required()
});

export const createPlayerHandicapSchema = Joi.object({
  seasonId: uuid.allow(null),
  value: Joi.number().precision(2).min(-100).max(100).required(),
  source: Joi.string().valid(...Object.values(HANDICAP_SOURCES)).default("MANUAL"),
  effectiveFrom: Joi.date().iso().required(),
  effectiveUntil: Joi.date().iso().allow(null),
  notes: Joi.string().trim().max(1000).allow(null, "")
}).custom((value, helpers) => {
  if (
    value.effectiveUntil &&
    new Date(value.effectiveUntil) < new Date(value.effectiveFrom)
  ) {
    return helpers.message({
      custom: "effectiveUntil cannot be before effectiveFrom"
    });
  }
  return value;
});

export const createTeamHandicapSchema = createPlayerHandicapSchema.fork(
  ["seasonId"],
  (schema) => schema.required()
);

export const updateHandicapSchema = Joi.object({
  value: Joi.number().precision(2).min(-100).max(100),
  effectiveUntil: Joi.date().iso().allow(null),
  notes: Joi.string().trim().max(1000).allow(null, ""),
  reason: Joi.string().trim().min(3).max(500).required()
}).min(2);

export const calculateHandicapSchema = Joi.object({
  minimumFrames: Joi.number().integer().min(1).max(999).default(5),
  minimumMatches: Joi.number().integer().min(1).max(999).default(3),
  baseValue: Joi.number().precision(2).min(-100).max(100).default(0),
  scale: Joi.number().precision(2).min(0.01).max(10).default(1),
  lowerBound: Joi.number().precision(2).min(-100).max(100).default(-10),
  upperBound: Joi.number().precision(2).min(-100).max(100).default(10),
  effectiveFrom: Joi.date().iso().required(),
  apply: Joi.boolean().default(false)
}).custom((value, helpers) => {
  if (value.lowerBound > value.upperBound) {
    return helpers.message({
      custom: "lowerBound cannot be greater than upperBound"
    });
  }
  return value;
});
