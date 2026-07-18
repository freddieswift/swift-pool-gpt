import {
  League,
  LeagueAdmin,
  LeagueSettings,
  MatchFormat,
  User
} from "../models/index.js";

export const leagueRepository = {
  create(data, options = {}) {
    return League.create(data, options);
  },

  findById(id, options = {}) {
    return League.findByPk(id, options);
  },

  findBySlug(slug, options = {}) {
    return League.findOne({ where: { slug }, ...options });
  },

  listForUser(userId) {
    return League.findAll({
      include: [
        {
          model: LeagueAdmin,
          as: "adminMemberships",
          where: { userId },
          attributes: ["role"],
          required: true
        },
        {
          model: LeagueSettings,
          as: "settings",
          required: false
        }
      ],
      order: [["name", "ASC"]]
    });
  },

  findDetailedById(id) {
    return League.findByPk(id, {
      include: [
        { model: LeagueSettings, as: "settings" },
        {
          model: LeagueAdmin,
          as: "adminMemberships",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email", "firstName", "lastName", "displayName"]
            }
          ]
        },
        { model: MatchFormat, as: "matchFormats" }
      ]
    });
  },

  findMembership(leagueId, userId, options = {}) {
    return LeagueAdmin.findOne({
      where: { leagueId, userId },
      ...options
    });
  }
};
