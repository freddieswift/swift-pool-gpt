import Joi from "joi";

const password = Joi.string()
  .min(10)
  .max(128)
  .pattern(/[a-z]/, "lowercase letter")
  .pattern(/[A-Z]/, "uppercase letter")
  .pattern(/[0-9]/, "number")
  .required();

export const registerSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password,
  firstName: Joi.string().trim().min(1).max(80).required(),
  lastName: Joi.string().trim().min(1).max(80).required(),
  displayName: Joi.string().trim().min(1).max(120).allow(null, "")
}).required();

export const loginSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(1).max(128).required(),
  rememberMe: Joi.boolean().default(false)
}).required();

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(1).max(128).required(),
  newPassword: password.invalid(Joi.ref("currentPassword"))
    .messages({ "any.invalid": "New password must differ from current password" })
}).required();

export const updateMeSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(80),
  lastName: Joi.string().trim().min(1).max(80),
  displayName: Joi.string().trim().min(1).max(120).allow(null, "")
}).min(1);
