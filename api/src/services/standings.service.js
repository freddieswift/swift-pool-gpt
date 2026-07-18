import { standingsRepository } from "../repositories/standings.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { SEASON_TEAM_STATUSES } from "../models/index.js";

function numeric(value) {
  return Number(value || 0);
}

function emptyRow(seasonTeam) {
  return {
    seasonTeamId: seasonTeam.id,
    teamId: seasonTeam.teamId,
    teamName: seasonTeam.team?.name || "Unknown team",
    shortName: seasonTeam.team?.shortName || null,
    divisionId: seasonTeam.divisionId,
    divisionName: seasonTeam.division?.name || null,
    status: seasonTeam.status,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    framesFor: 0,
    framesAgainst: 0,
    frameDifference: 0,
    matchPoints: 0,
    pointsAdjustment: numeric(seasonTeam.pointsAdjustment),
    totalPoints: numeric(seasonTeam.pointsAdjustment),
    form: []
  };
}

function applyMatch(rows, match, formSize) {
  const home = rows.get(match.homeSeasonTeamId);
  const away = rows.get(match.awaySeasonTeamId);
  if (!home || !away) return;

  const homeFrames = numeric(match.homeFramesWon);
  const awayFrames = numeric(match.awayFramesWon);
  const homePoints = numeric(match.homeMatchPoints);
  const awayPoints = numeric(match.awayMatchPoints);

  home.played += 1;
  away.played += 1;

  home.framesFor += homeFrames;
  home.framesAgainst += awayFrames;
  away.framesFor += awayFrames;
  away.framesAgainst += homeFrames;

  home.matchPoints += homePoints;
  away.matchPoints += awayPoints;

  if (homeFrames > awayFrames) {
    home.won += 1;
    away.lost += 1;
    home.form.push("W");
    away.form.push("L");
  } else if (awayFrames > homeFrames) {
    away.won += 1;
    home.lost += 1;
    away.form.push("W");
    home.form.push("L");
  } else {
    home.drawn += 1;
    away.drawn += 1;
    home.form.push("D");
    away.form.push("D");
  }

  home.form = home.form.slice(-formSize);
  away.form = away.form.slice(-formSize);
}

function rankRows(rows) {
  const sorted = [...rows].map((row) => ({
    ...row,
    frameDifference: row.framesFor - row.framesAgainst,
    totalPoints: row.matchPoints + row.pointsAdjustment
  }));

  sorted.sort((a, b) =>
    b.totalPoints - a.totalPoints ||
    b.frameDifference - a.frameDifference ||
    b.framesFor - a.framesFor ||
    b.won - a.won ||
    a.teamName.localeCompare(b.teamName)
  );

  let previous = null;
  let rank = 0;

  return sorted.map((row, index) => {
    const tied =
      previous &&
      row.totalPoints === previous.totalPoints &&
      row.frameDifference === previous.frameDifference &&
      row.framesFor === previous.framesFor &&
      row.won === previous.won;

    if (!tied) rank = index + 1;
    previous = row;

    return {
      position: rank,
      ...row
    };
  });
}

function buildTable(teams, matches, { formSize, includeWithdrawn }) {
  const rows = new Map();

  for (const team of teams) {
    if (
      !includeWithdrawn &&
      team.status === SEASON_TEAM_STATUSES.WITHDRAWN
    ) {
      continue;
    }
    rows.set(team.id, emptyRow(team));
  }

  for (const match of matches) {
    applyMatch(rows, match, formSize);
  }

  return rankRows([...rows.values()]);
}

function buildTeamStats(teams, matches) {
  const byTeam = new Map(teams.map((team) => [team.id, emptyRow(team)]));

  for (const match of matches) {
    applyMatch(byTeam, match, 5);
  }

  return [...byTeam.values()]
    .map((row) => ({
      ...row,
      frameDifference: row.framesFor - row.framesAgainst,
      totalPoints: row.matchPoints + row.pointsAdjustment,
      winPercentage:
        row.played === 0
          ? 0
          : Number(((row.won / row.played) * 100).toFixed(2)),
      framesWonPercentage:
        row.framesFor + row.framesAgainst === 0
          ? 0
          : Number(
              (
                (row.framesFor / (row.framesFor + row.framesAgainst)) *
                100
              ).toFixed(2)
            )
    }))
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        b.frameDifference - a.frameDifference ||
        a.teamName.localeCompare(b.teamName)
    );
}

