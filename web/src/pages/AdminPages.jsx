import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useApi } from "../hooks/useApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { LeagueTabs } from "../components/LeagueTabs.jsx";
import { SeasonTabs } from "../components/SeasonTabs.jsx";
import {
  Breadcrumbs, EmptyState, ErrorState, Loading, Modal, PageHeader,
  Section, StatCard, StatusBadge
} from "../components/ui.jsx";

export function AppDashboardPage() {
  const { user } = useAuth();
  const leagues = useApi(() => api.get("/leagues"), []);

  if (leagues.loading) return <Loading label="Loading your workspace" />;
  if (leagues.error) return <ErrorState error={leagues.error} onRetry={leagues.reload} />;

  return (
    <>
      <PageHeader
        eyebrow="Control room"
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Manage league operations and move quickly to the work that needs attention."
        actions={<Link className="button" to="/app/leagues">Manage leagues</Link>}
      />
      <div className="stats-grid">
        <StatCard label="Your leagues" value={leagues.data.leagues.length} />
        <StatCard label="Open actions" value="—" hint="Connect notifications in a later phase" />
        <StatCard label="Current session" value="Active" />
      </div>
      <Section title="Recent leagues">
        <LeagueCards leagues={leagues.data.leagues.slice(0, 6)} />
      </Section>
    </>
  );
}

export function LeaguesPage() {
  const request = useApi(() => api.get("/leagues"), []);
  const [open, setOpen] = useState(false);

  if (request.loading) return <Loading label="Loading leagues" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  return (
    <>
      <PageHeader
        title="Leagues"
        description="Every league you own or administer."
        actions={<button className="button" onClick={() => setOpen(true)} type="button">Create league</button>}
      />
      <LeagueCards leagues={request.data.leagues} />
      {open ? <CreateLeagueModal onClose={() => setOpen(false)} onCreated={() => { setOpen(false); request.reload(); }} /> : null}
    </>
  );
}

function LeagueCards({ leagues }) {
  if (!leagues?.length) {
    return <EmptyState title="No leagues yet" message="Create your first league to begin setting up a season." />;
  }
  return (
    <div className="card-grid">
      {leagues.map((league) => (
        <Link className="entity-card" key={league.id} to={`/app/leagues/${league.id}`}>
          <div><strong>{league.name}</strong><StatusBadge status={league.isActive === false ? "INACTIVE" : "ACTIVE"} /></div>
          <p>{league.description || "No description supplied."}</p>
          <small>{league.slug}</small>
        </Link>
      ))}
    </div>
  );
}

function CreateLeagueModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/leagues", form);
      show("League created");
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Create league" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        {error ? <div className="form-error">{error}</div> : null}
        <label>Name<input required value={form.name} onChange={(e) => {
          const name = e.target.value;
          setForm({ ...form, name, slug: form.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") });
        }} /></label>
        <label>Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
        <label>Description<textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" disabled={saving} type="submit">{saving ? "Creating…" : "Create league"}</button></div>
      </form>
    </Modal>
  );
}

