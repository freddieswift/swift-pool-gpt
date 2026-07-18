import {
  MatchFormat,
  Season,
  SeasonRuleSnapshot
} from "../models/index.js";

export const seasonRepository = {
  create(data, options = {}) {
    return Season.create(data, options);
  },

  findById(id, options = {}) {
    return Season.findByPk(id, options);
  },

  findByLeagueAndSlug(leagueId, slug, options = {}) {
    return Season.findOne({
      where: { leagueId, slug },
      ...options
    });
  },

  listByLeague(leagueId, { status } = {}) {
    return Season.findAll({
      where: {
        leagueId,
        ...(status ? { status } : {})
      },
      include: [
        {
          model: MatchFormat,
          as: "matchFormat"
        },
        {
          model: SeasonRuleSnapshot,
          as: "ruleSnapshot"
        }
      ],
      order: [["startDate", "DESC"], ["name", "ASC"]]
    });
  },

  findDetailedById(id) {
    return Season.findByPk(id, {
      include: [
        {
          model: MatchFormat,
          as: "matchFormat"
        },
        {
          model: SeasonRuleSnapshot,
          as: "ruleSnapshot"
        }
      ]
    });
  }
};
