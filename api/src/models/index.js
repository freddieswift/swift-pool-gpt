import { sequelize } from "../config/database.js";
import { initUserModel, User } from "./User.js";
import { initLeagueModel, League } from "./League.js";
import {
  initLeagueAdminModel,
  LeagueAdmin,
  LEAGUE_ADMIN_ROLES
} from "./LeagueAdmin.js";
import {
  initLeagueSettingsModel,
  LeagueSettings,
  HANDICAP_METHODS
} from "./LeagueSettings.js";
import {
  initMatchFormatModel,
  MatchFormat,
  SCORING_METHODS
} from "./MatchFormat.js";
import {
  initSeasonModel,
  Season,
  SEASON_STATUSES
} from "./Season.js";
import {
  initSeasonRuleSnapshotModel,
  SeasonRuleSnapshot
} from "./SeasonRuleSnapshot.js";
import { initDivisionModel, Division } from "./Division.js";
import { initTeamModel, Team } from "./Team.js";
import {
  initSeasonTeamModel,
  SeasonTeam,
  SEASON_TEAM_STATUSES
} from "./SeasonTeam.js";
import { initPlayerModel, Player } from "./Player.js";
import {
  initSeasonTeamPlayerModel,
  SeasonTeamPlayer,
  ROSTER_STATUSES
} from "./SeasonTeamPlayer.js";
import {
  initPlayerTransferModel,
  PlayerTransfer
} from "./PlayerTransfer.js";
import { initMatchModel, Match, MATCH_STATUSES } from "./Match.js";
import {
  initMatchFrameModel,
  MatchFrame,
  FRAME_RESULT_TYPES
} from "./MatchFrame.js";
import {
  initMatchResultAuditModel,
  MatchResultAudit
} from "./MatchResultAudit.js";
import {
  initPlayerHandicapModel,
  PlayerHandicap,
  HANDICAP_SOURCES
} from "./PlayerHandicap.js";
import { initTeamHandicapModel, TeamHandicap } from "./TeamHandicap.js";
import { initHandicapAuditModel, HandicapAudit } from "./HandicapAudit.js";
import {
  initSeasonTransitionPlanModel,
  SeasonTransitionPlan,
  TRANSITION_PLAN_STATUSES
} from "./SeasonTransitionPlan.js";
import {
  initSeasonTransitionEntryModel,
  SeasonTransitionEntry,
  TRANSITION_ACTIONS
} from "./SeasonTransitionEntry.js";
import {
  initSeasonTransitionAuditModel,
  SeasonTransitionAudit
} from "./SeasonTransitionAudit.js";
import {
  initPlayerSanctionModel,
  PlayerSanction,
  SANCTION_TYPES,
  SANCTION_STATUSES
} from "./PlayerSanction.js";
import {
  initSanctionAppealModel,
  SanctionAppeal,
  APPEAL_STATUSES
} from "./SanctionAppeal.js";
import {
  initSanctionAuditModel,
  SanctionAudit
} from "./SanctionAudit.js";


initUserModel(sequelize);
initLeagueModel(sequelize);
initLeagueAdminModel(sequelize);
initLeagueSettingsModel(sequelize);
initMatchFormatModel(sequelize);
initSeasonModel(sequelize);
initSeasonRuleSnapshotModel(sequelize);
initDivisionModel(sequelize);
initTeamModel(sequelize);
initSeasonTeamModel(sequelize);
initPlayerModel(sequelize);
initSeasonTeamPlayerModel(sequelize);
initPlayerTransferModel(sequelize);
initMatchModel(sequelize);
initMatchFrameModel(sequelize);
initMatchResultAuditModel(sequelize);
initPlayerHandicapModel(sequelize);
initTeamHandicapModel(sequelize);
initHandicapAuditModel(sequelize);
initSeasonTransitionPlanModel(sequelize);
initSeasonTransitionEntryModel(sequelize);
initSeasonTransitionAuditModel(sequelize);
initPlayerSanctionModel(sequelize);
initSanctionAppealModel(sequelize);
initSanctionAuditModel(sequelize);

