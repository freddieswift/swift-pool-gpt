import { handicapService } from "../services/handicap.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listPlayerHandicaps = asyncHandler(async (req, res) => {
  const handicaps = await handicapService.listPlayer(req.player.id);
  res.json({ data: { handicaps } });
});

export const createPlayerHandicap = asyncHandler(async (req, res) => {
  const handicap = await handicapService.createPlayer(
    req.player,
    req.user.id,
    req.body
  );
  res.status(201).json({ data: { handicap } });
});

export const listTeamHandicaps = asyncHandler(async (req, res) => {
  const handicaps = await handicapService.listTeam(req.seasonTeam.id);
  res.json({ data: { handicaps } });
});

export const createTeamHandicap = asyncHandler(async (req, res) => {
  const handicap = await handicapService.createTeam(
    req.seasonTeam,
    req.season,
    req.user.id,
    req.body
  );
  res.status(201).json({ data: { handicap } });
});

export const updatePlayerHandicap = asyncHandler(async (req, res) => {
  const handicap = await handicapService.update(
    req.playerHandicap,
    "PLAYER",
    req.user.id,
    req.body
  );
  res.json({ data: { handicap } });
});

export const updateTeamHandicap = asyncHandler(async (req, res) => {
  const handicap = await handicapService.update(
    req.teamHandicap,
    "TEAM",
    req.user.id,
    req.body
  );
  res.json({ data: { handicap } });
});

export const calculatePlayerHandicaps = asyncHandler(async (req, res) => {
  const result = await handicapService.calculatePlayer(
    req.season,
    req.user.id,
    req.body
  );
  res.json({ data: result });
});

export const calculateTeamHandicaps = asyncHandler(async (req, res) => {
  const result = await handicapService.calculateTeam(
    req.season,
    req.user.id,
    req.body
  );
  res.json({ data: result });
});

export const listPlayerHandicapAudits = asyncHandler(async (req, res) => {
  const audits = await handicapService.audits(
    req.player.leagueId,
    "PLAYER",
    req.player.id
  );
  res.json({ data: { audits } });
});

export const listTeamHandicapAudits = asyncHandler(async (req, res) => {
  const audits = await handicapService.audits(
    req.season.leagueId,
    "TEAM",
    req.seasonTeam.id
  );
  res.json({ data: { audits } });
});
