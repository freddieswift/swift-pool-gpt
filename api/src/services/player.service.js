import {
  Player,
  PlayerTransfer,
  SeasonTeam,
  SeasonTeamPlayer,
  User,
  ROSTER_STATUSES,
  SEASON_STATUSES,
  sequelize
} from "../models/index.js";
import { playerRepository } from "../repositories/player.repository.js";
import { ApiError } from "../utils/ApiError.js";

function assertRosterEditable(season) {
  if (![SEASON_STATUSES.DRAFT, SEASON_STATUSES.REGISTRATION, SEASON_STATUSES.ACTIVE].includes(season.status)) {
    throw new ApiError(
      409,
      "Rosters cannot be changed after a season is completed or cancelled"
    );
  }
}

function nullable(value) {
  return value === "" ? null : value;
}

function defaultDisplayName(payload) {
  return payload.displayName || `${payload.firstName} ${payload.lastName}`.trim();
}

async function validateUserLink(userId, playerId = null, transaction) {
  if (!userId) return;

  const user = await User.findByPk(userId, { transaction });
  if (!user) throw new ApiError(422, "Linked user account was not found");

  const existing = await Player.findOne({
    where: {
      userId,
      ...(playerId ? { id: { [sequelize.Sequelize.Op.ne]: playerId } } : {})
    },
    transaction
  });

  if (existing) throw new ApiError(409, "User account is already linked to another player");
}

async function ensurePlayerEligibleForSeasonTeam(player, seasonTeam, transaction) {
  if (!player.isActive) throw new ApiError(422, "Inactive players cannot be added to a roster");

  const season = await seasonTeam.getSeason({ transaction });
  if (!season) throw new ApiError(404, "Season not found");

  if (player.leagueId !== season.leagueId) {
    throw new ApiError(422, "Player does not belong to the same league as the season");
  }

  return season;
}

async function removeOtherCaptain(seasonTeamId, exceptId, transaction) {
  await SeasonTeamPlayer.update(
    { isCaptain: false },
    {
      where: {
        seasonTeamId,
        ...(exceptId ? { id: { [sequelize.Sequelize.Op.ne]: exceptId } } : {})
      },
      transaction
    }
  );
}

