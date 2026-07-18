import { playerService } from "../services/player.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listPlayers = asyncHandler(async (req, res) => {
  const players = await playerService.list(req.params.leagueId, req.query);
  res.json({ data: { players } });
});

export const createPlayer = asyncHandler(async (req, res) => {
  const player = await playerService.create(req.params.leagueId, req.body);
  res.status(201).json({ data: { player } });
});

export const getPlayer = asyncHandler(async (req, res) => {
  const player = await playerService.getById(req.params.playerId);
  res.json({ data: { player } });
});

export const updatePlayer = asyncHandler(async (req, res) => {
  const player = await playerService.update(req.player, req.body);
  res.json({ data: { player } });
});

export const deletePlayer = asyncHandler(async (req, res) => {
  await playerService.remove(req.player);
  res.status(204).send();
});

export const listRoster = asyncHandler(async (req, res) => {
  const roster = await playerService.listRoster(req.params.seasonTeamId);
  res.json({ data: { roster } });
});

export const addRosterPlayer = asyncHandler(async (req, res) => {
  const rosterEntry = await playerService.addToRoster(req.seasonTeam, req.body);
  res.status(201).json({ data: { rosterEntry } });
});

export const updateRosterPlayer = asyncHandler(async (req, res) => {
  const rosterEntry = await playerService.updateRoster(
    req.rosterEntry,
    req.season,
    req.body
  );
  res.json({ data: { rosterEntry } });
});

export const transferRosterPlayer = asyncHandler(async (req, res) => {
  const rosterEntry = await playerService.transfer(
    req.rosterEntry,
    req.season,
    req.user.id,
    req.body
  );
  res.status(201).json({ data: { rosterEntry } });
});

export const deleteRosterPlayer = asyncHandler(async (req, res) => {
  await playerService.removeFromRoster(req.rosterEntry, req.season);
  res.status(204).send();
});

export const listPlayerTransfers = asyncHandler(async (req, res) => {
  const transfers = await playerService.listTransfers(req.player.id);
  res.json({ data: { transfers } });
});
