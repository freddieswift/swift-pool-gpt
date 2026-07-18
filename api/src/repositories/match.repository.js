import { Division, Match, SeasonTeam, Team } from "../models/index.js";

const teamInclude = (alias) => ({
  model: SeasonTeam,
  as: alias,
  include: [{ model: Team, as: "team" }]
});

export const matchRepository = {
  createMany(rows, options = {}) {
    return Match.bulkCreate(rows, options);
  },

  findById(id, options = {}) {
    return Match.findByPk(id, options);
  },

  findDetailedById(id) {
    return Match.findByPk(id, {
      include: [
        { model: Division, as: "division" },
        teamInclude("homeSeasonTeam"),
        teamInclude("awaySeasonTeam")
      ]
    });
  },

  listBySeason(seasonId, { divisionId, status, from, to } = {}) {
    const Op = Match.sequelize.Sequelize.Op;
    return Match.findAll({
      where: {
        seasonId,
        ...(divisionId ? { divisionId } : {}),
        ...(status ? { status } : {}),
        ...((from || to)
          ? {
              scheduledAt: {
                ...(from ? { [Op.gte]: from } : {}),
                ...(to ? { [Op.lte]: to } : {})
              }
            }
          : {})
      },
      include: [
        { model: Division, as: "division" },
        teamInclude("homeSeasonTeam"),
        teamInclude("awaySeasonTeam")
      ],
      order: [["scheduledAt", "ASC"], ["roundNumber", "ASC"]]
    });
  }
};
