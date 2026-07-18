import { Division } from "../models/index.js";

export const divisionRepository = {
  create(data, options = {}) {
    return Division.create(data, options);
  },

  findById(id, options = {}) {
    return Division.findByPk(id, options);
  },

  findBySeasonAndSlug(seasonId, slug, options = {}) {
    return Division.findOne({
      where: { seasonId, slug },
      ...options
    });
  },

  listBySeason(seasonId) {
    return Division.findAll({
      where: { seasonId },
      order: [["position", "ASC"], ["name", "ASC"]]
    });
  },

  maxPosition(seasonId, transaction) {
    return Division.max("position", {
      where: { seasonId },
      transaction
    });
  }
};
