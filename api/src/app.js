import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { sessionMiddleware } from "./config/session.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import divisionRoutes, { seasonDivisionRouter } from "./routes/division.routes.js";
import leagueRoutes, { matchFormatRouter } from "./routes/league.routes.js";
import {
  playerHandicapRecordRouter,
  playerHandicapRouter,
  seasonHandicapRouter,
  seasonTeamHandicapRouter,
  teamHandicapRecordRouter
} from "./routes/handicap.routes.js";
import matchRoutes, {
  divisionFixtureRouter,
  seasonMatchRouter
} from "./routes/match.routes.js";
import {
  leaguePlayerRouter,
  playerRouter,
  rosterEntryRouter,
  seasonTeamRosterRouter
} from "./routes/player.routes.js";
import resultRoutes from "./routes/result.routes.js";
import { publicRouter } from "./routes/public.routes.js";
import {
  leagueReportRouter,
  seasonReportRouter
} from "./routes/report.routes.js";
import seasonRoutes, { leagueSeasonRouter } from "./routes/season.routes.js";
import {
  appealRouter,
  playerSanctionRouter,
  sanctionRouter
} from "./routes/sanction.routes.js";
import {
  divisionStandingsRouter,
  seasonStandingsRouter
} from "./routes/standings.routes.js";
import {
  seasonTransitionRouter,
  transitionPlanRouter
} from "./routes/transition.routes.js";
import {
  leagueTeamRouter,
  seasonTeamCollectionRouter,
  seasonTeamRouter,
  teamRouter
} from "./routes/team.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDirectory = path.resolve(__dirname, "../public");

export const app = express();

app.set("trust proxy", env.TRUST_PROXY);
app.disable("x-powered-by");

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.APP_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"]
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(sessionMiddleware);

app.get("/health", (_req, res) => {
  res.json({ data: { status: "ok" } });
});

app.use("/api/v1/public", publicRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/leagues", leagueRoutes);
app.use("/api/v1/leagues/:leagueId/seasons", leagueSeasonRouter);
app.use("/api/v1/leagues/:leagueId/reports", leagueReportRouter);
app.use("/api/v1/leagues/:leagueId/teams", leagueTeamRouter);
app.use("/api/v1/leagues/:leagueId/players", leaguePlayerRouter);
app.use("/api/v1/match-formats", matchFormatRouter);
app.use("/api/v1/seasons/:seasonId/divisions", seasonDivisionRouter);
app.use("/api/v1/seasons/:seasonId/matches", seasonMatchRouter);
app.use("/api/v1/seasons/:seasonId/teams", seasonTeamCollectionRouter);
app.use("/api/v1/seasons/:seasonId/standings", seasonStandingsRouter);
app.use("/api/v1/seasons/:seasonId/reports", seasonReportRouter);
app.use("/api/v1/seasons/:seasonId/transitions", seasonTransitionRouter);
app.use("/api/v1/seasons/:seasonId/handicaps", seasonHandicapRouter);
app.use("/api/v1/seasons", seasonRoutes);
app.use("/api/v1/divisions/:divisionId/fixtures", divisionFixtureRouter);
app.use("/api/v1/divisions/:divisionId/standings", divisionStandingsRouter);
app.use("/api/v1/divisions", divisionRoutes);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/season-teams/:seasonTeamId/roster", seasonTeamRosterRouter);
app.use("/api/v1/season-teams/:seasonTeamId/handicaps", seasonTeamHandicapRouter);
app.use("/api/v1/season-teams", seasonTeamRouter);
app.use("/api/v1/players/:playerId/handicaps", playerHandicapRouter);
app.use("/api/v1/players/:playerId/sanctions", playerSanctionRouter);
app.use("/api/v1/players", playerRouter);
app.use("/api/v1/player-sanctions", sanctionRouter);
app.use("/api/v1/sanction-appeals", appealRouter);
app.use("/api/v1/season-transition-plans", transitionPlanRouter);
app.use("/api/v1/player-handicaps", playerHandicapRecordRouter);
app.use("/api/v1/team-handicaps", teamHandicapRecordRouter);
app.use("/api/v1/matches", resultRoutes);
app.use("/api/v1/matches", matchRoutes);
app.use("/api/v1/roster-entries", rosterEntryRouter);

// Serve the compiled React application from the same origin.
app.use(express.static(frontendDirectory, {
  index: false,
  maxAge: env.NODE_ENV === "production" ? "1y" : 0,
  immutable: env.NODE_ENV === "production"
}));

// React Router fallback. API misses continue through the API 404 handler.
app.get("*splat", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path === "/health") {
    return next();
  }
  return res.sendFile(path.join(frontendDirectory, "index.html"));
});

app.use(notFound);
app.use(errorHandler);
