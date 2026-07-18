import { teamService } from "../services/team.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.list(req.params.leagueId, req.query);
  res.json({ data: { teams } });
});

export const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.create(req.params.leagueId, req.body);
  res.status(201).json({ data: { team } });
});

export const getTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getById(req.params.teamId);
  res.json({ data: { team } });
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.update(req.team, req.body);
  res.json({ data: { team } });
});

export const deleteTeam = asyncHandler(async (req, res) => {
  await teamService.remove(req.team);
  res.status(204).send();
});

export const listSeasonTeams = asyncHandler(async (req, res) => {
  const seasonTeams = await teamService.listSeasonTeams(req.params.seasonId);
  res.json({ data: { seasonTeams } });
});

export const registerSeasonTeam = asyncHandler(async (req, res) => {
  const seasonTeam = await teamService.registerSeasonTeam(req.season, req.body);
  res.status(201).json({ data: { seasonTeam } });
});

export const getSeasonTeam = asyncHandler(async (req, res) => {
  const seasonTeam = await teamService.listSeasonTeams(req.seasonTeam.seasonId);
  const selected = seasonTeam.find((item) => item.id === req.seasonTeam.id);
  res.json({ data: { seasonTeam: selected || req.seasonTeam } });
});

export const updateSeasonTeam = asyncHandler(async (req, res) => {
  const seasonTeam = await teamService.updateSeasonTeam(
    req.seasonTeam,
    req.season,
    req.body
  );
  res.json({ data: { seasonTeam } });
});

export const deleteSeasonTeam = asyncHandler(async (req, res) => {
  await teamService.removeSeasonTeam(req.seasonTeam, req.season);
  res.status(204).send();
});
