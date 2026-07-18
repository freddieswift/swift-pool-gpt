import { NavLink, useParams } from "react-router-dom";

export function SeasonTabs() {
  const { leagueId, seasonId } = useParams();
  const base = `/app/leagues/${leagueId}/seasons/${seasonId}`;
  return (
    <nav className="tabs tabs--wrap">
      <NavLink end to={base}>Dashboard</NavLink>
      <NavLink to={`${base}/divisions`}>Divisions</NavLink>
      <NavLink to={`${base}/teams`}>Teams</NavLink>
      <NavLink to={`${base}/fixtures`}>Fixtures</NavLink>
      <NavLink to={`${base}/standings`}>Standings</NavLink>
      <NavLink to={`${base}/players`}>Statistics</NavLink>
      <NavLink to={`${base}/handicaps`}>Handicaps</NavLink>
      <NavLink to={`${base}/transitions`}>Transitions</NavLink>
      <NavLink to={`${base}/reports`}>Reports</NavLink>
    </nav>
  );
}
