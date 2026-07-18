import {
  Division,
  Match,
  SeasonTeam,
  Team,
  MATCH_STATUSES,
  SEASON_STATUSES,
  SEASON_TEAM_STATUSES,
  sequelize
} from "../models/index.js";
import { matchRepository } from "../repositories/match.repository.js";
import { ApiError } from "../utils/ApiError.js";

function assertScheduleEditable(season) {
  if (![SEASON_STATUSES.DRAFT, SEASON_STATUSES.REGISTRATION].includes(season.status)) {
    throw new ApiError(
      409,
      "Fixtures can only be generated or structurally changed in draft or registration"
    );
  }
}

function combineDateAndTime(dateValue, time) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) throw new ApiError(422, "Invalid start date");
  const [hours, minutes] = time.split(":").map(Number);
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function roundRobin(teamIds) {
  const participants = [...teamIds];
  if (participants.length % 2 === 1) participants.push(null);

  const rounds = [];
  const count = participants.length;

  for (let round = 0; round < count - 1; round += 1) {
    const pairings = [];
    for (let index = 0; index < count / 2; index += 1) {
      const left = participants[index];
      const right = participants[count - 1 - index];
      if (left && right) {
        const reverse = (round + index) % 2 === 1;
        pairings.push(reverse ? [right, left] : [left, right]);
      }
    }
    rounds.push(pairings);
    participants.splice(1, 0, participants.pop());
  }

  return rounds;
}

async function validateMatchTeams(season, divisionId, homeId, awayId, transaction) {
  if (homeId === awayId) throw new ApiError(422, "Home and away teams must differ");

  const division = await Division.findOne({
    where: { id: divisionId, seasonId: season.id, isActive: true },
    transaction
  });
  if (!division) throw new ApiError(422, "Division does not belong to this season");

  const teams = await SeasonTeam.findAll({
    where: {
      id: [homeId, awayId],
      seasonId: season.id,
      divisionId,
      status: SEASON_TEAM_STATUSES.APPROVED
    },
    transaction
  });
  if (teams.length !== 2) {
    throw new ApiError(
      422,
      "Both teams must be approved members of the selected season division"
    );
  }
}

async function assertNoTeamConflict(
  seasonId,
  scheduledAt,
  homeId,
  awayId,
  transaction,
  excludeMatchId = null
) {
  const Op = sequelize.Sequelize.Op;
  const conflict = await Match.findOne({
    where: {
      seasonId,
      scheduledAt,
      ...(excludeMatchId ? { id: { [Op.ne]: excludeMatchId } } : {}),
      [Op.or]: [
        { homeSeasonTeamId: { [Op.in]: [homeId, awayId] } },
        { awaySeasonTeamId: { [Op.in]: [homeId, awayId] } }
      ],
      status: { [Op.ne]: MATCH_STATUSES.CANCELLED }
    },
    transaction
  });

  if (conflict) throw new ApiError(409, "A team already has a match at this time");
}