User.hasMany(League, { foreignKey: "createdByUserId", as: "createdLeagues" });
League.belongsTo(User, { foreignKey: "createdByUserId", as: "creator" });

League.belongsToMany(User, {
  through: LeagueAdmin,
  foreignKey: "leagueId",
  otherKey: "userId",
  as: "administrators"
});
User.belongsToMany(League, {
  through: LeagueAdmin,
  foreignKey: "userId",
  otherKey: "leagueId",
  as: "administeredLeagues"
});

League.hasMany(LeagueAdmin, { foreignKey: "leagueId", as: "adminMemberships" });
LeagueAdmin.belongsTo(League, { foreignKey: "leagueId", as: "league" });
User.hasMany(LeagueAdmin, { foreignKey: "userId", as: "leagueAdminMemberships" });
LeagueAdmin.belongsTo(User, { foreignKey: "userId", as: "user" });

League.hasOne(LeagueSettings, { foreignKey: "leagueId", as: "settings" });
LeagueSettings.belongsTo(League, { foreignKey: "leagueId", as: "league" });

League.hasMany(MatchFormat, { foreignKey: "leagueId", as: "matchFormats" });
MatchFormat.belongsTo(League, { foreignKey: "leagueId", as: "league" });

League.hasMany(Season, { foreignKey: "leagueId", as: "seasons" });
Season.belongsTo(League, { foreignKey: "leagueId", as: "league" });

MatchFormat.hasMany(Season, { foreignKey: "matchFormatId", as: "seasons" });
Season.belongsTo(MatchFormat, { foreignKey: "matchFormatId", as: "matchFormat" });

Season.hasOne(SeasonRuleSnapshot, { foreignKey: "seasonId", as: "ruleSnapshot" });
SeasonRuleSnapshot.belongsTo(Season, { foreignKey: "seasonId", as: "season" });

Season.hasMany(Division, { foreignKey: "seasonId", as: "divisions" });
Division.belongsTo(Season, { foreignKey: "seasonId", as: "season" });

League.hasMany(Team, { foreignKey: "leagueId", as: "teams" });
Team.belongsTo(League, { foreignKey: "leagueId", as: "league" });

Season.belongsToMany(Team, {
  through: SeasonTeam,
  foreignKey: "seasonId",
  otherKey: "teamId",
  as: "teams"
});
Team.belongsToMany(Season, {
  through: SeasonTeam,
  foreignKey: "teamId",
  otherKey: "seasonId",
  as: "seasons"
});

Season.hasMany(SeasonTeam, { foreignKey: "seasonId", as: "seasonTeams" });
SeasonTeam.belongsTo(Season, { foreignKey: "seasonId", as: "season" });

Team.hasMany(SeasonTeam, { foreignKey: "teamId", as: "seasonEntries" });
SeasonTeam.belongsTo(Team, { foreignKey: "teamId", as: "team" });

Division.hasMany(SeasonTeam, { foreignKey: "divisionId", as: "seasonTeams" });
SeasonTeam.belongsTo(Division, { foreignKey: "divisionId", as: "division" });

League.hasMany(Player, { foreignKey: "leagueId", as: "players" });
Player.belongsTo(League, { foreignKey: "leagueId", as: "league" });

User.hasOne(Player, { foreignKey: "userId", as: "playerProfile" });
Player.belongsTo(User, { foreignKey: "userId", as: "user" });

SeasonTeam.belongsToMany(Player, {
  through: SeasonTeamPlayer,
  foreignKey: "seasonTeamId",
  otherKey: "playerId",
  as: "players"
});
Player.belongsToMany(SeasonTeam, {
  through: SeasonTeamPlayer,
  foreignKey: "playerId",
  otherKey: "seasonTeamId",
  as: "seasonTeams"
});

