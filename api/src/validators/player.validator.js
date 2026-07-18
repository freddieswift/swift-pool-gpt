import Joi from "joi";
import { ROSTER_STATUSES } from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });
const nullableText = (max) => Joi.string().trim().max(max).allow(null, "");

export const playerIdParamsSchema = Joi.object({
  playerId: uuid.required()
});

export const rosterEntryIdParamsSchema = Joi.object({
  rosterEntryId: uuid.required()
});

export const listPlayersQuerySchema = Joi.object({
  includeInactive: Joi.boolean().default(false),
  search: Joi.string().trim().min(1).max(100)
});

export const createPlayerSchema = Joi.object({
  userId: uuid.allow(null),
  firstName: Joi.string().trim().min(1).max(80).required(),
  lastName: Joi.string().trim().min(1).max(80).required(),
  displayName: Joi.string().trim().min(1).max(120),
  email: Joi.string().trim().lowercase().email().max(254).allow(null, ""),
  phone: nullableText(40),
  dateOfBirth: Joi.date().iso().max("now").allow(null),
  isActive: Joi.boolean().default(true)
});

export const updatePlayerSchema = createPlayerSchema
  .fork(["firstName", "lastName"], (schema) => schema.optional())
  .min(1);

export const addRosterPlayerSchema = Joi.object({
  playerId: uuid.required(),
  isCaptain: Joi.boolean().default(false),
  joinedAt: Joi.date().iso(),
  eligibleFrom: Joi.date().iso(),
  eligibleUntil: Joi.date().iso().allow(null),
  shirtNumber: Joi.number().integer().min(1).max(999).allow(null),
  notes: nullableText(5000)
}).custom((value, helpers) => {
  if (
    value.eligibleUntil &&
    value.eligibleFrom &&
    new Date(value.eligibleUntil) < new Date(value.eligibleFrom)
  ) {
    return helpers.message({
      custom: "eligibleUntil cannot be before eligibleFrom"
    });
  }
  return value;
});

export const updateRosterPlayerSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ROSTER_STATUSES)),
  isCaptain: Joi.boolean(),
  leftAt: Joi.date().iso().allow(null),
  eligibleFrom: Joi.date().iso(),
  eligibleUntil: Joi.date().iso().allow(null),
  shirtNumber: Joi.number().integer().min(1).max(999).allow(null),
  notes: nullableText(5000)
})
  .min(1)
  .custom((value, helpers) => {
    if (
      value.eligibleUntil &&
      value.eligibleFrom &&
      new Date(value.eligibleUntil) < new Date(value.eligibleFrom)
    ) {
      return helpers.message({
        custom: "eligibleUntil cannot be before eligibleFrom"
      });
    }
    return value;
  });

export const transferPlayerSchema = Joi.object({
  toSeasonTeamId: uuid.required(),
  effectiveDate: Joi.date().iso().required(),
  makeCaptain: Joi.boolean().default(false),
  reason: nullableText(500)
});
