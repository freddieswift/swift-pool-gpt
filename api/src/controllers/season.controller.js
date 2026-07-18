import { seasonService } from "../services/season.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listSeasons = asyncHandler(async (req, res) => {
  const seasons = await seasonService.list(req.params.leagueId, req.query);
  res.json({ data: { seasons } });
});

export const createSeason = asyncHandler(async (req, res) => {
  const season = await seasonService.create(req.params.leagueId, req.body);
  res.status(201).json({ data: { season } });
});

export const getSeason = asyncHandler(async (req, res) => {
  const season = await seasonService.getById(req.params.seasonId);
  res.json({ data: { season } });
});

export const updateSeason = asyncHandler(async (req, res) => {
  const season = await seasonService.update(req.season, req.body);
  res.json({ data: { season } });
});

export const updateSeasonStatus = asyncHandler(async (req, res) => {
  const season = await seasonService.updateStatus(req.season, req.body.status);
  res.json({ data: { season } });
});

export const deleteSeason = asyncHandler(async (req, res) => {
  await seasonService.remove(req.season);
  res.status(204).send();
});
