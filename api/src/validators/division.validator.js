import Joi from "joi";

const uuid = Joi.string().guid({ version: ["uuidv4"] });

export const divisionIdParamsSchema = Joi.object({
  divisionId: uuid.required()
});

export const createDivisionSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  position: Joi.number().integer().min(1),
  promotionPlaces: Joi.number().integer().min(0).max(100).default(0),
  relegationPlaces: Joi.number().integer().min(0).max(100).default(0),
  isActive: Joi.boolean().default(true),
  notes: Joi.string().trim().max(10000).allow(null, "")
});

export const updateDivisionSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  promotionPlaces: Joi.number().integer().min(0).max(100),
  relegationPlaces: Joi.number().integer().min(0).max(100),
  isActive: Joi.boolean(),
  notes: Joi.string().trim().max(10000).allow(null, "")
}).min(1);

export const reorderDivisionsSchema = Joi.object({
  divisionIds: Joi.array()
    .items(uuid.required())
    .min(1)
    .unique()
    .required()
});
