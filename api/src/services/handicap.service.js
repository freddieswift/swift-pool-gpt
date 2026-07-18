import {
  HandicapAudit,
  Player,
  PlayerHandicap,
  Season,
  SeasonTeam,
  TeamHandicap,
  HANDICAP_METHODS,
  HANDICAP_SOURCES,
  sequelize
} from "../models/index.js";
import { handicapRepository } from "../repositories/handicap.repository.js";
import { ApiError } from "../utils/ApiError.js";

function nullable(value) {
  return value === "" ? null : value;
}

function clamp(value, lower, upper) {
  return Math.min(Math.max(value, lower), upper);
}

function round2(value) {
  return Number(Number(value).toFixed(2));
}

async function assertSeasonInLeague(seasonId, leagueId, transaction) {
  if (!seasonId) return null;
  const season = await Season.findOne({
    where: { id: seasonId, leagueId },
    transaction
  });
  if (!season) throw new ApiError(422, "Season does not belong to this league");
  return season;
}

async function expireOverlappingPlayerHandicaps(
  playerId,
  seasonId,
  effectiveFrom,
  transaction
) {
  const Op = sequelize.Sequelize.Op;
  await PlayerHandicap.update(
    { effectiveUntil: effectiveFrom },
    {
      where: {
        playerId,
        seasonId: seasonId || null,
        effectiveFrom: { [Op.lt]: effectiveFrom },
        [Op.or]: [
          { effectiveUntil: null },
          { effectiveUntil: { [Op.gte]: effectiveFrom } }
        ]
      },
      transaction
    }
  );
}

async function expireOverlappingTeamHandicaps(
  seasonTeamId,
  effectiveFrom,
  transaction
) {
  const Op = sequelize.Sequelize.Op;
  await TeamHandicap.update(
    { effectiveUntil: effectiveFrom },
    {
      where: {
        seasonTeamId,
        effectiveFrom: { [Op.lt]: effectiveFrom },
        [Op.or]: [
          { effectiveUntil: null },
          { effectiveUntil: { [Op.gte]: effectiveFrom } }
        ]
      },
      transaction
    }
  );
}

function buildPlayerRecommendations(frames, options) {
  const stats = new Map();

  const touch = (playerId) => {
    if (!playerId) return null;
    if (!stats.has(playerId)) {
      stats.set(playerId, { playerId, played: 0, won: 0 });
    }
    return stats.get(playerId);
  };

  for (const frame of frames) {
    const home = touch(frame.homePlayerId);
    const away = touch(frame.awayPlayerId);
    if (home) home.played += 1;
    if (away) away.played += 1;

    if (frame.winnerSide === "HOME" && home) home.won += 1;
    if (frame.winnerSide === "AWAY" && away) away.won += 1;
  }

  return [...stats.values()]
    .filter((row) => row.played >= options.minimumFrames)
    .map((row) => {
      const winRate = row.played ? row.won / row.played : 0;
      const centred = (winRate - 0.5) * 20;
      const value = clamp(
        options.baseValue - centred * options.scale,
        options.lowerBound,
        options.upperBound
      );

      return {
        playerId: row.playerId,
        framesPlayed: row.played,
        framesWon: row.won,
        winPercentage: round2(winRate * 100),
        recommendedValue: round2(value)
      };
    })
    .sort((a, b) => a.recommendedValue - b.recommendedValue);
}

