import { standingsService } from "../services/standings.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDivisionStandings = asyncHandler(async (req, res) => {
  const table = await standingsService.divisionTable(
    req.season,
    req.division,
    req.query
  );
  res.json({ data: table });
});

export const getSeasonStandings = asyncHandler(async (req, res) => {
  const tables = await standingsService.seasonTables(req.season, req.query);
  res.json({ data: tables });
});

export const getTeamStatistics = asyncHandler(async (req, res) => {
  const result = await standingsService.teamStatistics(
    req.season,
    req.query.limit
  );
  res.json({ data: result });
});

export const getPlayerStatistics = asyncHandler(async (req, res) => {
  const result = await standingsService.playerStatistics(req.season, req.query);
  res.json({ data: result });
});

export const getSeasonSummary = asyncHandler(async (req, res) => {
  const result = await standingsService.summary(req.season);
  res.json({ data: result });
});
