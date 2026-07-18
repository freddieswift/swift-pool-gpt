import crypto from "node:crypto";
import { timingSafeEqual } from "node:crypto";
import { ApiError } from "../utils/ApiError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function equalTokens(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function issueCsrfToken(req, res) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.json({ data: { csrfToken: req.session.csrfToken } });
}

export function verifyCsrf(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const supplied = req.get("x-csrf-token");
  if (!equalTokens(supplied, req.session?.csrfToken)) {
    return next(new ApiError(403, "Invalid CSRF token"));
  }

  next();
}
