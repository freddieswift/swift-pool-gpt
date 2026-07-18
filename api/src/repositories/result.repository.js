import {
  Match,
  MatchFrame,
  MatchResultAudit,
  Player,
  SeasonTeam,
  Team
} from "../models/index.js";

export const resultRepository = {
  findMatchAggregate(matchId, options = {}) {
    return Match.findByPk(matchId, {
      include: [
        {
          model: SeasonTeam,
          as: "homeSeasonTeam",
          include: [{ model: Team, as: "team" }]
        },
        {
          model: SeasonTeam,
          as: "awaySeasonTeam",
          include: [{ model: Team, as: "team" }]
        },
        {
          model: MatchFrame,
          as: "frames",
          separate: true,
          order: [["frameNumber", "ASC"]],
          include: [
            { model: Player, as: "homePlayer", required: false },
            { model: Player, as: "awayPlayer", required: false },
            { model: Player, as: "winnerPlayer", required: false }
          ]
        }
      ],
      ...options
    });
  },

  replaceFrames(matchId, frames, transaction) {
    return MatchFrame.destroy({ where: { matchId }, transaction }).then(() =>
      MatchFrame.bulkCreate(frames, { transaction })
    );
  },

  createAudit(data, transaction) {
    return MatchResultAudit.create(data, { transaction });
  },

  listAudits(matchId) {
    return MatchResultAudit.findAll({
      where: { matchId },
      order: [["createdAt", "DESC"]]
    });
  }
};
