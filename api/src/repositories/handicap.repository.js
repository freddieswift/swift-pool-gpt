import {
  HandicapAudit,
  Match,
  MatchFrame,
  Player,
  PlayerHandicap,
  SeasonTeam,
  Team,
  TeamHandicap,
  MATCH_STATUSES
} from "../models/index.js";

export const handicapRepository = {
  listPlayerHandicaps(playerId) {
    return PlayerHandicap.findAll({
      where: { playerId },
      order: [["effectiveFrom", "DESC"], ["createdAt", "DESC"]]
    });
  },

  listTeamHandicaps(seasonTeamId) {
    return TeamHandicap.findAll({
      where: { seasonTeamId },
      order: [["effectiveFrom", "DESC"], ["createdAt", "DESC"]]
    });
  },

  findPlayerHandicap(id, options = {}) {
    return PlayerHandicap.findByPk(id, options);
  },

  findTeamHandicap(id, options = {}) {
    return TeamHandicap.findByPk(id, options);
  },

  listSeasonPlayerPerformance(seasonId) {
    return MatchFrame.findAll({
      include: [
        {
          model: Match,
          as: "match",
          required: true,
          where: { seasonId, status: MATCH_STATUSES.COMPLETED }
        },
        { model: Player, as: "homePlayer", required: false },
        { model: Player, as: "awayPlayer", required: false }
      ]
    });
  },

  listSeasonTeamPerformance(seasonId) {
    return Match.findAll({
      where: { seasonId, status: MATCH_STATUSES.COMPLETED }
    });
  },

  listSeasonTeams(seasonId) {
    return SeasonTeam.findAll({
      where: { seasonId },
      include: [{ model: Team, as: "team" }]
    });
  },

  createAudit(data, transaction) {
    return HandicapAudit.create(data, { transaction });
  },

  listAudits(leagueId, entityType, entityId) {
    return HandicapAudit.findAll({
      where: { leagueId, entityType, entityId },
      order: [["createdAt", "DESC"]]
    });
  }
};