export const playerService = {
  list(leagueId, filters) {
    return playerRepository.listByLeague(leagueId, filters);
  },

  async getById(playerId) {
    const player = await playerRepository.findById(playerId);
    if (!player) throw new ApiError(404, "Player not found");
    return player;
  },

  async create(leagueId, payload) {
    return sequelize.transaction(async (transaction) => {
      await validateUserLink(payload.userId, null, transaction);

      return playerRepository.create(
        {
          leagueId,
          userId: payload.userId || null,
          firstName: payload.firstName,
          lastName: payload.lastName,
          displayName: defaultDisplayName(payload),
          email: nullable(payload.email),
          phone: nullable(payload.phone),
          dateOfBirth: payload.dateOfBirth || null,
          isActive: payload.isActive
        },
        { transaction }
      );
    });
  },

  async update(player, payload) {
    return sequelize.transaction(async (transaction) => {
      if ("userId" in payload) {
        await validateUserLink(payload.userId, player.id, transaction);
      }

      const updates = { ...payload };
      for (const field of ["email", "phone"]) {
        if (field in updates) updates[field] = nullable(updates[field]);
      }

      if (
        !payload.displayName &&
        (payload.firstName || payload.lastName)
      ) {
        updates.displayName = `${payload.firstName || player.firstName} ${
          payload.lastName || player.lastName
        }`.trim();
      }

      await player.update(updates, { transaction });
      return player;
    });
  },

  async remove(player) {
    const rosterCount = await SeasonTeamPlayer.count({
      where: { playerId: player.id }
    });

    if (rosterCount > 0) {
      throw new ApiError(
        409,
        "Players with roster history cannot be deleted; deactivate the player instead"
      );
    }

    await player.destroy();
  },

  listRoster(seasonTeamId) {
    return playerRepository.listRoster(seasonTeamId);
  },

  async addToRoster(seasonTeam, payload) {
    return sequelize.transaction(async (transaction) => {
      const player = await Player.findByPk(payload.playerId, { transaction });
      if (!player) throw new ApiError(404, "Player not found");

      const season = await ensurePlayerEligibleForSeasonTeam(
        player,
        seasonTeam,
        transaction
      );
      assertRosterEditable(season);

      const duplicate = await SeasonTeamPlayer.findOne({
        where: {
          seasonTeamId: seasonTeam.id,
          playerId: player.id
        },
        transaction
      });
      if (duplicate) throw new ApiError(409, "Player is already on this roster");

      const activeElsewhere = await SeasonTeamPlayer.findOne({
        include: [{
          model: SeasonTeam,
          as: "seasonTeam",
          where: { seasonId: season.id }
        }],
        where: {
          playerId: player.id,
          status: ROSTER_STATUSES.ACTIVE
        },
        transaction
      });

      if (activeElsewhere) {
        throw new ApiError(
          409,
          "Player is already active for another team in this season; use the transfer endpoint"
        );
      }

      if (payload.isCaptain) {
        await removeOtherCaptain(seasonTeam.id, null, transaction);
      }

      const joinedAt = payload.joinedAt || season.startDate;
      const eligibleFrom = payload.eligibleFrom || joinedAt;

      const rosterEntry = await SeasonTeamPlayer.create(
        {
          seasonTeamId: seasonTeam.id,
          playerId: player.id,
          status: ROSTER_STATUSES.ACTIVE,
          isCaptain: payload.isCaptain,
          joinedAt,
          leftAt: null,
          eligibleFrom,
          eligibleUntil: payload.eligibleUntil || null,
          shirtNumber: payload.shirtNumber || null,
          notes: nullable(payload.notes)
        },
        { transaction }
      );

      return playerRepository.findDetailedRosterEntry(rosterEntry.id);
    });
  },

  async updateRoster(rosterEntry, season, payload) {
    assertRosterEditable(season);

    return sequelize.transaction(async (transaction) => {
      if (payload.isCaptain === true) {
        await removeOtherCaptain(rosterEntry.seasonTeamId, rosterEntry.id, transaction);
      }

      const updates = { ...payload };
      if ("notes" in updates) updates.notes = nullable(updates.notes);

      if (payload.status === ROSTER_STATUSES.RELEASED && !payload.leftAt) {
        updates.leftAt = new Date().toISOString().slice(0, 10);
      }

      if (payload.status === ROSTER_STATUSES.ACTIVE) {
        updates.leftAt = null;
      }

      await rosterEntry.update(updates, { transaction });
      return playerRepository.findDetailedRosterEntry(rosterEntry.id);
    });
  },

  async transfer(rosterEntry, season, userId, payload) {
    assertRosterEditable(season);

    return sequelize.transaction(async (transaction) => {
      const destination = await SeasonTeam.findOne({
        where: {
          id: payload.toSeasonTeamId,
          seasonId: season.id
        },
        transaction
      });

      if (!destination) {
        throw new ApiError(422, "Destination team does not belong to this season");
      }

      if (destination.id === rosterEntry.seasonTeamId) {
        throw new ApiError(422, "Destination team must be different");
      }

      const existingDestinationEntry = await SeasonTeamPlayer.findOne({
        where: {
          seasonTeamId: destination.id,
          playerId: rosterEntry.playerId
        },
        transaction
      });

      if (existingDestinationEntry) {
        throw new ApiError(409, "Player already has a roster entry for the destination team");
      }

      const effectiveDate = payload.effectiveDate;

      await rosterEntry.update(
        {
          status: ROSTER_STATUSES.RELEASED,
          isCaptain: false,
          leftAt: effectiveDate,
          eligibleUntil: effectiveDate
        },
        { transaction }
      );

      if (payload.makeCaptain) {
        await removeOtherCaptain(destination.id, null, transaction);
      }

      const newEntry = await SeasonTeamPlayer.create(
        {
          seasonTeamId: destination.id,
          playerId: rosterEntry.playerId,
          status: ROSTER_STATUSES.ACTIVE,
          isCaptain: payload.makeCaptain,
          joinedAt: effectiveDate,
          eligibleFrom: effectiveDate,
          eligibleUntil: null
        },
        { transaction }
      );

      await PlayerTransfer.create(
        {
          seasonId: season.id,
          playerId: rosterEntry.playerId,
          fromSeasonTeamId: rosterEntry.seasonTeamId,
          toSeasonTeamId: destination.id,
          effectiveDate,
          reason: nullable(payload.reason),
          createdByUserId: userId
        },
        { transaction }
      );

      return playerRepository.findDetailedRosterEntry(newEntry.id);
    });
  },

  async removeFromRoster(rosterEntry, season) {
    assertRosterEditable(season);

    const transferCount = await PlayerTransfer.count({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { fromSeasonTeamId: rosterEntry.seasonTeamId, playerId: rosterEntry.playerId },
          { toSeasonTeamId: rosterEntry.seasonTeamId, playerId: rosterEntry.playerId }
        ]
      }
    });

    if (transferCount > 0) {
      throw new ApiError(
        409,
        "Roster entries with transfer history cannot be deleted; mark them released instead"
      );
    }

    await rosterEntry.destroy();
  },

  listTransfers(playerId) {
    return playerRepository.listTransfers(playerId);
  }
};