SeasonTeam.hasMany(SeasonTeamPlayer, {
  foreignKey: "seasonTeamId",
  as: "rosterEntries"
});
SeasonTeamPlayer.belongsTo(SeasonTeam, {
  foreignKey: "seasonTeamId",
  as: "seasonTeam"
});

Player.hasMany(SeasonTeamPlayer, {
  foreignKey: "playerId",
  as: "rosterEntries"
});
SeasonTeamPlayer.belongsTo(Player, {
  foreignKey: "playerId",
  as: "player"
});

Season.hasMany(PlayerTransfer, { foreignKey: "seasonId", as: "playerTransfers" });
PlayerTransfer.belongsTo(Season, { foreignKey: "seasonId", as: "season" });

Player.hasMany(PlayerTransfer, { foreignKey: "playerId", as: "transfers" });
PlayerTransfer.belongsTo(Player, { foreignKey: "playerId", as: "player" });

SeasonTeam.hasMany(PlayerTransfer, {
  foreignKey: "fromSeasonTeamId",
  as: "outgoingTransfers"
});
PlayerTransfer.belongsTo(SeasonTeam, {
  foreignKey: "fromSeasonTeamId",
  as: "fromSeasonTeam"
});

SeasonTeam.hasMany(PlayerTransfer, {
  foreignKey: "toSeasonTeamId",
  as: "incomingTransfers"
});
PlayerTransfer.belongsTo(SeasonTeam, {
  foreignKey: "toSeasonTeamId",
  as: "toSeasonTeam"
});

User.hasMany(PlayerTransfer, {
  foreignKey: "createdByUserId",
  as: "createdPlayerTransfers"
});
PlayerTransfer.belongsTo(User, {
  foreignKey: "createdByUserId",
  as: "createdBy"
});


Season.hasMany(Match, { foreignKey: "seasonId", as: "matches" });
Match.belongsTo(Season, { foreignKey: "seasonId", as: "season" });

Division.hasMany(Match, { foreignKey: "divisionId", as: "matches" });
Match.belongsTo(Division, { foreignKey: "divisionId", as: "division" });

SeasonTeam.hasMany(Match, {
  foreignKey: "homeSeasonTeamId",
  as: "homeMatches"
});
Match.belongsTo(SeasonTeam, {
  foreignKey: "homeSeasonTeamId",
  as: "homeSeasonTeam"
});

SeasonTeam.hasMany(Match, {
  foreignKey: "awaySeasonTeamId",
  as: "awayMatches"
});
Match.belongsTo(SeasonTeam, {
  foreignKey: "awaySeasonTeamId",
  as: "awaySeasonTeam"
});


Match.hasMany(MatchFrame, {
  foreignKey: "matchId",
  as: "frames"
});
MatchFrame.belongsTo(Match, {
  foreignKey: "matchId",
  as: "match"
});

Player.hasMany(MatchFrame, {
  foreignKey: "homePlayerId",
  as: "homeFrames"
});
MatchFrame.belongsTo(Player, {
  foreignKey: "homePlayerId",
  as: "homePlayer"
});

Player.hasMany(MatchFrame, {
  foreignKey: "awayPlayerId",
  as: "awayFrames"
});
MatchFrame.belongsTo(Player, {
  foreignKey: "awayPlayerId",
  as: "awayPlayer"
});

Player.hasMany(MatchFrame, {
  foreignKey: "winnerPlayerId",
  as: "wonFrames"
});
MatchFrame.belongsTo(Player, {
  foreignKey: "winnerPlayerId",
  as: "winnerPlayer"
});

Match.hasMany(MatchResultAudit, {
  foreignKey: "matchId",
  as: "resultAudits"
});
MatchResultAudit.belongsTo(Match, {
  foreignKey: "matchId",
  as: "match"
});

User.hasMany(MatchResultAudit, {
  foreignKey: "submittedByUserId",
  as: "submittedMatchResultAudits"
});
MatchResultAudit.belongsTo(User, {
  foreignKey: "submittedByUserId",
  as: "submittedBy"
});

