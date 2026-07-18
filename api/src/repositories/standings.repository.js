import {
  Division,
  Match,
  MatchFrame,
  Player,
  SeasonTeam,
  Team,
  MATCH_STATUSES,
  SEASON_TEAM_STATUSES
} from "../models/index.js";

export const standingsRepository = {
  listDivisionTeams(seasonId, divisionId) {
    return SeasonTeam.findAll({
      where: {
        seasonId,
        divisionId,
        status: [
          SEASON_TEAM_STATUSES.APPROVED,
          SEASON_TEAM_STATUSES.WITHDRAWN
        ]
      },
      include: [{ model: Team, as: "team" }],
      order: [[{ model: Team, as: "team" }, "name", "ASC"]]
    });
  },

  listCompletedMatches(seasonId, divisionId) {
    return Match.findAll({
      where: {
        seasonId,
        divisionId,
        status: MATCH_STATUSES.COMPLETED
      },
      order: [["completedAt", "ASC"], ["scheduledAt", "ASC"]]
    });
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
      ]
    });
  },

  listSeasonCompletedMatches(seasonId) {
    return Match.findAll({
      where: {
        seasonId,
        status: MATCH_STATUSES.COMPLETED
      }
    });
  },

  listSeasonFrames(seasonId) {
    return MatchFrame.findAll({
      include: [
        {
          model: Match,
          as: "match",
          required: true,
          where: {
            seasonId,
            status: MATCH_STATUSES.COMPLETED
          }
        },
        { model: Player, as: "homePlayer", required: false },
        { model: Player, as: "awayPlayer", required: false },
        { model: Player, as: "winnerPlayer", required: false }
      ],
      order: [
        [{ model: Match, as: "match" }, "scheduledAt", "ASC"],
        ["frameNumber", "ASC"]
      ]
    });
  }
};
