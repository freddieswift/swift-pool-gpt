import { sanctionService } from "../services/sanction.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listPlayerSanctions = asyncHandler(async (req, res) => {
  const sanctions = await sanctionService.list(
    req.player.id,
    req.query.includeInactive
  );
  res.json({ data: { sanctions } });
});

export const issuePlayerSanction = asyncHandler(async (req, res) => {
  const sanction = await sanctionService.issue(
    req.player,
    req.user.id,
    req.body
  );
  res.status(201).json({ data: { sanction } });
});

export const getSanction = asyncHandler(async (req, res) => {
  const sanction = await sanctionService.get(req.sanction.id);
  res.json({ data: { sanction } });
});

export const updateSanction = asyncHandler(async (req, res) => {
  const sanction = await sanctionService.update(
    req.sanction,
    req.user.id,
    req.body
  );
  res.json({ data: { sanction } });
});

export const revokeSanction = asyncHandler(async (req, res) => {
  const sanction = await sanctionService.revoke(
    req.sanction,
    req.user.id,
    req.body.reason
  );
  res.json({ data: { sanction } });
});

export const listSanctionAppeals = asyncHandler(async (req, res) => {
  const appeals = await sanctionService.appeals(req.sanction.id);
  res.json({ data: { appeals } });
});

export const createSanctionAppeal = asyncHandler(async (req, res) => {
  const appeal = await sanctionService.appeal(
    req.sanction,
    req.player,
    req.user,
    req.body
  );
  res.status(201).json({ data: { appeal } });
});

export const resolveSanctionAppeal = asyncHandler(async (req, res) => {
  const appeal = await sanctionService.resolveAppeal(
    req.appeal,
    req.sanction,
    req.user.id,
    req.body
  );
  res.json({ data: { appeal } });
});

export const withdrawSanctionAppeal = asyncHandler(async (req, res) => {
  const appeal = await sanctionService.withdrawAppeal(
    req.appeal,
    req.user,
    req.body.reason
  );
  res.json({ data: { appeal } });
});

export const listSanctionAudits = asyncHandler(async (req, res) => {
  const audits = await sanctionService.audits(req.sanction.id);
  res.json({ data: { audits } });
});
