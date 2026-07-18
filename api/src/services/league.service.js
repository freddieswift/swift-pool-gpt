import {
  League,
  LeagueAdmin,
  LeagueSettings,
  MatchFormat,
  User,
  sequelize,
  LEAGUE_ADMIN_ROLES,
  HANDICAP_METHODS,
  SCORING_METHODS
} from "../models/index.js";
import { leagueRepository } from "../repositories/league.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

async function uniqueSlug(preferred, transaction, excludeId = null) {
  const base = slugify(preferred) || "league";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await League.findOne({
      where: { slug: candidate },
      transaction
    });

    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}

async function unsetOtherDefaults(leagueId, exceptId, transaction) {
  await MatchFormat.update(
    { isDefault: false },
    {
      where: {
        leagueId,
        ...(exceptId ? { id: { [sequelize.Sequelize.Op.ne]: exceptId } } : {})
      },
      transaction
    }
  );
}

export const leagueService = {
  async create(userId, payload) {
    return sequelize.transaction(async (transaction) => {
      const slug = await uniqueSlug(payload.slug || payload.name, transaction);

      const league = await leagueRepository.create(
        {
          name: payload.name,
          slug,
          description: payload.description || null,
          createdByUserId: userId
        },
        { transaction }
      );

      await LeagueAdmin.create(
        {
          leagueId: league.id,
          userId,
          role: LEAGUE_ADMIN_ROLES.OWNER
        },
        { transaction }
      );

      await LeagueSettings.create(
        {
          leagueId: league.id,
          handicapEnabled: false,
          handicapMethod: HANDICAP_METHODS.NONE
        },
        { transaction }
      );

      return leagueRepository.findDetailedById(league.id);
    });
  },

  listForUser(userId) {
    return leagueRepository.listForUser(userId);
  },

  async getById(leagueId) {
    const league = await leagueRepository.findDetailedById(leagueId);
    if (!league) throw new ApiError(404, "League not found");
    return league;
  },

  async update(league, payload) {
    return sequelize.transaction(async (transaction) => {
      const updates = { ...payload };

      if (payload.slug || payload.name) {
        updates.slug = await uniqueSlug(
          payload.slug || payload.name,
          transaction,
          league.id
        );
      }

      await league.update(updates, { transaction });
      return leagueRepository.findDetailedById(league.id);
    });
  },

  async remove(league) {
    await sequelize.transaction(async (transaction) => {
      await league.destroy({ transaction });
    });
  },

  async listAdmins(leagueId) {
    return LeagueAdmin.findAll({
      where: { leagueId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "firstName", "lastName", "displayName", "isActive"]
        }
      ],
      order: [["createdAt", "ASC"]]
    });
  },

  async addAdmin(leagueId, payload) {
    const user = await User.findByPk(payload.userId);
    if (!user) throw new ApiError(404, "User not found");
    if (!user.isActive) throw new ApiError(400, "Cannot add a disabled user");

    const [membership, created] = await LeagueAdmin.findOrCreate({
      where: { leagueId, userId: payload.userId },
      defaults: { role: payload.role }
    });

    if (!created) throw new ApiError(409, "User is already a league administrator");

    return LeagueAdmin.findOne({
      where: { leagueId, userId: payload.userId },
      include: [{ model: User, as: "user" }]
    });
  },

  async updateAdmin(leagueId, userId, role) {
    return sequelize.transaction(async (transaction) => {
      const membership = await LeagueAdmin.findOne({
        where: { leagueId, userId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!membership) throw new ApiError(404, "League administrator not found");

      if (membership.role === LEAGUE_ADMIN_ROLES.OWNER && role !== LEAGUE_ADMIN_ROLES.OWNER) {
        const ownerCount = await LeagueAdmin.count({
          where: { leagueId, role: LEAGUE_ADMIN_ROLES.OWNER },
          transaction
        });
        if (ownerCount <= 1) throw new ApiError(409, "A league must have at least one owner");
      }

      membership.role = role;
      await membership.save({ transaction });
      return membership;
    });
  },

  async removeAdmin(leagueId, userId) {
    return sequelize.transaction(async (transaction) => {
      const membership = await LeagueAdmin.findOne({
        where: { leagueId, userId },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!membership) throw new ApiError(404, "League administrator not found");

      if (membership.role === LEAGUE_ADMIN_ROLES.OWNER) {
        const ownerCount = await LeagueAdmin.count({
          where: { leagueId, role: LEAGUE_ADMIN_ROLES.OWNER },
          transaction
        });
        if (ownerCount <= 1) throw new ApiError(409, "The last league owner cannot be removed");
      }

      await membership.destroy({ transaction });
    });
  },

  async getSettings(leagueId) {
    const [settings] = await LeagueSettings.findOrCreate({
      where: { leagueId },
      defaults: {
        handicapEnabled: false,
        handicapMethod: HANDICAP_METHODS.NONE
      }
    });
    return settings;
  },

  async updateSettings(leagueId, payload) {
    const [settings] = await LeagueSettings.findOrCreate({ where: { leagueId } });

    const updates = { ...payload };
    if (updates.handicapEnabled === false) updates.handicapMethod = HANDICAP_METHODS.NONE;

    await settings.update(updates);
    return settings;
  },

  listMatchFormats(leagueId) {
    return MatchFormat.findAll({
      where: { leagueId },
      order: [["isDefault", "DESC"], ["name", "ASC"]]
    });
  },

  async createMatchFormat(leagueId, payload) {
    return sequelize.transaction(async (transaction) => {
      if (payload.isDefault) await unsetOtherDefaults(leagueId, null, transaction);

      const format = await MatchFormat.create(
        {
          leagueId,
          ...payload
        },
        { transaction }
      );

      return format;
    });
  },

  async updateMatchFormat(matchFormat, payload) {
    return sequelize.transaction(async (transaction) => {
      const updates = { ...payload };
      const scoringMethod = updates.scoringMethod || matchFormat.scoringMethod;

      if (scoringMethod === SCORING_METHODS.FRAME_POINTS) {
        updates.winPoints = null;
        updates.drawPoints = null;
        updates.lossPoints = null;
      } else if (scoringMethod === SCORING_METHODS.MATCH_RESULT) {
        updates.pointsPerFrame = null;
      }

      if (updates.isDefault === true) {
        await unsetOtherDefaults(matchFormat.leagueId, matchFormat.id, transaction);
      }

      await matchFormat.update(updates, { transaction });
      return matchFormat;
    });
  },

  async removeMatchFormat(matchFormat) {
    await matchFormat.destroy();
  }
};
