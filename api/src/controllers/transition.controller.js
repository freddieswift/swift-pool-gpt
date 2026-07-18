import { transitionService } from "../services/transition.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listTransitionPlans = asyncHandler(async (req, res) => {
  const plans = await transitionService.list(req.season.id);
  res.json({ data: { plans } });
});

export const generateTransitionPlan = asyncHandler(async (req, res) => {
  const plan = await transitionService.generate(req.season, req.user.id, req.body);
  res.status(201).json({ data: { plan } });
});

export const getTransitionPlan = asyncHandler(async (req, res) => {
  const plan = await transitionService.get(req.transitionPlan.id);
  res.json({ data: { plan } });
});

export const replaceTransitionEntries = asyncHandler(async (req, res) => {
  const plan = await transitionService.replaceEntries(
    req.transitionPlan,
    req.user.id,
    req.body.entries
  );
  res.json({ data: { plan } });
});

export const approveTransitionPlan = asyncHandler(async (req, res) => {
  const plan = await transitionService.approve(
    req.transitionPlan,
    req.user.id,
    req.body.reason
  );
  res.json({ data: { plan } });
});

export const applyTransitionPlan = asyncHandler(async (req, res) => {
  const plan = await transitionService.apply(
    req.transitionPlan,
    req.user.id,
    req.body.reason
  );
  res.json({ data: { plan } });
});

export const cancelTransitionPlan = asyncHandler(async (req, res) => {
  const plan = await transitionService.cancel(
    req.transitionPlan,
    req.user.id,
    req.body.reason
  );
  res.json({ data: { plan } });
});

export const listTransitionAudits = asyncHandler(async (req, res) => {
  const audits = await transitionService.audits(req.transitionPlan.id);
  res.json({ data: { audits } });
});
