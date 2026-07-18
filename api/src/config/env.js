import "dotenv/config";
import Joi from "joi";

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(3000),
  APP_ORIGIN: Joi.string().uri().default("http://localhost:5173"),
  TRUST_PROXY: Joi.number().integer().min(0).default(0),

  DB_HOST: Joi.string().default("127.0.0.1"),
  DB_PORT: Joi.number().port().default(3306),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow("").default(""),
  DB_LOGGING: Joi.boolean().truthy("true").falsy("false").default(false),

  SESSION_SECRET: Joi.string().min(32).required(),
  SESSION_NAME: Joi.string().default("swiftpool.sid"),
  SESSION_MAX_AGE_MS: Joi.number().integer().positive().default(86400000),
  SESSION_SECURE: Joi.boolean().truthy("true").falsy("false").default(false),
  SESSION_SAME_SITE: Joi.string().valid("lax", "strict", "none").default("lax"),
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12)
}).unknown();

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  convert: true
});

if (error) {
  throw new Error(`Invalid environment configuration: ${error.message}`);
}

export const env = Object.freeze(value);