export const matchService = {
  list(seasonId, filters) {
    return matchRepository.listBySeason(seasonId, filters);
  },

  async getById(matchId) {
    const match = await matchRepository.findDetailedById(matchId);
    if (!match) throw new ApiError(404, "Match not found");
    return match;
  },

  async generate(division, season, payload) {
    assertScheduleEditable(season);

    return sequelize.transaction(async (transaction) => {
      const teams = await SeasonTeam.findAll({
        where: {
          seasonId: season.id,
          divisionId: division.id,
          status: SEASON_TEAM_STATUSES.APPROVED
        },
        include: [{ model: Team, as: "team" }],
        order: [["seed", "ASC"], [{ model: Team, as: "team" }, "name", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (teams.length < 2) {
        throw new ApiError(422, "At least two approved teams are required");
      }

      const existingCount = await Match.count({
        where: { seasonId: season.id, divisionId: division.id },
        transaction
      });

      if (existingCount > 0 && !payload.replaceExisting) {
        throw new ApiError(
          409,
          "Fixtures already exist for this division; set replaceExisting to regenerate"
        );
      }

      if (payload.replaceExisting) {
        const protectedCount = await Match.count({
          where: {
            seasonId: season.id,
            divisionId: division.id,
            status: [
              MATCH_STATUSES.IN_PROGRESS,
              MATCH_STATUSES.COMPLETED
            ]
          },
          transaction
        });
        if (protectedCount > 0) {
          throw new ApiError(
            409,
            "Fixtures cannot be regenerated after matches have started"
          );
        }
        await Match.destroy({
          where: { seasonId: season.id, divisionId: division.id },
          transaction
        });
      }

      const baseRounds = roundRobin(teams.map((team) => team.id));
      const meetingCount = season.teamsPlayEachOther;
      const firstDate = combineDateAndTime(payload.startDate, payload.kickoffTime);
      const rows = [];
      let globalRound = 1;

      for (let leg = 1; leg <= meetingCount; leg += 1) {
        for (let roundIndex = 0; roundIndex < baseRounds.length; roundIndex += 1) {
          const scheduledAt = addDays(
            firstDate,
            (globalRound - 1) * payload.intervalDays
          );

          for (const [baseHome, baseAway] of baseRounds[roundIndex]) {
            const reverse = season.useHomeAndAway && leg % 2 === 0;
            const homeSeasonTeamId = reverse ? baseAway : baseHome;
            const awaySeasonTeamId = reverse ? baseHome : baseAway;
            const home = teams.find((team) => team.id === homeSeasonTeamId);

            rows.push({
              seasonId: season.id,
              divisionId: division.id,
              homeSeasonTeamId,
              awaySeasonTeamId,
              roundNumber: globalRound,
              legNumber: leg,
              scheduledAt,
              venueName: home?.team?.venueName || null,
              status: MATCH_STATUSES.SCHEDULED
            });
          }
          globalRound += 1;
        }
      }

      await matchRepository.createMany(rows, { transaction });
      return matchRepository.listBySeason(season.id, { divisionId: division.id });
    });
  },

  async create(season, payload) {
    assertScheduleEditable(season);

    return sequelize.transaction(async (transaction) => {
      await validateMatchTeams(
        season,
        payload.divisionId,
        payload.homeSeasonTeamId,
        payload.awaySeasonTeamId,
        transaction
      );
      await assertNoTeamConflict(
        season.id,
        payload.scheduledAt,
        payload.homeSeasonTeamId,
        payload.awaySeasonTeamId,
        transaction
      );

      let venueName = payload.venueName || null;
      if (!venueName) {
        const home = await SeasonTeam.findByPk(payload.homeSeasonTeamId, {
          include: [{ model: Team, as: "team" }],
          transaction
        });
        venueName = home?.team?.venueName || null;
      }

      const match = await Match.create(
        {
          seasonId: season.id,
          divisionId: payload.divisionId,
          homeSeasonTeamId: payload.homeSeasonTeamId,
          awaySeasonTeamId: payload.awaySeasonTeamId,
          roundNumber: payload.roundNumber,
          legNumber: payload.legNumber,
          scheduledAt: payload.scheduledAt,
          venueName,
          notes: payload.notes || null
        },
        { transaction }
      );

      return matchRepository.findDetailedById(match.id);
    });
  },

  async update(match, payload) {
    if (match.status === MATCH_STATUSES.COMPLETED) {
      throw new ApiError(409, "Completed matches cannot be rescheduled");
    }

    return sequelize.transaction(async (transaction) => {
      if (payload.scheduledAt) {
        await assertNoTeamConflict(
          match.seasonId,
          payload.scheduledAt,
          match.homeSeasonTeamId,
          match.awaySeasonTeamId,
          transaction,
          match.id
        );
      }

      const updates = { ...payload };
      for (const field of ["venueName", "postponedReason", "notes"]) {
        if (updates[field] === "") updates[field] = null;
      }

      if (payload.status === MATCH_STATUSES.COMPLETED) {
        updates.completedAt = new Date();
      } else if (payload.status && payload.status !== MATCH_STATUSES.COMPLETED) {
        updates.completedAt = null;
      }

      if (payload.status !== MATCH_STATUSES.POSTPONED && payload.status) {
        updates.postponedReason = null;
      }

      await match.update(updates, { transaction });
      return matchRepository.findDetailedById(match.id);
    });
  },

  async remove(match, season) {
    assertScheduleEditable(season);
    if ([MATCH_STATUSES.IN_PROGRESS, MATCH_STATUSES.COMPLETED].includes(match.status)) {
      throw new ApiError(409, "Started or completed matches cannot be deleted");
    }
    await match.destroy();
  }
};
