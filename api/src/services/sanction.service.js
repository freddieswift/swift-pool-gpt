import {
  PlayerSanction,
  SanctionAppeal,
  Season,
  APPEAL_STATUSES,
  SANCTION_STATUSES,
  SANCTION_TYPES,
  sequelize
} from "../models/index.js";
import { sanctionRepository } from "../repositories/sanction.repository.js";
import { ApiError } from "../utils/ApiError.js";

function dateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

async function validateSeason(player, seasonId, transaction) {
  if (!seasonId) return null;

  const season = await Season.findByPk(seasonId, { transaction });
  if (!season) throw new ApiError(404, "Season not found");
  if (season.leagueId !== player.leagueId) {
    throw new ApiError(422, "Season does not belong to the player's league");
  }

  return season;
}

export const sanctionService = {
  list(playerId, includeInactive) {
    return sanctionRepository.listPlayerSanctions(playerId, includeInactive);
  },

  get(sanctionId) {
    return sanctionRepository.findSanction(sanctionId);
  },

  async issue(player, userId, payload) {
    return sequelize.transaction(async (transaction) => {
      await validateSeason(player, payload.seasonId, transaction);

      const sanction = await PlayerSanction.create(
        {
          leagueId: player.leagueId,
          seasonId: payload.seasonId || null,
          playerId: player.id,
          type: payload.type,
          status: SANCTION_STATUSES.ACTIVE,
          reason: payload.reason,
          startsOn: dateOnly(payload.startsOn),
          endsOn: payload.endsOn ? dateOnly(payload.endsOn) : null,
          preventsMatchPlay:
            payload.type === SANCTION_TYPES.WARNING
              ? false
              : payload.preventsMatchPlay,
          issuedByUserId: userId
        },
        { transaction }
      );

      await sanctionRepository.createAudit(
        {
          sanctionId: sanction.id,
          action: "ISSUED",
          actorUserId: userId,
          details: {
            type: sanction.type,
            startsOn: sanction.startsOn,
            endsOn: sanction.endsOn,
            preventsMatchPlay: sanction.preventsMatchPlay
          }
        },
        transaction
      );

      return sanction;
    });
  },

  async update(sanction, userId, payload) {
    if (sanction.status !== SANCTION_STATUSES.ACTIVE) {
      throw new ApiError(409, "Only active sanctions can be updated");
    }

    return sequelize.transaction(async (transaction) => {
      const before = sanction.toJSON();
      const updates = { ...payload };
      delete updates.changeReason;

      if (updates.startsOn) updates.startsOn = dateOnly(updates.startsOn);
      if (updates.endsOn) updates.endsOn = dateOnly(updates.endsOn);

      const effectiveStartsOn = updates.startsOn || sanction.startsOn;
      const effectiveEndsOn =
        Object.prototype.hasOwnProperty.call(updates, "endsOn")
          ? updates.endsOn
          : sanction.endsOn;

      if (
        effectiveEndsOn &&
        effectiveEndsOn < effectiveStartsOn
      ) {
        throw new ApiError(422, "endsOn cannot be before startsOn");
      }

      await sanction.update(updates, { transaction });
      await sanctionRepository.createAudit(
        {
          sanctionId: sanction.id,
          action: "UPDATED",
          actorUserId: userId,
          details: {
            reason: payload.changeReason,
            previous: before,
            updated: sanction.toJSON()
          }
        },
        transaction
      );

      return sanction;
    });
  },

  async revoke(sanction, userId, reason) {
    if (sanction.status !== SANCTION_STATUSES.ACTIVE) {
      throw new ApiError(409, "Only active sanctions can be revoked");
    }

    return sequelize.transaction(async (transaction) => {
      await sanction.update(
        {
          status: SANCTION_STATUSES.REVOKED,
          revokedByUserId: userId,
          revokedAt: new Date(),
          revocationReason: reason
        },
        { transaction }
      );

      await sanctionRepository.createAudit(
        {
          sanctionId: sanction.id,
          action: "REVOKED",
          actorUserId: userId,
          details: { reason }
        },
        transaction
      );

      return sanction;
    });
  },

  appeals(sanctionId) {
    return sanctionRepository.listAppeals(sanctionId);
  },

  async appeal(sanction, player, user, payload) {
    if (sanction.status !== SANCTION_STATUSES.ACTIVE) {
      throw new ApiError(409, "Only active sanctions can be appealed");
    }

    const canSubmit =
      user.id === player.userId ||
      Boolean(
        await import("../models/index.js").then(({ LeagueAdmin }) =>
          LeagueAdmin.findOne({
            where: { leagueId: player.leagueId, userId: user.id }
          })
        )
      );

    if (!canSubmit) {
      throw new ApiError(403, "Only the linked player or a league administrator may appeal");
    }

    return sequelize.transaction(async (transaction) => {
      const existing = await SanctionAppeal.findOne({
        where: {
          sanctionId: sanction.id,
          status: APPEAL_STATUSES.PENDING
        },
        transaction
      });
      if (existing) {
        throw new ApiError(409, "This sanction already has a pending appeal");
      }

      const appeal = await SanctionAppeal.create(
        {
          sanctionId: sanction.id,
          playerId: player.id,
          status: APPEAL_STATUSES.PENDING,
          grounds: payload.grounds,
          submittedByUserId: user.id,
          submittedAt: new Date()
        },
        { transaction }
      );

      await sanctionRepository.createAudit(
        {
          sanctionId: sanction.id,
          action: "APPEALED",
          actorUserId: user.id,
          details: { appealId: appeal.id }
        },
        transaction
      );

      return appeal;
    });
  },

  async resolveAppeal(appeal, sanction, userId, payload) {
    if (appeal.status !== APPEAL_STATUSES.PENDING) {
      throw new ApiError(409, "Only pending appeals can be resolved");
    }

    return sequelize.transaction(async (transaction) => {
      await appeal.update(
        {
          status: payload.status,
          resolution: payload.resolution,
          resolvedByUserId: userId,
          resolvedAt: new Date()
        },
        { transaction }
      );

      if (payload.status === APPEAL_STATUSES.OVERTURNED) {
        await sanction.update(
          {
            status: SANCTION_STATUSES.REVOKED,
            revokedByUserId: userId,
            revokedAt: new Date(),
            revocationReason: `Appeal overturned: ${payload.resolution}`
          },
          { transaction }
        );
      } else if (payload.status === APPEAL_STATUSES.REDUCED) {
        if (!payload.revisedEndsOn) {
          throw new ApiError(422, "revisedEndsOn is required for a reduced sanction");
        }
        const revisedEndsOn = dateOnly(payload.revisedEndsOn);
        if (revisedEndsOn < sanction.startsOn) {
          throw new ApiError(422, "revisedEndsOn cannot be before sanction start");
        }
        await sanction.update({ endsOn: revisedEndsOn }, { transaction });
      }

      await sanctionRepository.createAudit(
        {
          sanctionId: sanction.id,
          action: "APPEAL_RESOLVED",
          actorUserId: userId,
          details: {
            appealId: appeal.id,
            outcome: payload.status,
            resolution: payload.resolution,
            revisedEndsOn: payload.revisedEndsOn || null
          }
        },
        transaction
      );

      return appeal;
    });
  },

  async withdrawAppeal(appeal, user, reason) {
    if (appeal.status !== APPEAL_STATUSES.PENDING) {
      throw new ApiError(409, "Only pending appeals can be withdrawn");
    }
    if (appeal.submittedByUserId !== user.id) {
      throw new ApiError(403, "Only the appeal submitter may withdraw it");
    }

    await appeal.update({
      status: APPEAL_STATUSES.WITHDRAWN,
      resolution: reason || "Withdrawn by submitter",
      resolvedByUserId: user.id,
      resolvedAt: new Date()
    });

    return appeal;
  },

  audits(sanctionId) {
    return sanctionRepository.listAudits(sanctionId);
  }
};
