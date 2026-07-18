import Joi from "joi";

export const dashboardQuerySchema = Joi.object({
  upcomingLimit: Joi.number().integer().min(1).max(50).default(10),
  recentLimit: Joi.number().integer().min(1).max(50).default(10)
});

export const reportQuerySchema = Joi.object({
  format: Joi.string().valid("json", "csv").default("json"),
  status: Joi.string()
    .valid("SCHEDULED", "POSTPONED", "IN_PROGRESS", "COMPLETED", "CANCELLED"),
  divisionId: Joi.string().guid({ version: ["uuidv4"] })
});
