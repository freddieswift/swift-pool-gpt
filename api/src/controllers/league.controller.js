import { leagueService } from "../services/league.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createLeague = asyncHandler(async (req, res) => {
  const league = await leagueService.create(req.user.id, req.body);
  res.status(201).json({ data: { league } });
});

export const listLeagues = asyncHandler(async (req, res) => {
  const leagues = await leagueService.listForUser(req.user.id);
  res.json({ data: { leagues } });
});

export const getLeague = asyncHandler(async (req, res) => {
  const league = await leagueService.getById(req.params.leagueId);
  res.json({ data: { league } });
});

export const updateLeague = asyncHandler(async (req, res) => {
  const league = await leagueService.update(req.league, req.body);
  res.json({ data: { league } });
});

export const deleteLeague = asyncHandler(async (req, res) => {
  await leagueService.remove(req.league);
  res.status(204).send();
});

export const listLeagueAdmins = asyncHandler(async (req, res) => {
  const admins = await leagueService.listAdmins(req.params.leagueId);
  res.json({ data: { admins } });
});

export const addLeagueAdmin = asyncHandler(async (req, res) => {
  const admin = await leagueService.addAdmin(req.params.leagueId, req.body);
  res.status(201).json({ data: { admin } });
});

export const updateLeagueAdmin = asyncHandler(async (req, res) => {
  const admin = await leagueService.updateAdmin(
    req.params.leagueId,
    req.params.userId,
    req.body.role
  );
  res.json({ data: { admin } });
});

export const removeLeagueAdmin = asyncHandler(async (req, res) => {
  await leagueService.removeAdmin(req.params.leagueId, req.params.userId);
  res.status(204).send();
});

export const getLeagueSettings = asyncHandler(async (req, res) => {
  const settings = await leagueService.getSettings(req.params.leagueId);
  res.json({ data: { settings } });
});

export const updateLeagueSettings = asyncHandler(async (req, res) => {
  const settings = await leagueService.updateSettings(req.params.leagueId, req.body);
  res.json({ data: { settings } });
});

export const listMatchFormats = asyncHandler(async (req, res) => {
  const matchFormats = await leagueService.listMatchFormats(req.params.leagueId);
  res.json({ data: { matchFormats } });
});

export const createMatchFormat = asyncHandler(async (req, res) => {
  const matchFormat = await leagueService.createMatchFormat(
    req.params.leagueId,
    req.body
  );
  res.status(201).json({ data: { matchFormat } });
});

export const updateMatchFormat = asyncHandler(async (req, res) => {
  const matchFormat = await leagueService.updateMatchFormat(req.matchFormat, req.body);
  res.json({ data: { matchFormat } });
});

export const deleteMatchFormat = asyncHandler(async (req, res) => {
  await leagueService.removeMatchFormat(req.matchFormat);
  res.status(204).send();
});
