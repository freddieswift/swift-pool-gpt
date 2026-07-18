import { matchService } from "../services/match.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listMatches = asyncHandler(async (req, res) => {
  const matches = await matchService.list(req.params.seasonId, req.query);
  res.json({ data: { matches } });
});

export const generateFixtures = asyncHandler(async (req, res) => {
  const matches = await matchService.generate(req.division, req.season, req.body);
  res.status(201).json({ data: { matches } });
});

export const createMatch = asyncHandler(async (req, res) => {
  const match = await matchService.create(req.season, req.body);
  res.status(201).json({ data: { match } });
});

export const getMatch = asyncHandler(async (req, res) => {
  const match = await matchService.getById(req.params.matchId);
  res.json({ data: { match } });
});

export const updateMatch = asyncHandler(async (req, res) => {
  const match = await matchService.update(req.match, req.body);
  res.json({ data: { match } });
});

export const deleteMatch = asyncHandler(async (req, res) => {
  await matchService.remove(req.match, req.season);
  res.status(204).send();
});