function buildTeamRecommendations(matches, teams, options) {
  const stats = new Map(
    teams.map((team) => [
      team.id,
      { seasonTeamId: team.id, teamName: team.team?.name, played: 0, won: 0 }
    ])
  );

  for (const match of matches) {
    const home = stats.get(match.homeSeasonTeamId);
    const away = stats.get(match.awaySeasonTeamId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;

    if (Number(match.homeFramesWon) > Number(match.awayFramesWon)) home.won += 1;
    if (Number(match.awayFramesWon) > Number(match.homeFramesWon)) away.won += 1;
  }

  return [...stats.values()]
    .filter((row) => row.played >= options.minimumMatches)
    .map((row) => {
      const winRate = row.played ? row.won / row.played : 0;
      const centred = (winRate - 0.5) * 20;
      const value = clamp(
        options.baseValue - centred * options.scale,
        options.lowerBound,
        options.upperBound
      );

      return {
        ...row,
        winPercentage: round2(winRate * 100),
        recommendedValue: round2(value)
      };
    })
    .sort((a, b) => a.recommendedValue - b.recommendedValue);
}

export const handicapService = {
  listPlayer(playerId) {
    return handicapRepository.listPlayerHandicaps(playerId);
  },

  listTeam(seasonTeamId) {
    return handicapRepository.listTeamHandicaps(seasonTeamId);
  },

  async createPlayer(player, userId, payload) {
    return sequelize.transaction(async (transaction) => {
      await assertSeasonInLeague(payload.seasonId, player.leagueId, transaction);
      await expireOverlappingPlayerHandicaps(
        player.id,
        payload.seasonId,
        payload.effectiveFrom,
        transaction
      );

      const handicap = await PlayerHandicap.create(
        {
          leagueId: player.leagueId,
          seasonId: payload.seasonId || null,
          playerId: player.id,
          value: payload.value,
          source: payload.source,
          effectiveFrom: payload.effectiveFrom,
          effectiveUntil: payload.effectiveUntil || null,
          notes: nullable(payload.notes),
          createdByUserId: userId
        },
        { transaction }
      );

      await handicapRepository.createAudit(
        {
          leagueId: player.leagueId,
          seasonId: payload.seasonId || null,
          entityType: "PLAYER",
          entityId: player.id,
          action: "CREATED",
          previousValue: null,
          newValue: payload.value,
          actedByUserId: userId
        },
        transaction
      );

      return handicap;
    });
  },

  async createTeam(seasonTeam, season, userId, payload) {
    if (payload.seasonId !== season.id) {
      throw new ApiError(422, "seasonId must match the selected season team");
    }

    return sequelize.transaction(async (transaction) => {
      await expireOverlappingTeamHandicaps(
        seasonTeam.id,
        payload.effectiveFrom,
        transaction
      );

      const handicap = await TeamHandicap.create(
        {
          leagueId: season.leagueId,
          seasonId: season.id,
          seasonTeamId: seasonTeam.id,
          value: payload.value,
          source: payload.source,
          effectiveFrom: payload.effectiveFrom,
          effectiveUntil: payload.effectiveUntil || null,
          notes: nullable(payload.notes),
          createdByUserId: userId
        },
        { transaction }
      );

      await handicapRepository.createAudit(
        {
          leagueId: season.leagueId,
          seasonId: season.id,
          entityType: "TEAM",
          entityId: seasonTeam.id,
          action: "CREATED",
          previousValue: null,
          newValue: payload.value,
          actedByUserId: userId
        },
        transaction
      );

      return handicap;
    });
  },

  async update(handicap, entityType, userId, payload) {
    return sequelize.transaction(async (transaction) => {
      const previousValue = Number(handicap.value);
      const updates = { ...payload };
      delete updates.reason;
      if ("notes" in updates) updates.notes = nullable(updates.notes);

      await handicap.update(updates, { transaction });

      await handicapRepository.createAudit(
        {
          leagueId: handicap.leagueId,
          seasonId: handicap.seasonId,
          entityType,
          entityId:
            entityType === "PLAYER"
              ? handicap.playerId
              : handicap.seasonTeamId,
          action: "UPDATED",
          previousValue,
          newValue: Number(handicap.value),
          reason: payload.reason,
          actedByUserId: userId
        },
        transaction
      );

      return handicap;
    });
  },

  async calculatePlayer(season, userId, options) {
    const frames = await handicapRepository.listSeasonPlayerPerformance(season.id);
    const recommendations = buildPlayerRecommendations(frames, options);

    if (options.apply) {
      await sequelize.transaction(async (transaction) => {
        for (const recommendation of recommendations) {
          const player = await Player.findByPk(recommendation.playerId, {
            transaction
          });
          if (!player || player.leagueId !== season.leagueId) continue;

          await expireOverlappingPlayerHandicaps(
            player.id,
            season.id,
            options.effectiveFrom,
            transaction
          );

          await PlayerHandicap.create(
            {
              leagueId: season.leagueId,
              seasonId: season.id,
              playerId: player.id,
              value: recommendation.recommendedValue,
              source: HANDICAP_SOURCES.CALCULATED,
              effectiveFrom: options.effectiveFrom,
              createdByUserId: userId
            },
            { transaction }
          );

          await handicapRepository.createAudit(
            {
              leagueId: season.leagueId,
              seasonId: season.id,
              entityType: "PLAYER",
              entityId: player.id,
              action: "RECALCULATED",
              previousValue: null,
              newValue: recommendation.recommendedValue,
              reason: "Automatic player handicap recalculation",
              actedByUserId: userId
            },
            transaction
          );
        }
      });
    }

    return { applied: options.apply, recommendations };
  },

  async calculateTeam(season, userId, options) {
    const [matches, teams] = await Promise.all([
      handicapRepository.listSeasonTeamPerformance(season.id),
      handicapRepository.listSeasonTeams(season.id)
    ]);
    const recommendations = buildTeamRecommendations(matches, teams, options);

    if (options.apply) {
      await sequelize.transaction(async (transaction) => {
        for (const recommendation of recommendations) {
          await expireOverlappingTeamHandicaps(
            recommendation.seasonTeamId,
            options.effectiveFrom,
            transaction
          );

          await TeamHandicap.create(
            {
              leagueId: season.leagueId,
              seasonId: season.id,
              seasonTeamId: recommendation.seasonTeamId,
              value: recommendation.recommendedValue,
              source: HANDICAP_SOURCES.CALCULATED,
              effectiveFrom: options.effectiveFrom,
              createdByUserId: userId
            },
            { transaction }
          );

          await handicapRepository.createAudit(
            {
              leagueId: season.leagueId,
              seasonId: season.id,
              entityType: "TEAM",
              entityId: recommendation.seasonTeamId,
              action: "RECALCULATED",
              previousValue: null,
              newValue: recommendation.recommendedValue,
              reason: "Automatic team handicap recalculation",
              actedByUserId: userId
            },
            transaction
          );
        }
      });
    }

    return { applied: options.apply, recommendations };
  },

  audits(leagueId, entityType, entityId) {
    return handicapRepository.listAudits(leagueId, entityType, entityId);
  }
};
