import {
  Season,
  SeasonTeam,
  SeasonTransitionPlan,
  SEASON_STATUSES,
  SEASON_TEAM_STATUSES,
  TRANSITION_ACTIONS,
  TRANSITION_PLAN_STATUSES,
  sequelize
} from "../models/index.js";
import { standingsService } from "./standings.service.js";
import { transitionRepository } from "../repositories/transition.repository.js";
import { ApiError } from "../utils/ApiError.js";

function divisionMap(divisions) {
  return new Map(divisions.map((division) => [division.position, division]));
}

function recommendEntries(tables, sourceDivisions, targetDivisions) {
  const sourceByPosition = divisionMap(sourceDivisions);
  const targetByPosition = divisionMap(targetDivisions);
  const entries = [];

  for (const table of tables.divisions) {
    const sourceDivision = sourceDivisions.find(
      (division) => division.id === table.division.id
    );
    if (!sourceDivision) continue;

    const standings = table.standings;
    const promotionPlaces = sourceDivision.promotionPlaces || 0;
    const relegationPlaces = sourceDivision.relegationPlaces || 0;

    for (let index = 0; index < standings.length; index += 1) {
      const row = standings[index];
      let targetPosition = sourceDivision.position;
      let action = TRANSITION_ACTIONS.RETAIN;

      if (promotionPlaces > 0 && index < promotionPlaces) {
        if (sourceDivision.position > 1) {
          targetPosition = sourceDivision.position - 1;
          action = TRANSITION_ACTIONS.PROMOTE;
        }
      } else if (
        relegationPlaces > 0 &&
        index >= standings.length - relegationPlaces
      ) {
        if (sourceByPosition.has(sourceDivision.position + 1)) {
          targetPosition = sourceDivision.position + 1;
          action = TRANSITION_ACTIONS.RELEGATE;
        }
      }

      const targetDivision = targetByPosition.get(targetPosition) || null;
      entries.push({
        teamId: row.teamId,
        sourceSeasonTeamId: row.seasonTeamId,
        sourceDivisionId: sourceDivision.id,
        targetDivisionId: targetDivision?.id || null,
        sourcePosition: row.position,
        action: targetDivision ? action : TRANSITION_ACTIONS.UNASSIGNED,
        seed: row.position
      });
    }
  }

  return entries;
}

async function validateSeasons(sourceSeason, targetSeasonId, transaction) {
  const target = await Season.findByPk(targetSeasonId, { transaction });
  if (!target) throw new ApiError(404, "Target season not found");
  if (target.leagueId !== sourceSeason.leagueId) {
    throw new ApiError(422, "Source and target seasons must belong to the same league");
  }
  if (target.id === sourceSeason.id) {
    throw new ApiError(422, "Target season must be different from source season");
  }
  if (![SEASON_STATUSES.DRAFT, SEASON_STATUSES.REGISTRATION].includes(target.status)) {
    throw new ApiError(409, "Target season must be DRAFT or REGISTRATION");
  }
  return target;
}

