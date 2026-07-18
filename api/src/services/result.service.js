import {
  Match,
  MatchFrame,
  MatchFormat,
  MatchResultAudit,
  Player,
  Season,
  SeasonRuleSnapshot,
  SeasonTeamPlayer,
  MATCH_STATUSES,
  ROSTER_STATUSES,
  SCORING_METHODS,
  sequelize
} from "../models/index.js";
import { resultRepository } from "../repositories/result.repository.js";
import { playerEligibilityService } from "./playerEligibility.service.js";
import { ApiError } from "../utils/ApiError.js";

function dateOnly(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function snapshotAggregate(match) {
  return {
    status: match.status,
    homeFramesWon: match.homeFramesWon,
    awayFramesWon: match.awayFramesWon,
    homeMatchPoints: match.homeMatchPoints,
    awayMatchPoints: match.awayMatchPoints,
    completedAt: match.completedAt,
    frames: (match.frames || []).map((frame) => frame.toJSON())
  };
}

async function loadScoringRules(match, transaction) {
  const season = await Season.findByPk(match.seasonId, { transaction });
  if (!season) throw new ApiError(404, "Season not found");

  const snapshot = await SeasonRuleSnapshot.findOne({
    where: { seasonId: season.id },
    transaction
  });

  const format = await MatchFormat.findByPk(season.matchFormatId, { transaction });
  if (!format) throw new ApiError(422, "Season match format is missing");

  const rules = snapshot?.rulesJson || {};
  return {
    season,
    format,
    frameWinPoints: Number(rules.frameWinPoints ?? 1),
    frameLossPoints: Number(rules.frameLossPoints ?? 0),
    matchWinPoints: Number(rules.matchWinPoints ?? 2),
    matchDrawPoints: Number(rules.matchDrawPoints ?? 1),
    matchLossPoints: Number(rules.matchLossPoints ?? 0)
  };
}

async function activeRosterPlayer(seasonTeamId, playerId, matchDate, transaction) {
  if (!playerId) return null;

  const entry = await SeasonTeamPlayer.findOne({
    where: {
      seasonTeamId,
      playerId,
      status: [ROSTER_STATUSES.ACTIVE, ROSTER_STATUSES.RELEASED]
    },
    include: [
      { model: Player, as: "player" },
      { model: SeasonTeam, as: "seasonTeam" }
    ],
    transaction
  });

  if (!entry) return null;

  const date = dateOnly(matchDate);
  if (entry.eligibleFrom && date < entry.eligibleFrom) return null;
  if (entry.eligibleUntil && date > entry.eligibleUntil) return null;
  if (entry.joinedAt && date < entry.joinedAt) return null;
  if (entry.leftAt && date > entry.leftAt) return null;

  const sanction = await playerEligibilityService.blockingSanction(
    playerId,
    entry.seasonTeam.seasonId,
    matchDate,
    transaction
  );
  if (sanction) return null;

  return entry;
}

async function validateFrames(match, frames, transaction) {
  for (const frame of frames) {
    if (frame.homePlayerId) {
      const homeEntry = await activeRosterPlayer(
        match.homeSeasonTeamId,
        frame.homePlayerId,
        match.scheduledAt,
        transaction
      );
      if (!homeEntry) {
        throw new ApiError(
          422,
          `Home player in frame ${frame.frameNumber} was not eligible for this match`
        );
      }
    }

    if (frame.awayPlayerId) {
      const awayEntry = await activeRosterPlayer(
        match.awaySeasonTeamId,
        frame.awayPlayerId,
        match.scheduledAt,
        transaction
      );
      if (!awayEntry) {
        throw new ApiError(
          422,
          `Away player in frame ${frame.frameNumber} was not eligible for this match`
        );
      }
    }
  }
}

function scoreFrames(frames, rules) {
  let homeFramesWon = 0;
  let awayFramesWon = 0;
  let homeFramePoints = 0;
  let awayFramePoints = 0;

  const scoredFrames = frames.map((frame) => {
    let homePoints = 0;
    let awayPoints = 0;

    if (frame.winnerSide === "HOME") {
      homeFramesWon += 1;
      homePoints = rules.frameWinPoints;
      awayPoints = rules.frameLossPoints;
    } else if (frame.winnerSide === "AWAY") {
      awayFramesWon += 1;
      awayPoints = rules.frameWinPoints;
      homePoints = rules.frameLossPoints;
    }

    homeFramePoints += homePoints;
    awayFramePoints += awayPoints;

    return {
      ...frame,
      winnerPlayerId:
        frame.winnerPlayerId ||
        (frame.winnerSide === "HOME"
          ? frame.homePlayerId
          : frame.winnerSide === "AWAY"
            ? frame.awayPlayerId
            : null),
      homeFramePoints: homePoints,
      awayFramePoints: awayPoints,
      notes: frame.notes || null
    };
  });

  let homeMatchPoints = 0;
  let awayMatchPoints = 0;

  if (homeFramesWon > awayFramesWon) {
    homeMatchPoints = rules.matchWinPoints;
    awayMatchPoints = rules.matchLossPoints;
  } else if (awayFramesWon > homeFramesWon) {
    awayMatchPoints = rules.matchWinPoints;
    homeMatchPoints = rules.matchLossPoints;
  } else {
    homeMatchPoints = rules.matchDrawPoints;
    awayMatchPoints = rules.matchDrawPoints;
  }

  if (rules.format.scoringMethod === SCORING_METHODS.FRAME_POINTS) {
    homeMatchPoints += homeFramePoints;
    awayMatchPoints += awayFramePoints;
  }

  return {
    scoredFrames,
    homeFramesWon,
    awayFramesWon,
    homeMatchPoints,
    awayMatchPoints
  };
}

export const resultService = {
  async get(matchId) {
    const match = await resultRepository.findMatchAggregate(matchId);
    if (!match) throw new ApiError(404, "Match not found");
    return match;
  },

  async submit(matchId, userId, payload) {
    return sequelize.transaction(async (transaction) => {
      const match = await Match.findByPk(matchId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!match) throw new ApiError(404, "Match not found");

      if ([MATCH_STATUSES.CANCELLED, MATCH_STATUSES.POSTPONED].includes(match.status)) {
        throw new ApiError(409, "Cancelled or postponed matches cannot accept results");
      }

      const previous = await resultRepository.findMatchAggregate(match.id, {
        transaction
      });
      const isCorrection = match.status === MATCH_STATUSES.COMPLETED;

      if (isCorrection && !payload.correctionReason) {
        throw new ApiError(
          422,
          "correctionReason is required when changing a completed result"
        );
      }

      const rules = await loadScoringRules(match, transaction);

      if (
        rules.format.totalFrames &&
        payload.frames.length !== rules.format.totalFrames
      ) {
        throw new ApiError(
          422,
          `This match format requires exactly ${rules.format.totalFrames} frames`
        );
      }

      await validateFrames(match, payload.frames, transaction);
      const score = scoreFrames(payload.frames, rules);

      await resultRepository.replaceFrames(
        match.id,
        score.scoredFrames.map((frame) => ({
          matchId: match.id,
          frameNumber: frame.frameNumber,
          homePlayerId: frame.homePlayerId || null,
          awayPlayerId: frame.awayPlayerId || null,
          winnerPlayerId: frame.winnerPlayerId || null,
          winnerSide: frame.winnerSide,
          resultType: frame.resultType,
          homeFramePoints: frame.homeFramePoints,
          awayFramePoints: frame.awayFramePoints,
          notes: frame.notes
        })),
        transaction
      );

      await match.update(
        {
          status: MATCH_STATUSES.COMPLETED,
          homeFramesWon: score.homeFramesWon,
          awayFramesWon: score.awayFramesWon,
          homeMatchPoints: score.homeMatchPoints,
          awayMatchPoints: score.awayMatchPoints,
          resultNotes: payload.notes || null,
          resultSubmittedByUserId: userId,
          resultSubmittedAt: new Date(),
          completedAt: new Date()
        },
        { transaction }
      );

      const updated = await resultRepository.findMatchAggregate(match.id, {
        transaction
      });

      await resultRepository.createAudit(
        {
          matchId: match.id,
          action: isCorrection ? "CORRECTED" : "SUBMITTED",
          submittedByUserId: userId,
          previousResult: isCorrection ? snapshotAggregate(previous) : null,
          newResult: snapshotAggregate(updated),
          reason: payload.correctionReason || null
        },
        transaction
      );

      return updated;
    });
  },

  async reopen(matchId, userId, reason) {
    return sequelize.transaction(async (transaction) => {
      const match = await Match.findByPk(matchId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if (!match) throw new ApiError(404, "Match not found");
      if (match.status !== MATCH_STATUSES.COMPLETED) {
        throw new ApiError(409, "Only completed matches can be reopened");
      }

      const previous = await resultRepository.findMatchAggregate(match.id, {
        transaction
      });

      await match.update(
        {
          status: MATCH_STATUSES.IN_PROGRESS,
          completedAt: null
        },
        { transaction }
      );

      await resultRepository.createAudit(
        {
          matchId: match.id,
          action: "REOPENED",
          submittedByUserId: userId,
          previousResult: snapshotAggregate(previous),
          newResult: {
            status: MATCH_STATUSES.IN_PROGRESS
          },
          reason
        },
        transaction
      );

      return resultRepository.findMatchAggregate(match.id, { transaction });
    });
  },

  audits(matchId) {
    return resultRepository.listAudits(matchId);
  }
};
