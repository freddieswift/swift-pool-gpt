import {
  Division,
  SeasonTeam,
  Team,
  SEASON_STATUSES,
  SEASON_TEAM_STATUSES,
  sequelize
} from "../models/index.js";
import { teamRepository } from "../repositories/team.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

function assertSeasonRegistrationEditable(season) {
  if (![SEASON_STATUSES.DRAFT, SEASON_STATUSES.REGISTRATION].includes(season.status)) {
    throw new ApiError(
      409,
      "Season teams can only be changed while the season is in draft or registration"
    );
  }
}

async function uniqueSlug(leagueId, preferred, transaction, excludeId = null) {
  const base = slugify(preferred) || "team";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await teamRepository.findByLeagueAndSlug(
      leagueId,
      candidate,
      { transaction }
    );

    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

async function validateDivision(season, divisionId, transaction) {
  if (!divisionId) return null;

  const division = await Division.findOne({
    where: {
      id: divisionId,
      seasonId: season.id,
      isActive: true
    },
    transaction
  });

  if (!division) {
    throw new ApiError(
      422,
      "Division does not belong to this season or is inactive"
    );
  }

  return division;
}

function normalizedNullable(value) {
  return value === "" ? null : value;
}

export const teamService = {
  list(leagueId, filters) {
    return teamRepository.listByLeague(leagueId, filters);
  },

  async getById(teamId) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new ApiError(404, "Team not found");
    return team;
  },

  async create(leagueId, payload) {
    return sequelize.transaction(async (transaction) => {
      const slug = await uniqueSlug(
        leagueId,
        payload.slug || payload.name,
        transaction
      );

      return teamRepository.create(
        {
          leagueId,
          name: payload.name,
          shortName: normalizedNullable(payload.shortName),
          slug,
          venueName: normalizedNullable(payload.venueName),
          venueAddress: normalizedNullable(payload.venueAddress),
          contactEmail: normalizedNullable(payload.contactEmail),
          contactPhone: normalizedNullable(payload.contactPhone),
          isActive: payload.isActive
        },
        { transaction }
      );
    });
  },

  async update(team, payload) {
    return sequelize.transaction(async (transaction) => {
      const updates = { ...payload };

      if (payload.slug || payload.name) {
        updates.slug = await uniqueSlug(
          team.leagueId,
          payload.slug || payload.name,
          transaction,
          team.id
        );
      }

      for (const field of [
        "shortName",
        "venueName",
        "venueAddress",
        "contactEmail",
        "contactPhone"
      ]) {
        if (field in updates) updates[field] = normalizedNullable(updates[field]);
      }

      await team.update(updates, { transaction });
      return team;
    });
  },

  async remove(team) {
    const participationCount = await SeasonTeam.count({
      where: { teamId: team.id }
    });

    if (participationCount > 0) {
      throw new ApiError(
        409,
        "Teams with season history cannot be deleted; deactivate the team instead"
      );
    }

    await team.destroy();
  },

  listSeasonTeams(seasonId) {
    return teamRepository.listSeasonTeams(seasonId);
  },

  async registerSeasonTeam(season, payload) {
    assertSeasonRegistrationEditable(season);

    return sequelize.transaction(async (transaction) => {
      const team = await Team.findOne({
        where: {
          id: payload.teamId,
          leagueId: season.leagueId,
          isActive: true
        },
        transaction
      });

      if (!team) {
        throw new ApiError(
          422,
          "Team does not belong to this league or is inactive"
        );
      }

      await validateDivision(season, payload.divisionId, transaction);

      const existing = await SeasonTeam.findOne({
        where: {
          seasonId: season.id,
          teamId: team.id
        },
        transaction
      });

      if (existing) {
        throw new ApiError(409, "Team is already registered for this season");
      }

      const status = payload.status || SEASON_TEAM_STATUSES.PENDING;

      const seasonTeam = await SeasonTeam.create(
        {
          seasonId: season.id,
          teamId: team.id,
          divisionId: payload.divisionId || null,
          status,
          seed: payload.seed || null,
          pointsAdjustment: payload.pointsAdjustment,
          adjustmentReason: normalizedNullable(payload.adjustmentReason),
          approvedAt:
            status === SEASON_TEAM_STATUSES.APPROVED ? new Date() : null
        },
        { transaction }
      );

      return teamRepository.findDetailedSeasonTeam(seasonTeam.id);
    });
  },

  async updateSeasonTeam(seasonTeam, season, payload) {
    assertSeasonRegistrationEditable(season);

    return sequelize.transaction(async (transaction) => {
      if ("divisionId" in payload) {
        await validateDivision(season, payload.divisionId, transaction);
      }

      const updates = { ...payload };

      if ("adjustmentReason" in updates) {
        updates.adjustmentReason = normalizedNullable(updates.adjustmentReason);
      }

      if (
        payload.status === SEASON_TEAM_STATUSES.APPROVED &&
        seasonTeam.status !== SEASON_TEAM_STATUSES.APPROVED
      ) {
        updates.approvedAt = new Date();
      }

      if (
        payload.status &&
        payload.status !== SEASON_TEAM_STATUSES.APPROVED
      ) {
        updates.approvedAt = null;
      }

      await seasonTeam.update(updates, { transaction });
      return teamRepository.findDetailedSeasonTeam(seasonTeam.id);
    });
  },

  async removeSeasonTeam(seasonTeam, season) {
    assertSeasonRegistrationEditable(season);
    await seasonTeam.destroy();
  }
};
