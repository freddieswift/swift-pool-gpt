import { Division, Season, SeasonTeam, Team } from "../models/index.js";

export const teamRepository = {
  create(data, options = {}) {
    return Team.create(data, options);
  },

  findById(id, options = {}) {
    return Team.findByPk(id, options);
  },

  findByLeagueAndSlug(leagueId, slug, options = {}) {
    return Team.findOne({ where: { leagueId, slug }, ...options });
  },

  listByLeague(leagueId, { includeInactive = false } = {}) {
    return Team.findAll({
      where: {
        leagueId,
        ...(includeInactive ? {} : { isActive: true })
      },
      order: [["name", "ASC"]]
    });
  },

  findSeasonTeamById(id, options = {}) {
    return SeasonTeam.findByPk(id, options);
  },

  listSeasonTeams(seasonId) {
    return SeasonTeam.findAll({
      where: { seasonId },
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

  findDetailedSeasonTeam(id) {
    return SeasonTeam.findByPk(id, {
      include: [
        { model: Team, as: "team" },
        { model: Division, as: "division", required: false },
        { model: Season, as: "season" }
      ]
    });
  }
};
