import { publicService } from "../services/public.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPublicLeague = asyncHandler(async (req, res) => {
  const data = await publicService.leagueOverview(req.publicLeague);
  res.json({ data });
});

export const getPublicSeason = asyncHandler(async (req, res) => {
  const data = await publicService.seasonOverview(
    req.publicLeague,
    req.publicSeason,
    req.publicSettings
  );
  res.json({ data });
});

export const getPublicTeams = asyncHandler(async (req, res) => {
  const data = await publicService.teams(
    req.publicSeason,
    req.publicSettings
  );
  res.json({ data });
});

export const getPublicMatches = asyncHandler(async (req, res) => {
  const data = await publicService.matches(req.publicSeason, req.query);
  res.json({ data });
});

export const getPublicMatch = asyncHandler(async (req, res) => {
  const data = await publicService.match(
    req.publicSeason,
    req.params.matchId,
    req.publicSettings
  );
  res.json({ data });
});

export const getPublicStandings = asyncHandler(async (req, res) => {
  const data = await publicService.standings(req.publicSeason);
  res.json({ data });
});

export const getPublicPlayerStatistics = asyncHandler(async (req, res) => {
  const data = await publicService.playerStatistics(
    req.publicSeason,
    req.publicSettings,
    req.query
  );
  res.json({ data });
});

export const getPublicRoster = asyncHandler(async (req, res) => {
  const data = await publicService.roster(
    req.publicSeason,
    req.publicSettings
  );
  res.json({ data });
});
