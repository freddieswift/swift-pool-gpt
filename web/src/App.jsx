import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { PublicLayout } from "./components/PublicLayout.jsx";
import { LoginPage, RegisterPage } from "./pages/AuthPages.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import {
  PublicFixturesPage, PublicLeaguePage, PublicMatchPage, PublicPlayersPage,
  PublicSeasonPage, PublicStandingsPage
} from "./pages/PublicLeaguePages.jsx";
import {
  AppDashboardPage, LeagueDashboardPage, LeagueSeasonsPage, LeagueSettingsPage,
  LeaguesPage, ProfilePage, SeasonDashboardPage, SeasonPlayersPage,
  SeasonStandingsPage
} from "./pages/AdminPages.jsx";
import {
  DivisionManagementPage, FixtureManagementPage, MatchWorkspacePage,
  RosterManagementPage, TeamRegistrationPage
} from "./pages/OperationsPages.jsx";
import {
  HandicapCalculatorPage, LeagueTeamDirectoryPage, MatchFormatsPage,
  PlayerDirectoryPage, PlayerWorkspacePage, ReportsPage,
  TransitionPlansPage, TransitionPlanWorkspacePage
} from "./pages/GovernancePages.jsx";

export function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="public/:leagueSlug" element={<PublicLeaguePage />} />
        <Route path="public/:leagueSlug/:seasonSlug" element={<PublicSeasonPage />} />
        <Route path="public/:leagueSlug/:seasonSlug/standings" element={<PublicStandingsPage />} />
        <Route path="public/:leagueSlug/:seasonSlug/fixtures" element={<PublicFixturesPage />} />
        <Route path="public/:leagueSlug/:seasonSlug/players" element={<PublicPlayersPage />} />
        <Route path="public/:leagueSlug/:seasonSlug/matches/:matchId" element={<PublicMatchPage />} />
      </Route>

      <Route path="app" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AppDashboardPage />} />
        <Route path="leagues" element={<LeaguesPage />} />
        <Route path="leagues/:leagueId" element={<LeagueDashboardPage />} />
        <Route path="leagues/:leagueId/seasons" element={<LeagueSeasonsPage />} />
        <Route path="leagues/:leagueId/teams" element={<LeagueTeamDirectoryPage />} />
        <Route path="leagues/:leagueId/players" element={<PlayerDirectoryPage />} />
        <Route path="leagues/:leagueId/players/:playerId" element={<PlayerWorkspacePage />} />
        <Route path="leagues/:leagueId/match-formats" element={<MatchFormatsPage />} />
        <Route path="leagues/:leagueId/settings" element={<LeagueSettingsPage />} />

        <Route path="leagues/:leagueId/seasons/:seasonId" element={<SeasonDashboardPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/divisions" element={<DivisionManagementPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/teams" element={<TeamRegistrationPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/teams/rosters/:seasonTeamId" element={<RosterManagementPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/fixtures" element={<FixtureManagementPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/fixtures/matches/:matchId" element={<MatchWorkspacePage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/standings" element={<SeasonStandingsPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/players" element={<SeasonPlayersPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/handicaps" element={<HandicapCalculatorPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/transitions" element={<TransitionPlansPage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/transitions/plans/:planId" element={<TransitionPlanWorkspacePage />} />
        <Route path="leagues/:leagueId/seasons/:seasonId/reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
