import {
  Player,
  PlayerTransfer,
  SeasonTeam,
  SeasonTeamPlayer,
  Team
} from "../models/index.js";

export const playerRepository = {
  create(data, options = {}) {
    return Player.create(data, options);
  },

  findById(id, options = {}) {
    return Player.findByPk(id, options);
  },

  listByLeague(leagueId, { includeInactive = false, search } = {}) {
    const where = {
      leagueId,
      ...(includeInactive ? {} : { isActive: true })
    };

    if (search) {
      const term = `%${search}%`;
      where[Player.sequelize.Sequelize.Op.or] = [
        { firstName: { [Player.sequelize.Sequelize.Op.like]: term } },
        { lastName: { [Player.sequelize.Sequelize.Op.like]: term } },
        { displayName: { [Player.sequelize.Sequelize.Op.like]: term } },
        { email: { [Player.sequelize.Sequelize.Op.like]: term } }
      ];
    }

    return Player.findAll({
      where,
      order: [["lastName", "ASC"], ["firstName", "ASC"]]
    });
  },

  listRoster(seasonTeamId) {
    return SeasonTeamPlayer.findAll({
      where: { seasonTeamId },
      include: [{ model: Player, as: "player" }],
      order: [["isCaptain", "DESC"], [{ model: Player, as: "player" }, "lastName", "ASC"]]
    });
  },

  findRosterEntry(id, options = {}) {
    return SeasonTeamPlayer.findByPk(id, options);
  },

  findDetailedRosterEntry(id) {
    return SeasonTeamPlayer.findByPk(id, {
      include: [
        { model: Player, as: "player" },
        {
          model: SeasonTeam,
          as: "seasonTeam",
          include: [{ model: Team, as: "team" }]
        }
      ]
    });
  },

  listTransfers(playerId) {
    return PlayerTransfer.findAll({
      where: { playerId },
      order: [["effectiveDate", "DESC"], ["createdAt", "DESC"]]
    });
  }
};
