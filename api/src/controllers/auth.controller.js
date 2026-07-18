import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => (error ? reject(error) : resolve()));
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => (error ? reject(error) : resolve()));
  });
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => (error ? reject(error) : resolve()));
  });
}

export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ data: { user } });
});

export const login = asyncHandler(async (req, res) => {
  const user = await authService.authenticate(req.body.email, req.body.password);

  // Regeneration prevents session fixation.
  await regenerateSession(req);
  req.session.userId = user.id;
  req.session.systemRoles = [];
  req.session.csrfToken = undefined;

  if (req.body.rememberMe) {
    req.session.cookie.maxAge = env.SESSION_MAX_AGE_MS * 30;
  }

  await saveSession(req);
  res.json({ data: { user: user.toSafeJSON() } });
});

export const logout = asyncHandler(async (req, res) => {
  await destroySession(req);
  res.clearCookie(env.SESSION_NAME, {
    httpOnly: true,
    secure: env.SESSION_SECURE,
    sameSite: env.SESSION_SAME_SITE
  });
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: req.user.toSafeJSON() } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user, req.body);
  res.json({ data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword
  );

  // Invalidate the current session after password change.
  await destroySession(req);
  res.clearCookie(env.SESSION_NAME);
  res.status(204).send();
});