export function LeagueDashboardPage() {
  const { leagueId } = useParams();
  const league = useApi(() => api.get(`/leagues/${leagueId}`), [leagueId]);
  const dashboard = useApi(() => api.get(`/leagues/${leagueId}/reports/dashboard`), [leagueId]);

  if (league.loading || dashboard.loading) return <Loading label="Loading league dashboard" />;
  if (league.error || dashboard.error) return <ErrorState error={league.error || dashboard.error} />;

  const data = dashboard.data;
  return (
    <>
      <Breadcrumbs items={[{ label: "Leagues", to: "/app/leagues" }, { label: league.data.league.name }]} />
      <PageHeader title={league.data.league.name} description={league.data.league.description} />
      <LeagueTabs />
      <div className="stats-grid">
        <StatCard label="Seasons" value={data.totals.seasons} />
        <StatCard label="Active seasons" value={data.totals.activeSeasons} />
        <StatCard label="Teams" value={data.totals.activeTeams} />
        <StatCard label="Players" value={data.totals.activePlayers} />
      </div>
      <Section title="Seasons" action={<Link to={`/app/leagues/${leagueId}/seasons`}>View all</Link>}>
        <div className="card-grid">
          {data.seasons.map((season) => (
            <Link className="entity-card" key={season.id} to={`/app/leagues/${leagueId}/seasons/${season.id}`}>
              <div><strong>{season.name}</strong><StatusBadge status={season.status} /></div>
              <p>{season.startDate} – {season.endDate}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

export function LeagueSeasonsPage() {
  const { leagueId } = useParams();
  const league = useApi(() => api.get(`/leagues/${leagueId}`), [leagueId]);
  const seasons = useApi(() => api.get(`/leagues/${leagueId}/seasons`), [leagueId]);
  const [open, setOpen] = useState(false);

  if (league.loading || seasons.loading) return <Loading label="Loading seasons" />;
  if (league.error || seasons.error) return <ErrorState error={league.error || seasons.error} />;

  return (
    <>
      <PageHeader title={`${league.data.league.name} seasons`} actions={
        <button className="button" onClick={() => setOpen(true)} type="button">Create season</button>
      } />
      <LeagueTabs />
      <div className="card-grid">
        {(seasons.data.seasons || []).map((season) => (
          <Link className="entity-card" key={season.id} to={`/app/leagues/${leagueId}/seasons/${season.id}`}>
            <div><strong>{season.name}</strong><StatusBadge status={season.status} /></div>
            <p>{season.startDate} – {season.endDate}</p>
          </Link>
        ))}
      </div>
      {open ? <CreateSeasonModal leagueId={leagueId} onClose={() => setOpen(false)}
        onCreated={() => { setOpen(false); seasons.reload(); }} /> : null}
    </>
  );
}

function CreateSeasonModal({ leagueId, onClose, onCreated }) {
  const formats = useApi(() => api.get(`/leagues/${leagueId}/match-formats`), [leagueId]);
  const [form, setForm] = useState({
    name: "", slug: "", startDate: "", endDate: "", matchFormatId: "",
    teamsPlayEachOther: 1, useHomeAndAway: false, pointsDeductionEnabled: false
  });
  const [error, setError] = useState("");
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/leagues/${leagueId}/seasons`, {
        ...form,
        matchFormatId: form.matchFormatId || formats.data?.matchFormats?.[0]?.id,
        teamsPlayEachOther: Number(form.teamsPlayEachOther)
      });
      show("Season created");
      onCreated();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return <Modal title="Create season" onClose={onClose}><form className="form-stack" onSubmit={submit}>
    {error ? <div className="form-error">{error}</div> : null}
    <label>Name<input required value={form.name} onChange={(e) => {
      const name = e.target.value;
      setForm({ ...form, name, slug: form.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") });
    }} /></label>
    <label>Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
    <label>Match format<select required value={form.matchFormatId} onChange={(e) => setForm({ ...form, matchFormatId: e.target.value })}>
<option value="">Select format</option>{(formats.data?.matchFormats || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
<div className="form-row"><label>Start date<input required type="date" value={form.startDate}
      onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
      <label>End date<input required type="date" value={form.endDate}
      onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></label></div>
<div className="form-row"><label>Meetings per opponent<input min="1" max="20" type="number" value={form.teamsPlayEachOther} onChange={(e) => setForm({ ...form, teamsPlayEachOther: e.target.value })} /></label>
<label className="checkbox"><input checked={form.useHomeAndAway} type="checkbox" onChange={(e) => setForm({ ...form, useHomeAndAway: e.target.checked })} /> Home and away</label></div>
<div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
      <button className="button" type="submit">Create season</button></div>
  </form></Modal>;
}

export function LeagueSettingsPage() {
  const { leagueId } = useParams();
  const request = useApi(() => api.get(`/leagues/${leagueId}/settings`), [leagueId]);
  const { show } = useToast();
  const [saving, setSaving] = useState(false);

  if (request.loading) return <Loading label="Loading settings" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  const settings = request.data.settings;
  async function toggle(key) {
    setSaving(true);
    try {
      const result = await api.patch(`/leagues/${leagueId}/settings`, { [key]: !settings[key] });
      request.setData({ settings: result.settings });
      show("Settings updated");
    } catch (error) {
      show(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const switches = [
    ["publicEnabled", "Public league pages", "Allow unauthenticated access to published league information."],
    ["publicRosterNames", "Public roster names", "Publish player display names and frame participants."],
    ["publicPlayerStatistics", "Public player statistics", "Publish player frame statistics."],
    ["publicVenueAddresses", "Public venue addresses", "Publish full venue addresses on public team pages."]
  ];

  return (
    <>
      <PageHeader title="League settings" description="Control scoring behaviour and public visibility." />
      <LeagueTabs />
      <Section title="Public visibility">
        <div className="settings-list">{switches.map(([key, title, description]) => (
          <button className="setting-row" disabled={saving} key={key} onClick={() => toggle(key)} type="button">
            <span><strong>{title}</strong><small>{description}</small></span>
            <span className={`switch ${settings[key] ? "switch--on" : ""}`}><i /></span>
          </button>
        ))}</div>
      </Section>
    </>
  );
}

export function SeasonDashboardPage() {
  const { leagueId, seasonId } = useParams();
  const season = useApi(() => api.get(`/seasons/${seasonId}`), [seasonId]);
  const dashboard = useApi(() => api.get(`/seasons/${seasonId}/reports/dashboard`), [seasonId]);

  if (season.loading || dashboard.loading) return <Loading label="Loading season dashboard" />;
  if (season.error || dashboard.error) return <ErrorState error={season.error || dashboard.error} />;

  const data = dashboard.data;
  return (
    <>
      <Breadcrumbs items={[
        { label: "Leagues", to: "/app/leagues" },
        { label: "League", to: `/app/leagues/${leagueId}` },
        { label: season.data.season.name }
      ]} />
      <PageHeader title={season.data.season.name} actions={<StatusBadge status={season.data.season.status} />} />
      <SeasonTabs />
      <div className="stats-grid">
        <StatCard label="Divisions" value={data.totals.divisions} />
        <StatCard label="Teams" value={data.totals.registeredTeams} />
        <StatCard label="Matches" value={data.totals.matches} />
        <StatCard label="Complete" value={`${data.totals.completionPercentage}%`} />
      </div>
      <div className="two-column">
        <Section title="Upcoming fixtures"><AdminMatchList matches={data.upcomingFixtures} /></Section>
        <Section title="Recent results"><AdminMatchList matches={data.recentResults} /></Section>
      </div>
    </>
  );
}

export function SeasonFixturesPage() {
  const { seasonId } = useParams();
  const request = useApi(() => api.get(`/seasons/${seasonId}/reports/fixtures`), [seasonId]);

  if (request.loading) return <Loading label="Loading fixtures" />;
  if (request.error) return <ErrorState error={request.error} />;

  return (
    <>
      <PageHeader title="Fixtures" description={`${request.data.count} matches`} />
      <SeasonTabs />
      <Section title="Schedule">
        <div className="table-scroll"><table><thead><tr><th>Date</th><th>Division</th><th>Home</th><th>Away</th><th>Status</th></tr></thead>
          <tbody>{request.data.fixtures.map((match) => <tr key={match.id}><td>{formatDateTime(match.scheduledAt)}</td>
            <td>{match.division}</td><td>{match.homeTeam}</td><td>{match.awayTeam}</td><td><StatusBadge status={match.status} /></td></tr>)}</tbody>
        </table></div>
      </Section>
    </>
  );
}

export function SeasonStandingsPage() {
  const { seasonId } = useParams();
  const request = useApi(() => api.get(`/seasons/${seasonId}/standings`), [seasonId]);

  if (request.loading) return <Loading label="Calculating standings" />;
  if (request.error) return <ErrorState error={request.error} />;

  return (
    <>
      <PageHeader title="Standings" description="Calculated from completed matches." />
      <SeasonTabs />
      {(request.data.divisions || []).map(({ division, standings }) => (
        <Section key={division.id} title={division.name}>
          <div className="table-scroll"><table><thead><tr><th>Pos</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>FD</th><th>Pts</th></tr></thead>
          <tbody>{standings.map((row) => <tr key={row.seasonTeamId}><td>{row.position}</td><td><strong>{row.teamName}</strong></td>
            <td>{row.played}</td><td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td><td>{row.frameDifference}</td><td><strong>{row.totalPoints}</strong></td></tr>)}</tbody>
          </table></div>
        </Section>
      ))}
    </>
  );
}

export function SeasonTeamsPage() {
  const { seasonId } = useParams();
  const request = useApi(() => api.get(`/seasons/${seasonId}/season-teams`), [seasonId]);

  if (request.loading) return <Loading label="Loading teams" />;
  if (request.error) return <ErrorState error={request.error} />;

  const teams = request.data.seasonTeams || request.data.teams || [];
  return (
    <>
      <PageHeader title="Season teams" />
      <SeasonTabs />
      <div className="card-grid">{teams.map((entry) => (
        <article className="entity-card" key={entry.id}><div><strong>{entry.team?.name || entry.teamName}</strong>
          <StatusBadge status={entry.status} /></div><p>{entry.division?.name || "Unassigned division"}</p></article>
      ))}</div>
    </>
  );
}

export function SeasonPlayersPage() {
  const { seasonId } = useParams();
  const request = useApi(() => api.get(`/seasons/${seasonId}/standings/statistics/players`), [seasonId]);

  if (request.loading) return <Loading label="Loading players" />;
  if (request.error) return <ErrorState error={request.error} />;

  return (
    <>
      <PageHeader title="Player statistics" />
      <SeasonTabs />
      <Section title="Season performance"><div className="table-scroll"><table><thead><tr><th>Player</th><th>Played</th><th>Won</th><th>Lost</th><th>Win %</th></tr></thead>
        <tbody>{(request.data.players || []).map((player) => <tr key={player.playerId}><td><strong>{player.displayName}</strong></td>
          <td>{player.framesPlayed}</td><td>{player.framesWon}</td><td>{player.framesLost}</td><td>{player.winPercentage}%</td></tr>)}</tbody>
      </table></div></Section>
    </>
  );
}

export function SeasonTransitionsPage() {
  const { seasonId } = useParams();
  const request = useApi(() => api.get(`/seasons/${seasonId}/transitions`), [seasonId]);

  if (request.loading) return <Loading label="Loading transition plans" />;
  if (request.error) return <ErrorState error={request.error} />;

  return (
    <>
      <PageHeader title="Season transitions" description="Promotion and relegation plans for the next season." />
      <SeasonTabs />
      <div className="card-grid">{(request.data.plans || []).map((plan) => (
        <article className="entity-card" key={plan.id}><div><strong>Transition plan</strong><StatusBadge status={plan.status} /></div>
          <p>Target season: {plan.targetSeasonId}</p><small>Created {formatDateTime(plan.createdAt)}</small></article>
      ))}</div>
      {!(request.data.plans || []).length ? <EmptyState title="No transition plans" message="Generate a plan after final standings are ready." /> : null}
    </>
  );
}

export function ProfilePage() {
  const { user, refresh } = useAuth();
  const { show } = useToast();
  const [form, setForm] = useState({ firstName: user?.firstName || "", lastName: user?.lastName || "" });

  async function submit(event) {
    event.preventDefault();
    try {
      await api.patch("/auth/me", form);
      await refresh();
      show("Profile updated");
    } catch (error) {
      show(error.message, "error");
    }
  }

  return (
    <>
      <PageHeader title="Your profile" description={user?.email} />
      <Section title="Personal details"><form className="form-stack form-narrow" onSubmit={submit}>
        <label>First name<input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
        <label>Last name<input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
        <button className="button" type="submit">Save changes</button>
      </form></Section>
    </>
  );
}

function AdminMatchList({ matches = [] }) {
  return <div className="admin-match-list">{matches.map((match) => (
    <div className="admin-match-row" key={match.id}><span><small>{formatDateTime(match.scheduledAt)}</small>
      <strong>{match.homeTeam} v {match.awayTeam}</strong></span><StatusBadge status={match.status} /></div>
  ))}</div>;
}

function formatDateTime(value) {
  if (!value) return "TBC";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