User.hasMany(Match, {
  foreignKey: "resultSubmittedByUserId",
  as: "submittedMatchResults"
});
Match.belongsTo(User, {
  foreignKey: "resultSubmittedByUserId",
  as: "resultSubmittedBy"
});


League.hasMany(PlayerHandicap, {
  foreignKey: "leagueId",
  as: "playerHandicaps"
});
PlayerHandicap.belongsTo(League, {
  foreignKey: "leagueId",
  as: "league"
});

Season.hasMany(PlayerHandicap, {
  foreignKey: "seasonId",
  as: "playerHandicaps"
});
PlayerHandicap.belongsTo(Season, {
  foreignKey: "seasonId",
  as: "season"
});

Player.hasMany(PlayerHandicap, {
  foreignKey: "playerId",
  as: "handicaps"
});
PlayerHandicap.belongsTo(Player, {
  foreignKey: "playerId",
  as: "player"
});

User.hasMany(PlayerHandicap, {
  foreignKey: "createdByUserId",
  as: "createdPlayerHandicaps"
});
PlayerHandicap.belongsTo(User, {
  foreignKey: "createdByUserId",
  as: "createdBy"
});

League.hasMany(TeamHandicap, {
  foreignKey: "leagueId",
  as: "teamHandicaps"
});
TeamHandicap.belongsTo(League, {
  foreignKey: "leagueId",
  as: "league"
});

Season.hasMany(TeamHandicap, {
  foreignKey: "seasonId",
  as: "teamHandicaps"
});
TeamHandicap.belongsTo(Season, {
  foreignKey: "seasonId",
  as: "season"
});

SeasonTeam.hasMany(TeamHandicap, {
  foreignKey: "seasonTeamId",
  as: "handicaps"
});
TeamHandicap.belongsTo(SeasonTeam, {
  foreignKey: "seasonTeamId",
  as: "seasonTeam"
});

User.hasMany(TeamHandicap, {
  foreignKey: "createdByUserId",
  as: "createdTeamHandicaps"
});
TeamHandicap.belongsTo(User, {
  foreignKey: "createdByUserId",
  as: "createdBy"
});

League.hasMany(HandicapAudit, {
  foreignKey: "leagueId",
  as: "handicapAudits"
});
HandicapAudit.belongsTo(League, {
  foreignKey: "leagueId",
  as: "league"
});

Season.hasMany(HandicapAudit, {
  foreignKey: "seasonId",
  as: "handicapAudits"
});
HandicapAudit.belongsTo(Season, {
  foreignKey: "seasonId",
  as: "season"
});

User.hasMany(HandicapAudit, {
  foreignKey: "actedByUserId",
  as: "handicapAuditActions"
});
HandicapAudit.belongsTo(User, {
  foreignKey: "actedByUserId",
  as: "actedBy"
});


Season.hasMany(SeasonTransitionPlan, {
  foreignKey: "sourceSeasonId",
  as: "outgoingTransitionPlans"
});
SeasonTransitionPlan.belongsTo(Season, {
  foreignKey: "sourceSeasonId",
  as: "sourceSeason"
});
Season.hasMany(SeasonTransitionPlan, {
  foreignKey: "targetSeasonId",
  as: "incomingTransitionPlans"
});
SeasonTransitionPlan.belongsTo(Season, {
  foreignKey: "targetSeasonId",
  as: "targetSeason"
});
SeasonTransitionPlan.hasMany(SeasonTransitionEntry, {
  foreignKey: "planId",
  as: "entries"
});
SeasonTransitionEntry.belongsTo(SeasonTransitionPlan, {
  foreignKey: "planId",
  as: "plan"
});
Team.hasMany(SeasonTransitionEntry, {
  foreignKey: "teamId",
  as: "transitionEntries"
});
SeasonTransitionEntry.belongsTo(Team, {
  foreignKey: "teamId",
  as: "team"
});
Division.hasMany(SeasonTransitionEntry, {
  foreignKey: "sourceDivisionId",
  as: "outgoingTransitionEntries"
});
SeasonTransitionEntry.belongsTo(Division, {
  foreignKey: "sourceDivisionId",
  as: "sourceDivision"
});
Division.hasMany(SeasonTransitionEntry, {
  foreignKey: "targetDivisionId",
  as: "incomingTransitionEntries"
});
SeasonTransitionEntry.belongsTo(Division, {
  foreignKey: "targetDivisionId",
  as: "targetDivision"
});
SeasonTransitionPlan.hasMany(SeasonTransitionAudit, {
  foreignKey: "planId",
  as: "audits"
});
SeasonTransitionAudit.belongsTo(SeasonTransitionPlan, {
  foreignKey: "planId",
  as: "plan"
});


