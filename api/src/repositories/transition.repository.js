import {
  Division,
  SeasonTransitionAudit,
  SeasonTransitionEntry,
  SeasonTransitionPlan,
  SeasonTeam,
  Team
} from "../models/index.js";

export const transitionRepository = {
  findPlan(id, options = {}) {
    return SeasonTransitionPlan.findByPk(id, {
      include: [
        {
          model: SeasonTransitionEntry,
          as: "entries",
          separate: true,
          order: [["sourcePosition", "ASC"]],
          include: [
            { model: Team, as: "team" },
            { model: Division, as: "sourceDivision", required: false },
            { model: Division, as: "targetDivision", required: false }
          ]
        }
      ],
      ...options
    });
  },

  listPlans(sourceSeasonId) {
    return SeasonTransitionPlan.findAll({
      where: { sourceSeasonId },
      order: [["createdAt", "DESC"]]
    });
  },

  listDivisions(seasonId, transaction) {
    return Division.findAll({
      where: { seasonId, isActive: true },
      order: [["position", "ASC"]],
      transaction
    });
  },

  replaceEntries(planId, entries, transaction) {
    return SeasonTransitionEntry.destroy({
      where: { planId },
      transaction
    }).then(() => SeasonTransitionEntry.bulkCreate(entries, { transaction }));
  },

  createAudit(data, transaction) {
    return SeasonTransitionAudit.create(data, { transaction });
  },

  listAudits(planId) {
    return SeasonTransitionAudit.findAll({
      where: { planId },
      order: [["createdAt", "DESC"]]
    });
  },

  findTargetSeasonTeam(targetSeasonId, teamId, transaction) {
    return SeasonTeam.findOne({
      where: { seasonId: targetSeasonId, teamId },
      transaction
    });
  }
};
