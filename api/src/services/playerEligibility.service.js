import {
  PlayerSanction,
  SANCTION_STATUSES,
  SANCTION_TYPES
} from "../models/index.js";

function dateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

export const playerEligibilityService = {
  async blockingSanction(playerId, seasonId, matchDate, transaction) {
    const Op = PlayerSanction.sequelize.Sequelize.Op;
    const date = dateOnly(matchDate);

    return PlayerSanction.findOne({
      where: {
        playerId,
        status: SANCTION_STATUSES.ACTIVE,
        preventsMatchPlay: true,
        type: {
          [Op.in]: [
            SANCTION_TYPES.DATE_SUSPENSION,
            SANCTION_TYPES.SEASON_SUSPENSION,
            SANCTION_TYPES.INDEFINITE_SUSPENSION,
            SANCTION_TYPES.OTHER
          ]
        },
        startsOn: { [Op.lte]: date },
        [Op.and]: [
          {
            [Op.or]: [
              { seasonId: null },
              { seasonId }
            ]
          },
          {
            [Op.or]: [
              { endsOn: null },
              { endsOn: { [Op.gte]: date } }
            ]
          }
        ]
      },
      order: [["startsOn", "DESC"]],
      transaction
    });
  }
};
