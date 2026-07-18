import Joi from "joi";
import {
  APPEAL_STATUSES,
  SANCTION_TYPES
} from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });
const nullableText = (max) => Joi.string().trim().max(max).allow(null, "");

export const sanctionIdParamsSchema = Joi.object({
  sanctionId: uuid.required()
});

export const appealIdParamsSchema = Joi.object({
  appealId: uuid.required()
});

export const listSanctionsQuerySchema = Joi.object({
  includeInactive: Joi.boolean().default(false)
});

export const createSanctionSchema = Joi.object({
  seasonId: uuid.allow(null),
  type: Joi.string().valid(...Object.values(SANCTION_TYPES)).required(),
  reason: Joi.string().trim().min(3).max(2000).required(),
  startsOn: Joi.date().iso().required(),
  endsOn: Joi.date().iso().allow(null),
  preventsMatchPlay: Joi.boolean().default(true)
}).custom((value, helpers) => {
  if (
    value.endsOn &&
    new Date(value.endsOn) < new Date(value.startsOn)
  ) {
    return helpers.message({
      custom: "endsOn cannot be before startsOn"
    });
  }

  if (
    value.type === SANCTION_TYPES.DATE_SUSPENSION &&
    !value.endsOn
  ) {
    return helpers.message({
      custom: "DATE_SUSPENSION requires endsOn"
    });
  }

  return value;
});

export const updateSanctionSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(2000),
  startsOn: Joi.date().iso(),
  endsOn: Joi.date().iso().allow(null),
  preventsMatchPlay: Joi.boolean(),
  changeReason: Joi.string().trim().min(3).max(1000).required()
})
  .min(2)
  .custom((value, helpers) => {
    if (
      value.endsOn &&
      value.startsOn &&
      new Date(value.endsOn) < new Date(value.startsOn)
    ) {
      return helpers.message({
        custom: "endsOn cannot be before startsOn"
      });
    }
    return value;
  });

export const revokeSanctionSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(1000).required()
});

export const createAppealSchema = Joi.object({
  grounds: Joi.string().trim().min(10).max(5000).required()
});

export const resolveAppealSchema = Joi.object({
  status: Joi.string()
    .valid(
      APPEAL_STATUSES.UPHELD,
      APPEAL_STATUSES.REDUCED,
      APPEAL_STATUSES.OVERTURNED
    )
    .required(),
  resolution: Joi.string().trim().min(3).max(5000).required(),
  revisedEndsOn: Joi.date().iso().allow(null)
});

export const withdrawAppealSchema = Joi.object({
  reason: nullableText(1000)
});
