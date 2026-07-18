import { NavLink, useParams } from "react-router-dom";

export function LeagueTabs() {
  const { leagueId } = useParams();
  const base = `/app/leagues/${leagueId}`;
  return (
    <nav className="tabs tabs--wrap">
      <NavLink end to={base}>Dashboard</NavLink>
      <NavLink to={`${base}/seasons`}>Seasons</NavLink>
      <NavLink to={`${base}/teams`}>Teams</NavLink>
      <NavLink to={`${base}/players`}>Players</NavLink>
      <NavLink to={`${base}/match-formats`}>Match formats</NavLink>
      <NavLink to={`${base}/settings`}>Settings</NavLink>
    </nav>
  );
}