League.hasMany(PlayerSanction, {
  foreignKey: "leagueId",
  as: "playerSanctions"
});
PlayerSanction.belongsTo(League, {
  foreignKey: "leagueId",
  as: "league"
});

Season.hasMany(PlayerSanction, {
  foreignKey: "seasonId",
  as: "playerSanctions"
});
PlayerSanction.belongsTo(Season, {
  foreignKey: "seasonId",
  as: "season"
});

Player.hasMany(PlayerSanction, {
  foreignKey: "playerId",
  as: "sanctions"
});
PlayerSanction.belongsTo(Player, {
  foreignKey: "playerId",
  as: "player"
});

User.hasMany(PlayerSanction, {
  foreignKey: "issuedByUserId",
  as: "issuedSanctions"
});
PlayerSanction.belongsTo(User, {
  foreignKey: "issuedByUserId",
  as: "issuedBy"
});

PlayerSanction.hasMany(SanctionAppeal, {
  foreignKey: "sanctionId",
  as: "appeals"
});
SanctionAppeal.belongsTo(PlayerSanction, {
  foreignKey: "sanctionId",
  as: "sanction"
});

Player.hasMany(SanctionAppeal, {
  foreignKey: "playerId",
  as: "sanctionAppeals"
});
SanctionAppeal.belongsTo(Player, {
  foreignKey: "playerId",
  as: "player"
});

PlayerSanction.hasMany(SanctionAudit, {
  foreignKey: "sanctionId",
  as: "audits"
});
SanctionAudit.belongsTo(PlayerSanction, {
  foreignKey: "sanctionId",
  as: "sanction"
});

User.hasMany(SanctionAudit, {
  foreignKey: "actorUserId",
  as: "sanctionAuditActions"
});
SanctionAudit.belongsTo(User, {
  foreignKey: "actorUserId",
  as: "actor"
});

export {
  sequelize,
  User,
  League,
  LeagueAdmin,
  LeagueSettings,
  MatchFormat,
  Season,
  SeasonRuleSnapshot,
  Division,
  Team,
  SeasonTeam,
  Player,
  SeasonTeamPlayer,
  PlayerTransfer,
  Match,
  MatchFrame,
  MatchResultAudit,
  PlayerHandicap,
  TeamHandicap,
  HandicapAudit,
  SeasonTransitionPlan,
  SeasonTransitionEntry,
  SeasonTransitionAudit,
  PlayerSanction,
  SanctionAppeal,
  SanctionAudit,
  LEAGUE_ADMIN_ROLES,
  HANDICAP_METHODS,
  SCORING_METHODS,
  SEASON_STATUSES,
  SEASON_TEAM_STATUSES,
  ROSTER_STATUSES,
  MATCH_STATUSES,
  FRAME_RESULT_TYPES,
  HANDICAP_SOURCES,
  TRANSITION_PLAN_STATUSES,
  TRANSITION_ACTIONS,
  SANCTION_TYPES,
  SANCTION_STATUSES,
  APPEAL_STATUSES
};
