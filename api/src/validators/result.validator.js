import Joi from "joi";
import { FRAME_RESULT_TYPES } from "../models/index.js";

const uuid = Joi.string().guid({ version: ["uuidv4"] });

const frameSchema = Joi.object({
  frameNumber: Joi.number().integer().min(1).max(999).required(),
  homePlayerId: uuid.allow(null),
  awayPlayerId: uuid.allow(null),
  winnerPlayerId: uuid.allow(null),
  winnerSide: Joi.string().valid("HOME", "AWAY", "NONE").required(),
  resultType: Joi.string()
    .valid(...Object.values(FRAME_RESULT_TYPES))
    .default(FRAME_RESULT_TYPES.NORMAL),
  notes: Joi.string().trim().max(1000).allow(null, "")
}).custom((value, helpers) => {
  if (value.resultType === FRAME_RESULT_TYPES.NORMAL) {
    if (!value.homePlayerId || !value.awayPlayerId) {
      return helpers.message({
        custom: "Normal frames require both homePlayerId and awayPlayerId"
      });
    }
    if (!["HOME", "AWAY"].includes(value.winnerSide)) {
      return helpers.message({
        custom: "Normal frames require HOME or AWAY as winnerSide"
      });
    }
  }

  if (
    value.winnerSide === "HOME" &&
    value.winnerPlayerId &&
    value.homePlayerId !== value.winnerPlayerId
  ) {
    return helpers.message({
      custom: "winnerPlayerId must match homePlayerId when winnerSide is HOME"
    });
  }

  if (
    value.winnerSide === "AWAY" &&
    value.winnerPlayerId &&
    value.awayPlayerId !== value.winnerPlayerId
  ) {
    return helpers.message({
      custom: "winnerPlayerId must match awayPlayerId when winnerSide is AWAY"
    });
  }

  return value;
});

export const submitMatchResultSchema = Joi.object({
  frames: Joi.array().items(frameSchema).min(1).max(999).required(),
  notes: Joi.string().trim().max(5000).allow(null, ""),
  correctionReason: Joi.string().trim().max(500).allow(null, "")
}).custom((value, helpers) => {
  const numbers = value.frames.map((frame) => frame.frameNumber);
  if (new Set(numbers).size !== numbers.length) {
    return helpers.message({ custom: "Frame numbers must be unique" });
  }
  return value;
});

export const reopenMatchSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(500).required()
});
