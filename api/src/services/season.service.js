import {
  HANDICAP_METHODS,
  LeagueSettings,
  MatchFormat,
  Season,
  SeasonRuleSnapshot,
  SEASON_STATUSES,
  sequelize
} from "../models/index.js";
import { seasonRepository } from "../repositories/season.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

const allowedTransitions = Object.freeze({
  [SEASON_STATUSES.DRAFT]: new Set([
    SEASON_STATUSES.REGISTRATION,
    SEASON_STATUSES.CANCELLED
  ]),
  [SEASON_STATUSES.REGISTRATION]: new Set([
    SEASON_STATUSES.DRAFT,
    SEASON_STATUSES.ACTIVE,
    SEASON_STATUSES.CANCELLED
  ]),
  [SEASON_STATUSES.ACTIVE]: new Set([
    SEASON_STATUSES.COMPLETED,
    SEASON_STATUSES.CANCELLED
  ]),
  [SEASON_STATUSES.COMPLETED]: new Set(),
  [SEASON_STATUSES.CANCELLED]: new Set()
});

async function uniqueSlug(leagueId, preferred, transaction, excludeId = null) {
  const base = slugify(preferred) || "season";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await seasonRepository.findByLeagueAndSlug(
      leagueId,
      candidate,
      { transaction }
    );

    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

function assertDateRange(startDate, endDate) {
  if (new Date(endDate) < new Date(startDate)) {
    throw new ApiError(422, "Season end date cannot be before its start date");
  }
}

function assertRegistrationRange({
  registrationOpensAt,
  registrationClosesAt,
  startDate
}) {
  if (
    registrationOpensAt &&
    registrationClosesAt &&
    new Date(registrationClosesAt) < new Date(registrationOpensAt)
  ) {
    throw new ApiError(
      422,
      "Registration closing time cannot be before registration opens"
    );
  }

  if (
    registrationClosesAt &&
    new Date(registrationClosesAt) > new Date(startDate)
  ) {
    throw new ApiError(
      422,
      "Registration must close on or before the season start date"
    );
  }
}

async function loadLeagueConfiguration(leagueId, matchFormatId, transaction) {
  const [matchFormat, settings] = await Promise.all([
    MatchFormat.findOne({
      where: {
        id: matchFormatId,
        leagueId,
        isActive: true
      },
      transaction
    }),
    LeagueSettings.findOne({
      where: { leagueId },
      transaction
    })
  ]);

  if (!matchFormat) {
    throw new ApiError(
      422,
      "The selected match format does not belong to this league or is inactive"
    );
  }

  return {
    matchFormat,
    settings: settings ?? {
      handicapEnabled: false,
      handicapMethod: HANDICAP_METHODS.NONE
    }
  };
}

async function replaceSnapshot(seasonId, matchFormat, settings, transaction) {
  await SeasonRuleSnapshot.upsert(
    {
      seasonId,
      matchFormatName: matchFormat.name,
      framesPerMatch: matchFormat.framesPerMatch,
      scoringMethod: matchFormat.scoringMethod,
      pointsPerFrame: matchFormat.pointsPerFrame,
      winPoints: matchFormat.winPoints,
      drawPoints: matchFormat.drawPoints,
      lossPoints: matchFormat.lossPoints,
      handicapEnabled: settings.handicapEnabled,
      handicapMethod: settings.handicapMethod
    },
    { transaction }
  );
}

export const seasonService = {
  list(leagueId, filters) {
    return seasonRepository.listByLeague(leagueId, filters);
  },

  async getById(seasonId) {
    const season = await seasonRepository.findDetailedById(seasonId);
    if (!season) throw new ApiError(404, "Season not found");
    return season;
  },

  async create(leagueId, payload) {
    return sequelize.transaction(async (transaction) => {
      assertDateRange(payload.startDate, payload.endDate);
      assertRegistrationRange(payload);

      const { matchFormat, settings } = await loadLeagueConfiguration(
        leagueId,
        payload.matchFormatId,
        transaction
      );

      const slug = await uniqueSlug(
        leagueId,
        payload.slug || payload.name,
        transaction
      );

      const season = await seasonRepository.create(
        {
          leagueId,
          name: payload.name,
          slug,
          startDate: payload.startDate,
          endDate: payload.endDate,
          registrationOpensAt: payload.registrationOpensAt ?? null,
          registrationClosesAt: payload.registrationClosesAt ?? null,
          status: SEASON_STATUSES.DRAFT,
          matchFormatId: matchFormat.id,
          teamsPlayEachOther: payload.teamsPlayEachOther,
          useHomeAndAway: payload.useHomeAndAway,
          pointsDeductionEnabled: payload.pointsDeductionEnabled,
          notes: payload.notes || null
        },
        { transaction }
      );

      await replaceSnapshot(season.id, matchFormat, settings, transaction);
      return seasonRepository.findDetailedById(season.id);
    });
  },

  async update(season, payload) {
    if (![SEASON_STATUSES.DRAFT, SEASON_STATUSES.REGISTRATION].includes(season.status)) {
      throw new ApiError(
        409,
        "Only draft or registration seasons can have their configuration changed"
      );
    }

    return sequelize.transaction(async (transaction) => {
      const merged = {
        ...season.toJSON(),
        ...payload
      };

      assertDateRange(merged.startDate, merged.endDate);
      assertRegistrationRange(merged);

      const updates = { ...payload };

      if (payload.slug || payload.name) {
        updates.slug = await uniqueSlug(
          season.leagueId,
          payload.slug || payload.name,
          transaction,
          season.id
        );
      }

      let matchFormat;
      let settings;

      if (payload.matchFormatId) {
        ({ matchFormat, settings } = await loadLeagueConfiguration(
          season.leagueId,
          payload.matchFormatId,
          transaction
        ));
      }

      await season.update(updates, { transaction });

      if (matchFormat) {
        await replaceSnapshot(season.id, matchFormat, settings, transaction);
      }

      return seasonRepository.findDetailedById(season.id);
    });
  },

  async updateStatus(season, nextStatus) {
    if (season.status === nextStatus) return season;

    const allowed = allowedTransitions[season.status];
    if (!allowed?.has(nextStatus)) {
      throw new ApiError(
        409,
        `Season cannot move from ${season.status} to ${nextStatus}`
      );
    }

    season.status = nextStatus;
    await season.save();

    return seasonRepository.findDetailedById(season.id);
  },

  async remove(season) {
    if (season.status !== SEASON_STATUSES.DRAFT) {
      throw new ApiError(409, "Only draft seasons can be deleted");
    }

    await season.destroy();
  }
};
