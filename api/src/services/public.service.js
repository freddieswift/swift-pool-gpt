import { publicRepository } from "../repositories/public.repository.js";
import { standingsService } from "./standings.service.js";
import { ApiError } from "../utils/ApiError.js";

function teamSummary(seasonTeam, includeAddress) {
  return {
    seasonTeamId: seasonTeam.id,
    status: seasonTeam.status,
    seed: seasonTeam.seed,
    division: seasonTeam.division
      ? {
          id: seasonTeam.division.id,
          name: seasonTeam.division.name,
          position: seasonTeam.division.position
        }
      : null,
    team: {
      id: seasonTeam.team.id,
      name: seasonTeam.team.name,
      shortName: seasonTeam.team.shortName,
      slug: seasonTeam.team.slug,
      venueName: seasonTeam.team.venueName,
      ...(includeAddress
        ? { venueAddress: seasonTeam.team.venueAddress }
        : {})
    }
  };
}

function matchSummary(match) {
  return {
    id: match.id,
    roundNumber: match.roundNumber,
    legNumber: match.legNumber,
    scheduledAt: match.scheduledAt,
    venueName: match.venueName,
    status: match.status,
    postponedReason: match.postponedReason,
    completedAt: match.completedAt,
    division: match.division
      ? {
          id: match.division.id,
          name: match.division.name,
          position: match.division.position
        }
      : null,
    homeTeam: {
      seasonTeamId: match.homeSeasonTeamId,
      id: match.homeSeasonTeam?.team?.id,
      name: match.homeSeasonTeam?.team?.name,
      shortName: match.homeSeasonTeam?.team?.shortName,
      slug: match.homeSeasonTeam?.team?.slug
    },
    awayTeam: {
      seasonTeamId: match.awaySeasonTeamId,
      id: match.awaySeasonTeam?.team?.id,
      name: match.awaySeasonTeam?.team?.name,
      shortName: match.awaySeasonTeam?.team?.shortName,
      slug: match.awaySeasonTeam?.team?.slug
    },
    result:
      match.status === "COMPLETED"
        ? {
            homeFramesWon: Number(match.homeFramesWon || 0),
            awayFramesWon: Number(match.awayFramesWon || 0),
            homeMatchPoints: Number(match.homeMatchPoints || 0),
            awayMatchPoints: Number(match.awayMatchPoints || 0)
          }
        : null
  };
}

export const publicService = {
  async leagueOverview(league) {
    const seasons = await publicRepository.listSeasons(league.id);

    return {
      league: {
        id: league.id,
        name: league.name,
        slug: league.slug,
        description: league.description
      },
      seasons,
      generatedAt: new Date().toISOString()
    };
  },

  async seasonOverview(league, season, settings) {
    const [divisions, teams, upcoming, recent] = await Promise.all([
      publicRepository.listDivisions(season.id),
      publicRepository.listTeams(season.id),
      publicRepository.listMatches(season.id, {
        status: "SCHEDULED",
        order: "asc",
        limit: 10
      }),
      publicRepository.listMatches(season.id, {
        status: "COMPLETED",
        order: "desc",
        limit: 10
      })
    ]);

    return {
      league: {
        id: league.id,
        name: league.name,
        slug: league.slug
      },
      season,
      divisions,
      teams: teams.map((team) =>
        teamSummary(team, settings.publicVenueAddresses)
      ),
      upcomingFixtures: upcoming.map(matchSummary),
      recentResults: recent.map(matchSummary),
      generatedAt: new Date().toISOString()
    };
  },

  async teams(season, settings) {
    const teams = await publicRepository.listTeams(season.id);
    return {
      seasonId: season.id,
      teams: teams.map((team) =>
        teamSummary(team, settings.publicVenueAddresses)
      )
    };
  },

  async matches(season, query) {
    const matches = await publicRepository.listMatches(season.id, query);
    return {
      seasonId: season.id,
      count: matches.length,
      matches: matches.map(matchSummary)
    };
  },

  async match(season, matchId, settings) {
    const match = await publicRepository.findMatch(season.id, matchId);
    if (!match) throw new ApiError(404, "Public match not found");

    const response = {
      ...matchSummary(match)
    };

    if (
      match.status === "COMPLETED" &&
      settings.publicRosterNames
    ) {
      response.frames = (match.frames || []).map((frame) => ({
        frameNumber: frame.frameNumber,
        resultType: frame.resultType,
        winnerSide: frame.winnerSide,
        homeFramePoints: Number(frame.homeFramePoints || 0),
        awayFramePoints: Number(frame.awayFramePoints || 0),
        homePlayer: frame.homePlayer
          ? {
              id: frame.homePlayer.id,
              displayName: frame.homePlayer.displayName
            }
          : null,
        awayPlayer: frame.awayPlayer
          ? {
              id: frame.awayPlayer.id,
              displayName: frame.awayPlayer.displayName
            }
          : null,
        winnerPlayer: frame.winnerPlayer
          ? {
              id: frame.winnerPlayer.id,
              displayName: frame.winnerPlayer.displayName
            }
          : null
      }));
    }

    return response;
  },

  async standings(season) {
    return standingsService.seasonTables(season, {
      formSize: 5,
      includeWithdrawn: true
    });
  },

  async playerStatistics(season, settings, query) {
    if (!settings.publicPlayerStatistics) {
      throw new ApiError(404, "Public player statistics are disabled");
    }

    const data = await standingsService.playerStatistics(season, query);

    return {
      seasonId: data.seasonId,
      minimumFrames: data.minimumFrames,
      generatedAt: data.generatedAt,
      players: data.players.map((player) => ({
        playerId: player.playerId,
        displayName: player.displayName,
        framesPlayed: player.framesPlayed,
        framesWon: player.framesWon,
        framesLost: player.framesLost,
        framesVoid: player.framesVoid,
        homeFrames: player.homeFrames,
        awayFrames: player.awayFrames,
        winPercentage: player.winPercentage
      }))
    };
  },

  async roster(season, settings) {
    if (!settings.publicRosterNames) {
      throw new ApiError(404, "Public rosters are disabled");
    }

    const teams = await publicRepository.listRoster(season.id);
    return {
      seasonId: season.id,
      teams: teams.map((seasonTeam) => ({
        seasonTeamId: seasonTeam.id,
        team: {
          id: seasonTeam.team.id,
          name: seasonTeam.team.name,
          shortName: seasonTeam.team.shortName,
          slug: seasonTeam.team.slug
        },
        players: (seasonTeam.rosterEntries || []).map((entry) => ({
          playerId: entry.player.id,
          displayName: entry.player.displayName,
          isCaptain: entry.isCaptain
        }))
      }))
    };
  }
};
