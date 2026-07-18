import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useApi } from "../hooks/useApi.js";
import {
  EmptyState, ErrorState, Loading, PageHeader, Section, StatCard, StatusBadge
} from "../components/ui.jsx";

export function PublicLeaguePage() {
  const { leagueSlug } = useParams();
  const request = useApi(() => api.get(`/public/leagues/${leagueSlug}`), [leagueSlug]);

  if (request.loading) return <Loading label="Loading league" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  const { league, seasons = [] } = request.data;
  return (
    <>
      <PageHeader eyebrow="Public league" title={league.name} description={league.description} />
      <Section title="Seasons">
        {seasons.length ? (
          <div className="card-grid">
            {seasons.map((season) => (
              <Link className="entity-card" key={season.id} to={`/public/${league.slug}/${season.slug}`}>
                <div><strong>{season.name}</strong><StatusBadge status={season.status} /></div>
                <p>{formatDate(season.startDate)} – {formatDate(season.endDate)}</p>
              </Link>
            ))}
          </div>
        ) : <EmptyState title="No public seasons" message="This league has not published a season yet." />}
      </Section>
    </>
  );
}

export function PublicSeasonPage() {
  const { leagueSlug, seasonSlug } = useParams();
  const base = `/public/leagues/${leagueSlug}/seasons/${seasonSlug}`;
  const request = useApi(() => api.get(base), [leagueSlug, seasonSlug]);

  if (request.loading) return <Loading label="Loading season" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  const data = request.data;
  return (
    <>
      <PageHeader
        eyebrow={data.league.name}
        title={data.season.name}
        description={`${formatDate(data.season.startDate)} – ${formatDate(data.season.endDate)}`}
        actions={<StatusBadge status={data.season.status} />}
      />
      <nav className="tabs">
        <Link to={`/public/${leagueSlug}/${seasonSlug}/standings`}>Standings</Link>
        <Link to={`/public/${leagueSlug}/${seasonSlug}/fixtures`}>Fixtures & results</Link>
        <Link to={`/public/${leagueSlug}/${seasonSlug}/players`}>Player stats</Link>
      </nav>
      <div className="stats-grid">
        <StatCard label="Divisions" value={data.divisions?.length || 0} />
        <StatCard label="Teams" value={data.teams?.length || 0} />
        <StatCard label="Upcoming" value={data.upcomingFixtures?.length || 0} />
        <StatCard label="Recent results" value={data.recentResults?.length || 0} />
      </div>
      <MatchSections upcoming={data.upcomingFixtures} recent={data.recentResults} leagueSlug={leagueSlug} seasonSlug={seasonSlug} />
    </>
  );
}

export function PublicStandingsPage() {
  const { leagueSlug, seasonSlug } = useParams();
  const request = useApi(
    () => api.get(`/public/leagues/${leagueSlug}/seasons/${seasonSlug}/standings`),
    [leagueSlug, seasonSlug]
  );

  if (request.loading) return <Loading label="Calculating standings" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  return (
    <>
      <PageHeader title="Standings" description="Calculated from completed matches." />
      {(request.data.divisions || []).map(({ division, standings }) => (
        <Section key={division.id} title={division.name}>
          <div className="table-scroll"><table>
            <thead><tr><th>Pos</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>FD</th><th>Pts</th></tr></thead>
            <tbody>{standings.map((row) => (
              <tr key={row.seasonTeamId}>
                <td><strong>{row.position}</strong></td><td>{row.teamName}</td><td>{row.played}</td>
                <td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td>
                <td>{row.frameDifference > 0 ? `+${row.frameDifference}` : row.frameDifference}</td>
                <td><strong>{row.totalPoints}</strong></td>
              </tr>
            ))}</tbody>
          </table></div>
        </Section>
      ))}
    </>
  );
}

export function PublicFixturesPage() {
  const { leagueSlug, seasonSlug } = useParams();
  const request = useApi(
    () => api.get(`/public/leagues/${leagueSlug}/seasons/${seasonSlug}/matches?limit=200&order=asc`),
    [leagueSlug, seasonSlug]
  );

  if (request.loading) return <Loading label="Loading fixtures" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  return (
    <>
      <PageHeader title="Fixtures & results" description={`${request.data.count} scheduled league matches.`} />
      <div className="match-list">
        {request.data.matches.map((match) => (
          <MatchCard key={match.id} match={match} to={`/public/${leagueSlug}/${seasonSlug}/matches/${match.id}`} />
        ))}
      </div>
    </>
  );
}