export const transitionService = {
  list(sourceSeasonId) {
    return transitionRepository.listPlans(sourceSeasonId);
  },

  get(planId) {
    return transitionRepository.findPlan(planId);
  },

  async generate(sourceSeason, userId, payload) {
    if (![SEASON_STATUSES.ACTIVE, SEASON_STATUSES.COMPLETED].includes(sourceSeason.status)) {
      throw new ApiError(409, "Source season must be ACTIVE or COMPLETED");
    }

    return sequelize.transaction(async (transaction) => {
      const targetSeason = await validateSeasons(
        sourceSeason,
        payload.targetSeasonId,
        transaction
      );
      const [sourceDivisions, targetDivisions, tables] = await Promise.all([
        transitionRepository.listDivisions(sourceSeason.id, transaction),
        transitionRepository.listDivisions(targetSeason.id, transaction),
        standingsService.seasonTables(sourceSeason, {
          formSize: 5,
          includeWithdrawn: false
        })
      ]);

      if (!targetDivisions.length) {
        throw new ApiError(422, "Target season must have divisions before generating a plan");
      }

      const plan = await SeasonTransitionPlan.create(
        {
          sourceSeasonId: sourceSeason.id,
          targetSeasonId: targetSeason.id,
          notes: payload.notes || null,
          createdByUserId: userId
        },
        { transaction }
      );

      const entries = recommendEntries(tables, sourceDivisions, targetDivisions);
      await transitionRepository.replaceEntries(
        plan.id,
        entries.map((entry) => ({ planId: plan.id, ...entry })),
        transaction
      );

      await transitionRepository.createAudit(
        {
          planId: plan.id,
          action: "GENERATED",
          actorUserId: userId,
          details: { entryCount: entries.length }
        },
        transaction
      );

      return transitionRepository.findPlan(plan.id, { transaction });
    });
  },

  async replaceEntries(plan, userId, entries) {
    if (plan.status !== TRANSITION_PLAN_STATUSES.DRAFT) {
      throw new ApiError(409, "Only draft plans can be edited");
    }

    return sequelize.transaction(async (transaction) => {
      const targetDivisions = await transitionRepository.listDivisions(
        plan.targetSeasonId,
        transaction
      );
      const validTargetIds = new Set(targetDivisions.map((division) => division.id));

      for (const entry of entries) {
        if (entry.targetDivisionId && !validTargetIds.has(entry.targetDivisionId)) {
          throw new ApiError(422, "A target division does not belong to the target season");
        }
      }

      await transitionRepository.replaceEntries(
        plan.id,
        entries.map((entry) => ({ planId: plan.id, ...entry })),
        transaction
      );
      await transitionRepository.createAudit(
        {
          planId: plan.id,
          action: "UPDATED",
          actorUserId: userId,
          details: { entryCount: entries.length }
        },
        transaction
      );
      return transitionRepository.findPlan(plan.id, { transaction });
    });
  },

  async approve(plan, userId, reason) {
    if (plan.status !== TRANSITION_PLAN_STATUSES.DRAFT) {
      throw new ApiError(409, "Only draft plans can be approved");
    }
    const fullPlan = await transitionRepository.findPlan(plan.id);
    if (fullPlan.entries.some((entry) => !entry.targetDivisionId)) {
      throw new ApiError(422, "All entries require a target division before approval");
    }

    await plan.update({
      status: TRANSITION_PLAN_STATUSES.APPROVED,
      approvedByUserId: userId,
      approvedAt: new Date()
    });
    await transitionRepository.createAudit({
      planId: plan.id,
      action: "APPROVED",
      actorUserId: userId,
      details: { reason: reason || null }
    });
    return transitionRepository.findPlan(plan.id);
  },

  async apply(plan, userId, reason) {
    if (plan.status !== TRANSITION_PLAN_STATUSES.APPROVED) {
      throw new ApiError(409, "Only approved plans can be applied");
    }

    return sequelize.transaction(async (transaction) => {
      const lockedPlan = await SeasonTransitionPlan.findByPk(plan.id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      const fullPlan = await transitionRepository.findPlan(plan.id, { transaction });
      const targetSeason = await Season.findByPk(plan.targetSeasonId, { transaction });
      if (![SEASON_STATUSES.DRAFT, SEASON_STATUSES.REGISTRATION].includes(targetSeason.status)) {
        throw new ApiError(409, "Target season no longer accepts structural changes");
      }

      for (const entry of fullPlan.entries) {
        let seasonTeam = await transitionRepository.findTargetSeasonTeam(
          plan.targetSeasonId,
          entry.teamId,
          transaction
        );

        if (seasonTeam) {
          await seasonTeam.update(
            {
              divisionId: entry.targetDivisionId,
              seed: entry.seed,
              status: SEASON_TEAM_STATUSES.APPROVED,
              approvedAt: seasonTeam.approvedAt || new Date()
            },
            { transaction }
          );
        } else {
          seasonTeam = await SeasonTeam.create(
            {
              seasonId: plan.targetSeasonId,
              teamId: entry.teamId,
              divisionId: entry.targetDivisionId,
              seed: entry.seed,
              status: SEASON_TEAM_STATUSES.APPROVED,
              approvedAt: new Date()
            },
            { transaction }
          );
        }
      }

      await lockedPlan.update(
        {
          status: TRANSITION_PLAN_STATUSES.APPLIED,
          appliedByUserId: userId,
          appliedAt: new Date()
        },
        { transaction }
      );

      await transitionRepository.createAudit(
        {
          planId: plan.id,
          action: "APPLIED",
          actorUserId: userId,
          details: { reason: reason || null, entryCount: fullPlan.entries.length }
        },
        transaction
      );

      return transitionRepository.findPlan(plan.id, { transaction });
    });
  },

  async cancel(plan, userId, reason) {
    if (plan.status === TRANSITION_PLAN_STATUSES.APPLIED) {
      throw new ApiError(409, "Applied plans cannot be cancelled");
    }
    await plan.update({ status: TRANSITION_PLAN_STATUSES.CANCELLED });
    await transitionRepository.createAudit({
      planId: plan.id,
      action: "CANCELLED",
      actorUserId: userId,
      details: { reason: reason || null }
    });
    return transitionRepository.findPlan(plan.id);
  },

  audits(planId) {
    return transitionRepository.listAudits(planId);
  }
};
