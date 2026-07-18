import {
  PlayerSanction,
  SanctionAppeal,
  SanctionAudit,
  SANCTION_STATUSES
} from "../models/index.js";

export const sanctionRepository = {
  listPlayerSanctions(playerId, includeInactive = false) {
    return PlayerSanction.findAll({
      where: {
        playerId,
        ...(includeInactive ? {} : { status: SANCTION_STATUSES.ACTIVE })
      },
      order: [["startsOn", "DESC"], ["createdAt", "DESC"]]
    });
  },

  findSanction(id, options = {}) {
    return PlayerSanction.findByPk(id, options);
  },

  findAppeal(id, options = {}) {
    return SanctionAppeal.findByPk(id, options);
  },

  listAppeals(sanctionId) {
    return SanctionAppeal.findAll({
      where: { sanctionId },
      order: [["createdAt", "DESC"]]
    });
  },

  createAudit(data, transaction) {
    return SanctionAudit.create(data, { transaction });
  },

  listAudits(sanctionId) {
    return SanctionAudit.findAll({
      where: { sanctionId },
      order: [["createdAt", "DESC"]]
    });
  }
};