export function PublicPlayersPage() {
  const { leagueSlug, seasonSlug } = useParams();
  const request = useApi(
    () => api.get(`/public/leagues/${leagueSlug}/seasons/${seasonSlug}/statistics/players?limit=100`),
    [leagueSlug, seasonSlug]
  );

  if (request.loading) return <Loading label="Loading player statistics" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  return (
    <>
      <PageHeader title="Player statistics" description="Published season frame performance." />
      <Section title="Leaderboard">
        <div className="table-scroll"><table>
          <thead><tr><th>Player</th><th>Played</th><th>Won</th><th>Lost</th><th>Win %</th></tr></thead>
          <tbody>{request.data.players.map((player) => (
            <tr key={player.playerId}><td><strong>{player.displayName}</strong></td>
              <td>{player.framesPlayed}</td><td>{player.framesWon}</td><td>{player.framesLost}</td>
              <td>{player.winPercentage}%</td></tr>
          ))}</tbody>
        </table></div>
      </Section>
    </>
  );
}

export function PublicMatchPage() {
  const { leagueSlug, seasonSlug, matchId } = useParams();
  const request = useApi(
    () => api.get(`/public/leagues/${leagueSlug}/seasons/${seasonSlug}/matches/${matchId}`),
    [leagueSlug, seasonSlug, matchId]
  );

  if (request.loading) return <Loading label="Loading match" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  const match = request.data;
  return (
    <>
      <PageHeader
        eyebrow={match.division?.name}
        title={`${match.homeTeam.name} v ${match.awayTeam.name}`}
        description={formatDateTime(match.scheduledAt)}
        actions={<StatusBadge status={match.status} />}
      />
      <section className="scoreboard">
        <div><span>{match.homeTeam.name}</span><strong>{match.result?.homeFramesWon ?? "—"}</strong></div>
        <b>–</b>
        <div><span>{match.awayTeam.name}</span><strong>{match.result?.awayFramesWon ?? "—"}</strong></div>
      </section>
      {match.frames?.length ? (
        <Section title="Frames">
          <div className="frame-list">{match.frames.map((frame) => (
            <div className="frame-row" key={frame.frameNumber}>
              <b>{frame.frameNumber}</b><span>{frame.homePlayer?.displayName || "—"}</span>
              <strong>{frame.winnerSide === "HOME" ? "1–0" : frame.winnerSide === "AWAY" ? "0–1" : "—"}</strong>
              <span>{frame.awayPlayer?.displayName || "—"}</span>
            </div>
          ))}</div>
        </Section>
      ) : null}
    </>
  );
}

function MatchSections({ upcoming = [], recent = [], leagueSlug, seasonSlug }) {
  return (
    <div className="two-column">
      <Section title="Upcoming fixtures">
        <div className="match-list compact">{upcoming.map((match) => (
          <MatchCard key={match.id} match={match} to={`/public/${leagueSlug}/${seasonSlug}/matches/${match.id}`} />
        ))}</div>
      </Section>
      <Section title="Recent results">
        <div className="match-list compact">{recent.map((match) => (
          <MatchCard key={match.id} match={match} to={`/public/${leagueSlug}/${seasonSlug}/matches/${match.id}`} />
        ))}</div>
      </Section>
    </div>
  );
}

function MatchCard({ match, to }) {
  return (
    <Link className="match-card" to={to}>
      <div className="match-meta"><span>{formatDateTime(match.scheduledAt)}</span><StatusBadge status={match.status} /></div>
      <div className="match-teams">
        <span>{match.homeTeam.name}</span>
        <strong>{match.result ? `${match.result.homeFramesWon} – ${match.result.awayFramesWon}` : "v"}</strong>
        <span>{match.awayTeam.name}</span>
      </div>
      <small>{match.division?.name}</small>
    </Link>
  );
}

function formatDate(value) {
  if (!value) return "TBC";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "Date TBC";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
