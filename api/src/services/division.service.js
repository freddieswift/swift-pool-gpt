import {
  Division,
  Season,
  SEASON_STATUSES,
  sequelize
} from "../models/index.js";
import { divisionRepository } from "../repositories/division.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

function assertEditableSeason(season) {
  if (![SEASON_STATUSES.DRAFT, SEASON_STATUSES.REGISTRATION].includes(season.status)) {
    throw new ApiError(
      409,
      "Divisions can only be changed while the season is in draft or registration"
    );
  }
}

async function uniqueSlug(seasonId, preferred, transaction, excludeId = null) {
  const base = slugify(preferred) || "division";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await divisionRepository.findBySeasonAndSlug(
      seasonId,
      candidate,
      { transaction }
    );

    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

async function nextAvailablePosition(seasonId, requested, transaction) {
  if (requested) {
    const occupied = await Division.findOne({
      where: { seasonId, position: requested },
      transaction
    });

    if (!occupied) return requested;
  }

  const currentMax = await divisionRepository.maxPosition(seasonId, transaction);
  return Number(currentMax || 0) + 1;
}

export const divisionService = {
  async list(seasonId) {
    return divisionRepository.listBySeason(seasonId);
  },

  async getById(divisionId) {
    const division = await divisionRepository.findById(divisionId);
    if (!division) throw new ApiError(404, "Division not found");
    return division;
  },

  async create(season, payload) {
    assertEditableSeason(season);

    return sequelize.transaction(async (transaction) => {
      const slug = await uniqueSlug(
        season.id,
        payload.slug || payload.name,
        transaction
      );

      const position = await nextAvailablePosition(
        season.id,
        payload.position,
        transaction
      );

      return divisionRepository.create(
        {
          seasonId: season.id,
          name: payload.name,
          slug,
          position,
          promotionPlaces: payload.promotionPlaces,
          relegationPlaces: payload.relegationPlaces,
          isActive: payload.isActive,
          notes: payload.notes || null
        },
        { transaction }
      );
    });
  },

  async update(division, season, payload) {
    assertEditableSeason(season);

    return sequelize.transaction(async (transaction) => {
      const updates = { ...payload };

      if (payload.slug || payload.name) {
        updates.slug = await uniqueSlug(
          division.seasonId,
          payload.slug || payload.name,
          transaction,
          division.id
        );
      }

      await division.update(updates, { transaction });
      return division;
    });
  },

  async reorder(season, divisionIds) {
    assertEditableSeason(season);

    return sequelize.transaction(async (transaction) => {
      const divisions = await Division.findAll({
        where: { seasonId: season.id },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      const existingIds = new Set(divisions.map((division) => division.id));

      if (
        divisionIds.length !== divisions.length ||
        divisionIds.some((id) => !existingIds.has(id))
      ) {
        throw new ApiError(
          422,
          "divisionIds must contain every division in this season exactly once"
        );
      }

      // Move to temporary positions first to avoid unique-index collisions.
      for (let index = 0; index < divisions.length; index += 1) {
        await divisions[index].update(
          { position: 100000 + index },
          { transaction }
        );
      }

      for (let index = 0; index < divisionIds.length; index += 1) {
        await Division.update(
          { position: index + 1 },
          {
            where: {
              id: divisionIds[index],
              seasonId: season.id
            },
            transaction
          }
        );
      }

      return divisionRepository.listBySeason(season.id);
    });
  },

  async remove(division, season) {
    assertEditableSeason(season);

    await sequelize.transaction(async (transaction) => {
      const removedPosition = division.position;

      await division.destroy({ transaction });

      const laterDivisions = await Division.findAll({
        where: {
          seasonId: season.id,
          position: {
            [sequelize.Sequelize.Op.gt]: removedPosition
          }
        },
        order: [["position", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      for (const laterDivision of laterDivisions) {
        await laterDivision.update(
          { position: laterDivision.position - 1 },
          { transaction }
        );
      }
    });
  }
};
