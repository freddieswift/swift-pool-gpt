import { resultService } from "../services/result.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMatchResult = asyncHandler(async (req, res) => {
  const match = await resultService.get(req.match.id);
  res.json({ data: { match } });
});

export const submitMatchResult = asyncHandler(async (req, res) => {
  const match = await resultService.submit(req.match.id, req.user.id, req.body);
  res.json({ data: { match } });
});

export const reopenMatchResult = asyncHandler(async (req, res) => {
  const match = await resultService.reopen(
    req.match.id,
    req.user.id,
    req.body.reason
  );
  res.json({ data: { match } });
});

export const listMatchResultAudits = asyncHandler(async (req, res) => {
  const audits = await resultService.audits(req.match.id);
  res.json({ data: { audits } });
});
