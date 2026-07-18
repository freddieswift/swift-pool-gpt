import Joi from "joi";

export const standingsQuerySchema = Joi.object({
  formSize: Joi.number().integer().min(1).max(20).default(5),
  includeWithdrawn: Joi.boolean().default(true)
});

export const statisticsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(200).default(50),
  minimumFrames: Joi.number().integer().min(0).max(999).default(0)
});
