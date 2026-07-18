import { reportRepository } from "../repositories/report.repository.js";
import { standingsService } from "./standings.service.js";
import { toCsv } from "../utils/csv.js";

function countMap(rows) {
  return Object.fromEntries(
    rows.map((row) => [row.status, Number(row.count || 0)])
  );
}

function matchRow(match) {
  return {
    id: match.id,
    season: match.season?.name || null,
    division: match.division?.name || null,
    round: match.roundNumber,
    leg: match.legNumber,
    scheduledAt: match.scheduledAt,
    status: match.status,
    homeTeam: match.homeSeasonTeam?.team?.name || null,
    awayTeam: match.awaySeasonTeam?.team?.name || null,
    homeFrames: Number(match.homeFramesWon || 0),
    awayFrames: Number(match.awayFramesWon || 0),
    homePoints: Number(match.homeMatchPoints || 0),
    awayPoints: Number(match.awayMatchPoints || 0),
    venue: match.venueName || null
  };
}

export const reportService = {
  async leagueDashboard(league) {
    const [seasons, teamCount, playerCount] = await Promise.all([
      reportRepository.listLeagueSeasons(league.id),
      reportRepository.countLeagueTeams(league.id),
      reportRepository.countLeaguePlayers(league.id)
    ]);

    const activeSeasons = seasons.filter((season) =>
      ["REGISTRATION", "ACTIVE"].includes(season.status)
    );

    return {
      league: {
        id: league.id,
        name: league.name,
        slug: league.slug
      },
      totals: {
        seasons: seasons.length,
        activeSeasons: activeSeasons.length,
        activeTeams: teamCount,
        activePlayers: playerCount
      },
      seasons: seasons.slice(0, 10).map((season) => ({
        id: season.id,
        name: season.name,
        status: season.status,
        startDate: season.startDate,
        endDate: season.endDate
      })),
      generatedAt: new Date().toISOString()
    };
  },

  async seasonDashboard(season, options) {
    const now = new Date();
    const [
      divisions,
      teams,
      upcoming,
      recent,
      statusRows,
      playerHandicapCount,
      teamHandicapCount
    ] = await Promise.all([
      reportRepository.listSeasonDivisions(season.id),
      reportRepository.listSeasonTeams(season.id),
      reportRepository.listUpcomingMatches(
        season.id,
        now,
        options.upcomingLimit
      ),
      reportRepository.listRecentResults(season.id, options.recentLimit),
      reportRepository.countSeasonMatchesByStatus(season.id),
      reportRepository.countSeasonPlayerHandicaps(season.id),
      reportRepository.countSeasonTeamHandicaps(season.id)
    ]);

    const statuses = countMap(statusRows);
    const totalMatches = Object.values(statuses).reduce(
      (sum, count) => sum + count,
      0
    );
    const completed = statuses.COMPLETED || 0;

    return {
      season: {
        id: season.id,
        name: season.name,
        status: season.status,
        startDate: season.startDate,
        endDate: season.endDate
      },
      totals: {
        divisions: divisions.length,
        registeredTeams: teams.length,
        matches: totalMatches,
        completedMatches: completed,
        completionPercentage:
          totalMatches === 0
            ? 0
            : Number(((completed / totalMatches) * 100).toFixed(2)),
        playerHandicapRecords: playerHandicapCount,
        teamHandicapRecords: teamHandicapCount
      },
      matchesByStatus: statuses,
      upcomingFixtures: upcoming.map(matchRow),
      recentResults: recent.map(matchRow),
      generatedAt: new Date().toISOString()
    };
  },

  async fixturesReport(season, query) {
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.divisionId ? { divisionId: query.divisionId } : {})
    };
    const matches = await reportRepository.listSeasonMatches(season.id, where);
    const rows = matches.map(matchRow);

    if (query.format === "csv") {
      return {
        contentType: "text/csv; charset=utf-8",
        filename: `${season.slug || season.id}-fixtures.csv`,
        body: toCsv(
          [
            { key: "division", label: "Division" },
            { key: "round", label: "Round" },
            { key: "leg", label: "Leg" },
            { key: "scheduledAt", label: "Scheduled At" },
            { key: "status", label: "Status" },
            { key: "homeTeam", label: "Home Team" },
            { key: "awayTeam", label: "Away Team" },
            { key: "venue", label: "Venue" }
          ],
          rows
        )
      };
    }

    return {
      seasonId: season.id,
      count: rows.length,
      fixtures: rows,
      generatedAt: new Date().toISOString()
    };
  },

  async resultsReport(season, query) {
    const where = {
      status: query.status || "COMPLETED",
      ...(query.divisionId ? { divisionId: query.divisionId } : {})
    };
    const matches = await reportRepository.listSeasonMatches(season.id, where);
    const rows = matches.map(matchRow);

    if (query.format === "csv") {
      return {
        contentType: "text/csv; charset=utf-8",
        filename: `${season.slug || season.id}-results.csv`,
        body: toCsv(
          [
            { key: "division", label: "Division" },
            { key: "round", label: "Round" },
            { key: "scheduledAt", label: "Scheduled At" },
            { key: "homeTeam", label: "Home Team" },
            { key: "awayTeam", label: "Away Team" },
            { key: "homeFrames", label: "Home Frames" },
            { key: "awayFrames", label: "Away Frames" },
            { key: "homePoints", label: "Home Points" },
            { key: "awayPoints", label: "Away Points" }
          ],
          rows
        )
      };
    }

    return {
      seasonId: season.id,
      count: rows.length,
      results: rows,
      generatedAt: new Date().toISOString()
    };
  },

  async standingsReport(season, query) {
    const data = await standingsService.seasonTables(season, {
      formSize: 5,
      includeWithdrawn: true
    });

    const rows = data.divisions.flatMap(({ division, standings }) =>
      standings.map((row) => ({
        division: division.name,
        position: row.position,
        team: row.teamName,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        framesFor: row.framesFor,
        framesAgainst: row.framesAgainst,
        frameDifference: row.frameDifference,
        pointsAdjustment: row.pointsAdjustment,
        totalPoints: row.totalPoints
      }))
    );

    if (query.format === "csv") {
      return {
        contentType: "text/csv; charset=utf-8",
        filename: `${season.slug || season.id}-standings.csv`,
        body: toCsv(
          [
            { key: "division", label: "Division" },
            { key: "position", label: "Position" },
            { key: "team", label: "Team" },
            { key: "played", label: "Played" },
            { key: "won", label: "Won" },
            { key: "drawn", label: "Drawn" },
            { key: "lost", label: "Lost" },
            { key: "framesFor", label: "Frames For" },
            { key: "framesAgainst", label: "Frames Against" },
            { key: "frameDifference", label: "Frame Difference" },
            { key: "pointsAdjustment", label: "Adjustment" },
            { key: "totalPoints", label: "Points" }
          ],
          rows
        )
      };
    }

    return data;
  },

  async activityReport(league, limit = 50) {
    const [results, handicaps] = await Promise.all([
      reportRepository.listResultAuditsForLeague(league.id, limit),
      reportRepository.listHandicapAuditsForLeague(league.id, limit)
    ]);

    const activity = [
      ...results.map((audit) => ({
        type: "MATCH_RESULT",
        action: audit.action,
        entityId: audit.matchId,
        actorUserId: audit.submittedByUserId,
        reason: audit.reason,
        createdAt: audit.createdAt
      })),
      ...handicaps.map((audit) => ({
        type: "HANDICAP",
        action: audit.action,
        entityId: audit.entityId,
        actorUserId: audit.actedByUserId,
        reason: audit.reason,
        createdAt: audit.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    return {
      leagueId: league.id,
      activity,
      generatedAt: new Date().toISOString()
    };
  }
};
