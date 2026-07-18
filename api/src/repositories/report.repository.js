import {
  Division,
  HandicapAudit,
  Match,
  MatchResultAudit,
  Player,
  PlayerHandicap,
  Season,
  SeasonTeam,
  Team,
  TeamHandicap,
  MATCH_STATUSES,
  SEASON_TEAM_STATUSES
} from "../models/index.js";

const teamInclude = (alias) => ({
  model: SeasonTeam,
  as: alias,
  include: [{ model: Team, as: "team" }]
});

export const reportRepository = {
  listLeagueSeasons(leagueId) {
    return Season.findAll({
      where: { leagueId },
      order: [["startDate", "DESC"], ["createdAt", "DESC"]]
    });
  },

  countLeagueTeams(leagueId) {
    return Team.count({ where: { leagueId, isActive: true } });
  },

  countLeaguePlayers(leagueId) {
    return Player.count({ where: { leagueId, isActive: true } });
  },

  listSeasonDivisions(seasonId) {
    return Division.findAll({
      where: { seasonId, isActive: true },
      order: [["position", "ASC"]]
    });
  },

  listSeasonTeams(seasonId) {
    return SeasonTeam.findAll({
      where: {
        seasonId,
        status: [
          SEASON_TEAM_STATUSES.APPROVED,
          SEASON_TEAM_STATUSES.WITHDRAWN
        ]
      },
      include: [
        { model: Team, as: "team" },
        { model: Division, as: "division", required: false }
      ],
      order: [
        [{ model: Division, as: "division" }, "position", "ASC"],
        [{ model: Team, as: "team" }, "name", "ASC"]
      ]
    });
  },

  listSeasonMatches(seasonId, where = {}) {
    return Match.findAll({
      where: { seasonId, ...where },
      include: [
        { model: Division, as: "division" },
        teamInclude("homeSeasonTeam"),
        teamInclude("awaySeasonTeam")
      ],
      order: [["scheduledAt", "ASC"], ["roundNumber", "ASC"]]
    });
  },

  listUpcomingMatches(seasonId, from, limit) {
    const Op = Match.sequelize.Sequelize.Op;
    return Match.findAll({
      where: {
        seasonId,
        scheduledAt: { [Op.gte]: from },
        status: [MATCH_STATUSES.SCHEDULED, MATCH_STATUSES.POSTPONED]
      },
      include: [
        { model: Division, as: "division" },
        teamInclude("homeSeasonTeam"),
        teamInclude("awaySeasonTeam")
      ],
      order: [["scheduledAt", "ASC"]],
      limit
    });
  },

  listRecentResults(seasonId, limit) {
    return Match.findAll({
      where: { seasonId, status: MATCH_STATUSES.COMPLETED },
      include: [
        { model: Division, as: "division" },
        teamInclude("homeSeasonTeam"),
        teamInclude("awaySeasonTeam")
      ],
      order: [["completedAt", "DESC"], ["scheduledAt", "DESC"]],
      limit
    });
  },

  countSeasonMatchesByStatus(seasonId) {
    return Match.findAll({
      where: { seasonId },
      attributes: [
        "status",
        [Match.sequelize.fn("COUNT", Match.sequelize.col("id")), "count"]
      ],
      group: ["status"],
      raw: true
    });
  },

  listResultAuditsForLeague(leagueId, limit) {
    return MatchResultAudit.findAll({
      include: [
        {
          model: Match,
          as: "match",
          required: true,
          include: [
            {
              model: Season,
              as: "season",
              required: true,
              where: { leagueId }
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit
    });
  },

  listHandicapAuditsForLeague(leagueId, limit) {
    return HandicapAudit.findAll({
      where: { leagueId },
      order: [["createdAt", "DESC"]],
      limit
    });
  },

  countSeasonPlayerHandicaps(seasonId) {
    return PlayerHandicap.count({ where: { seasonId } });
  },

  countSeasonTeamHandicaps(seasonId) {
    return TeamHandicap.count({ where: { seasonId } });
  }
};
