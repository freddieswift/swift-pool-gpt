import Joi from "joi";
import { TRANSITION_ACTIONS } from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });

export const transitionPlanIdParamsSchema = Joi.object({
  planId: uuid.required()
});

export const createTransitionPlanSchema = Joi.object({
  targetSeasonId: uuid.required(),
  notes: Joi.string().trim().max(10000).allow(null, "")
});

export const transitionEntrySchema = Joi.object({
  teamId: uuid.required(),
  sourceSeasonTeamId: uuid.required(),
  sourceDivisionId: uuid.allow(null),
  targetDivisionId: uuid.allow(null),
  sourcePosition: Joi.number().integer().min(1).allow(null),
  action: Joi.string().valid(...Object.values(TRANSITION_ACTIONS)).required(),
  seed: Joi.number().integer().min(1).allow(null),
  notes: Joi.string().trim().max(1000).allow(null, "")
});

export const replaceTransitionEntriesSchema = Joi.object({
  entries: Joi.array().items(transitionEntrySchema).min(1).max(1000).required()
}).custom((value, helpers) => {
  const teamIds = value.entries.map((entry) => entry.teamId);
  if (new Set(teamIds).size !== teamIds.length) {
    return helpers.message({ custom: "Each team may appear only once" });
  }
  return value;
});

export const transitionActionSchema = Joi.object({
  reason: Joi.string().trim().max(500).allow(null, "")
});