function buildPlayerStats(frames, minimumFrames) {
  const stats = new Map();

  const get = (player) => {
    if (!player) return null;
    if (!stats.has(player.id)) {
      stats.set(player.id, {
        playerId: player.id,
        displayName: player.displayName,
        firstName: player.firstName,
        lastName: player.lastName,
        framesPlayed: 0,
        framesWon: 0,
        framesLost: 0,
        framesVoid: 0,
        homeFrames: 0,
        awayFrames: 0
      });
    }
    return stats.get(player.id);
  };

  for (const frame of frames) {
    const home = get(frame.homePlayer);
    const away = get(frame.awayPlayer);

    if (home) {
      home.framesPlayed += 1;
      home.homeFrames += 1;
    }
    if (away) {
      away.framesPlayed += 1;
      away.awayFrames += 1;
    }

    if (frame.winnerSide === "HOME") {
      if (home) home.framesWon += 1;
      if (away) away.framesLost += 1;
    } else if (frame.winnerSide === "AWAY") {
      if (away) away.framesWon += 1;
      if (home) home.framesLost += 1;
    } else {
      if (home) home.framesVoid += 1;
      if (away) away.framesVoid += 1;
    }
  }

  return [...stats.values()]
    .filter((row) => row.framesPlayed >= minimumFrames)
    .map((row) => ({
      ...row,
      winPercentage:
        row.framesPlayed === 0
          ? 0
          : Number(((row.framesWon / row.framesPlayed) * 100).toFixed(2))
    }))
    .sort(
      (a, b) =>
        b.winPercentage - a.winPercentage ||
        b.framesWon - a.framesWon ||
        a.framesPlayed - b.framesPlayed ||
        a.displayName.localeCompare(b.displayName)
    );
}

export const standingsService = {
  async divisionTable(season, division, options) {
    if (division.seasonId !== season.id) {
      throw new ApiError(422, "Division does not belong to this season");
    }

    const [teams, matches] = await Promise.all([
      standingsRepository.listDivisionTeams(season.id, division.id),
      standingsRepository.listCompletedMatches(season.id, division.id)
    ]);

    return {
      season: {
        id: season.id,
        name: season.name,
        status: season.status
      },
      division: {
        id: division.id,
        name: division.name,
        position: division.position
      },
      tieBreakers: [
        "TOTAL_POINTS",
        "FRAME_DIFFERENCE",
        "FRAMES_WON",
        "MATCHES_WON",
        "TEAM_NAME"
      ],
      generatedAt: new Date().toISOString(),
      standings: buildTable(teams, matches, options)
    };
  },

  async seasonTables(season, options) {
    const divisions = await standingsRepository.listSeasonDivisions(season.id);

    const tables = [];
    for (const division of divisions) {
      tables.push(await this.divisionTable(season, division, options));
    }

    return {
      season: {
        id: season.id,
        name: season.name,
        status: season.status
      },
      generatedAt: new Date().toISOString(),
      divisions: tables.map((table) => ({
        division: table.division,
        standings: table.standings
      }))
    };
  },

  async teamStatistics(season, limit) {
    const [teams, matches] = await Promise.all([
      standingsRepository.listSeasonTeams(season.id),
      standingsRepository.listSeasonCompletedMatches(season.id)
    ]);

    return {
      seasonId: season.id,
      generatedAt: new Date().toISOString(),
      teams: buildTeamStats(teams, matches).slice(0, limit)
    };
  },

  async playerStatistics(season, { limit, minimumFrames }) {
    const frames = await standingsRepository.listSeasonFrames(season.id);

    return {
      seasonId: season.id,
      generatedAt: new Date().toISOString(),
      minimumFrames,
      players: buildPlayerStats(frames, minimumFrames).slice(0, limit)
    };
  },

  async summary(season) {
    const [teams, matches, frames] = await Promise.all([
      standingsRepository.listSeasonTeams(season.id),
      standingsRepository.listSeasonCompletedMatches(season.id),
      standingsRepository.listSeasonFrames(season.id)
    ]);

    const scheduled = await season.countMatches();
    const completed = matches.length;
    const totalFrames = frames.length;
    const decisiveFrames = frames.filter(
      (frame) => frame.winnerSide !== "NONE"
    ).length;

    return {
      season: {
        id: season.id,
        name: season.name,
        status: season.status
      },
      totals: {
        registeredTeams: teams.length,
        scheduledMatches: scheduled,
        completedMatches: completed,
        remainingMatches: Math.max(scheduled - completed, 0),
        completionPercentage:
          scheduled === 0
            ? 0
            : Number(((completed / scheduled) * 100).toFixed(2)),
        framesPlayed: totalFrames,
        decisiveFrames
      },
      generatedAt: new Date().toISOString()
    };
  }
};
