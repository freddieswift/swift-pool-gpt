import {
  Division,
  League,
  LeagueSettings,
  Match,
  MatchFrame,
  Player,
  Season,
  SeasonTeam,
  SeasonTeamPlayer,
  Team,
  MATCH_STATUSES,
  SEASON_STATUSES,
  SEASON_TEAM_STATUSES
} from "../models/index.js";

const publicSeasonStatuses = [
  SEASON_STATUSES.REGISTRATION,
  SEASON_STATUSES.ACTIVE,
  SEASON_STATUSES.COMPLETED
];

const teamInclude = (alias) => ({
  model: SeasonTeam,
  as: alias,
  include: [
    {
      model: Team,
      as: "team",
      attributes: ["id", "name", "shortName", "slug", "venueName"]
    }
  ]
});

export const publicRepository = {
  findLeagueBySlug(slug) {
    return League.findOne({
      where: { slug, isActive: true },
      attributes: ["id", "name", "slug", "description", "isActive"],
      include: [
        {
          model: LeagueSettings,
          as: "settings",
          required: true,
          attributes: [
            "publicEnabled",
            "publicRosterNames",
            "publicPlayerStatistics",
            "publicVenueAddresses"
          ]
        }
      ]
    });
  },

  listSeasons(leagueId) {
    return Season.findAll({
      where: {
        leagueId,
        status: publicSeasonStatuses
      },
      attributes: [
        "id",
        "name",
        "slug",
        "startDate",
        "endDate",
        "status",
        "teamsPlayEachOther",
        "useHomeAndAway"
      ],
      order: [["startDate", "DESC"]]
    });
  },

  findSeasonBySlug(leagueId, slug) {
    return Season.findOne({
      where: {
        leagueId,
        slug,
        status: publicSeasonStatuses
      },
      attributes: [
        "id",
        "leagueId",
        "name",
        "slug",
        "startDate",
        "endDate",
        "status",
        "teamsPlayEachOther",
        "useHomeAndAway"
      ]
    });
  },

  listDivisions(seasonId) {
    return Division.findAll({
      where: { seasonId, isActive: true },
      attributes: ["id", "name", "position", "promotionPlaces", "relegationPlaces"],
      order: [["position", "ASC"]]
    });
  },

  listTeams(seasonId) {
    return SeasonTeam.findAll({
      where: {
        seasonId,
        status: [
          SEASON_TEAM_STATUSES.APPROVED,
          SEASON_TEAM_STATUSES.WITHDRAWN
        ]
      },
      attributes: [
        "id",
        "teamId",
        "divisionId",
        "status",
        "seed",
        "pointsAdjustment"
      ],
      include: [
        {
          model: Team,
          as: "team",
          attributes: [
            "id",
            "name",
            "shortName",
            "slug",
            "venueName",
            "venueAddress"
          ]
        },
        {
          model: Division,
          as: "division",
          required: false,
          attributes: ["id", "name", "position"]
        }
      ],
      order: [
        [{ model: Division, as: "division" }, "position", "ASC"],
        [{ model: Team, as: "team" }, "name", "ASC"]
      ]
    });
  },

  listMatches(seasonId, filters) {
    const where = {
      seasonId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.divisionId ? { divisionId: filters.divisionId } : {})
    };

    return Match.findAll({
      where,
      attributes: [
        "id",
        "seasonId",
        "divisionId",
        "homeSeasonTeamId",
        "awaySeasonTeamId",
        "roundNumber",
        "legNumber",
        "scheduledAt",
        "venueName",
        "status",
        "postponedReason",
        "completedAt",
        "homeFramesWon",
        "awayFramesWon",
        "homeMatchPoints",
        "awayMatchPoints"
      ],
      include: [
        {
          model: Division,
          as: "division",
          attributes: ["id", "name", "position"]
        },
        teamInclude("homeSeasonTeam"),
        teamInclude("awaySeasonTeam")
      ],
      order: [["scheduledAt", filters.order === "desc" ? "DESC" : "ASC"]],
      limit: filters.limit
    });
  },

  findMatch(seasonId, matchId) {
    return Match.findOne({
      where: { id: matchId, seasonId },
      attributes: [
        "id",
        "seasonId",
        "divisionId",
        "homeSeasonTeamId",
        "awaySeasonTeamId",
        "roundNumber",
        "legNumber",
        "scheduledAt",
        "venueName",
        "status",
        "postponedReason",
        "completedAt",
        "homeFramesWon",
        "awayFramesWon",
        "homeMatchPoints",
        "awayMatchPoints"
      ],
      include: [
        {
          model: Division,
          as: "division",
          attributes: ["id", "name", "position"]
        },
        teamInclude("homeSeasonTeam"),
        teamInclude("awaySeasonTeam"),
        {
          model: MatchFrame,
          as: "frames",
          required: false,
          attributes: [
            "id",
            "frameNumber",
            "homePlayerId",
            "awayPlayerId",
            "winnerPlayerId",
            "winnerSide",
            "resultType",
            "homeFramePoints",
            "awayFramePoints"
          ],
          include: [
            {
              model: Player,
              as: "homePlayer",
              attributes: ["id", "displayName"]
            },
            {
              model: Player,
              as: "awayPlayer",
              attributes: ["id", "displayName"]
            },
            {
              model: Player,
              as: "winnerPlayer",
              attributes: ["id", "displayName"]
            }
          ]
        }
      ],
      order: [[{ model: MatchFrame, as: "frames" }, "frameNumber", "ASC"]]
    });
  },

  listRoster(seasonId) {
    return SeasonTeam.findAll({
      where: {
        seasonId,
        status: SEASON_TEAM_STATUSES.APPROVED
      },
      attributes: ["id", "teamId", "divisionId"],
      include: [
        {
          model: Team,
          as: "team",
          attributes: ["id", "name", "shortName", "slug"]
        },
        {
          model: SeasonTeamPlayer,
          as: "rosterEntries",
          required: false,
          attributes: ["id", "isCaptain", "status"],
          where: { status: "ACTIVE" },
          include: [
            {
              model: Player,
              as: "player",
              attributes: ["id", "displayName"]
            }
          ]
        }
      ],
      order: [
        [{ model: Team, as: "team" }, "name", "ASC"],
        [
          { model: SeasonTeamPlayer, as: "rosterEntries" },
          { model: Player, as: "player" },
          "displayName",
          "ASC"
        ]
      ]
    });
  }
};
