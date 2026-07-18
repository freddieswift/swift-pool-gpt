import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { collection, entity, formatDate, formatDateTime, slugify, toDateInput } from "../lib/data.js";
import { useApi } from "../hooks/useApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { LeagueTabs } from "../components/LeagueTabs.jsx";
import { SeasonTabs } from "../components/SeasonTabs.jsx";
import { CheckboxField, FormError, SelectField, TextAreaField, TextField } from "../components/FormFields.jsx";
import { EmptyState, ErrorState, Loading, Modal, PageHeader, Section, StatusBadge } from "../components/ui.jsx";

export function LeagueTeamDirectoryPage() {
  const { leagueId } = useParams();
  const request = useApi(() => api.get(`/leagues/${leagueId}/teams?includeInactive=true`), [leagueId]);
  const [editing, setEditing] = useState(null);
  const { show } = useToast();

  if (request.loading) return <Loading label="Loading team directory" />;
  if (request.error) return <ErrorState error={request.error} />;

  const teams = collection(request.data, "teams");
  return (
    <>
      <PageHeader title="Team directory" description="Reusable league teams and venue contact records."
        actions={<button className="button" onClick={() => setEditing({})} type="button">Create team</button>} />
      <LeagueTabs />
      <div className="card-grid">
        {teams.map((team) => (
          <article className="entity-card" key={team.id}>
            <div><strong>{team.name}</strong><StatusBadge status={team.isActive ? "ACTIVE" : "INACTIVE"} /></div>
            <p>{team.venueName || "No venue"}<br />{team.contactEmail || ""}</p>
            <div className="row-actions">
              <button className="button button--secondary" onClick={() => setEditing(team)} type="button">Edit</button>
              <button className="danger-button" onClick={async () => {
                if (!window.confirm(`Delete ${team.name}?`)) return;
                try {
                  await api.delete(`/teams/${team.id}`);
                  show("Team deleted");
                  request.reload();
                } catch (error) {
                  show(error.message, "error");
                }
              }} type="button">Delete</button>
            </div>
          </article>
        ))}
      </div>
      {editing ? <TeamEditor leagueId={leagueId} team={editing.id ? editing : null}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); request.reload(); }} /> : null}
    </>
  );
}

function TeamEditor({ leagueId, team, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: team?.name || "", shortName: team?.shortName || "", slug: team?.slug || "",
    venueName: team?.venueName || "", venueAddress: team?.venueAddress || "",
    contactEmail: team?.contactEmail || "", contactPhone: team?.contactPhone || "",
    isActive: team?.isActive ?? true
  });
  const [error, setError] = useState("");
  const { show } = useToast();
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (team) await api.patch(`/teams/${team.id}`, form);
      else await api.post(`/leagues/${leagueId}/teams`, form);
      show(team ? "Team updated" : "Team created");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return <Modal title={team ? "Edit team" : "Create team"} onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <FormError message={error} />
      <TextField label="Name" required value={form.name} onChange={(name) => setForm({ ...form, name, slug: form.slug || slugify(name) })} />
      <div className="form-row"><TextField label="Short name" value={form.shortName} onChange={(shortName) => setForm({ ...form, shortName })} />
        <TextField label="Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} /></div>
      <TextField label="Venue name" value={form.venueName} onChange={(venueName) => setForm({ ...form, venueName })} />
      <TextAreaField label="Venue address" rows="3" value={form.venueAddress} onChange={(venueAddress) => setForm({ ...form, venueAddress })} />
      <div className="form-row"><TextField label="Email" type="email" value={form.contactEmail} onChange={(contactEmail) => setForm({ ...form, contactEmail })} />
        <TextField label="Phone" value={form.contactPhone} onChange={(contactPhone) => setForm({ ...form, contactPhone })} /></div>
      <CheckboxField label="Active" checked={form.isActive} onChange={(isActive) => setForm({ ...form, isActive })} />
      <div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
        <button className="button" type="submit">Save team</button></div>
    </form>
  </Modal>;
}

export function PlayerDirectoryPage() {
  const { leagueId } = useParams();
  const request = useApi(() => api.get(`/leagues/${leagueId}/players?includeInactive=true`), [leagueId]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);

  if (request.loading) return <Loading label="Loading players" />;
  if (request.error) return <ErrorState error={request.error} />;

  const players = collection(request.data, "players").filter((player) =>
    `${player.displayName || ""} ${player.firstName || ""} ${player.lastName || ""}`
      .toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <PageHeader title="Player directory" description="Player identities, contact details and discipline records."
        actions={<button className="button" onClick={() => setEditing({})} type="button">Create player</button>} />
      <LeagueTabs />
      <div className="toolbar"><input placeholder="Search players" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <div className="card-grid">
        {players.map((player) => (
          <article className="entity-card" key={player.id}>
            <div><strong>{player.displayName || `${player.firstName} ${player.lastName}`}</strong>
              <StatusBadge status={player.isActive ? "ACTIVE" : "INACTIVE"} /></div>
            <p>{player.email || "No email"}<br />{player.phone || "No phone"}</p>
            <div className="row-actions">
              <Link className="button button--secondary" to={`players/${player.id}`}>Open</Link>
              <button className="button button--secondary" onClick={() => setEditing(player)} type="button">Edit</button>
            </div>
          </article>
        ))}
      </div>
      {editing ? <PlayerEditor leagueId={leagueId} player={editing.id ? editing : null}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); request.reload(); }} /> : null}
    </>
  );
}

function PlayerEditor({ leagueId, player, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: player?.firstName || "", lastName: player?.lastName || "",
    displayName: player?.displayName || "", email: player?.email || "",
    phone: player?.phone || "", dateOfBirth: player?.dateOfBirth || "",
    isActive: player?.isActive ?? true
  });
  const [error, setError] = useState("");
  const { show } = useToast();
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = { ...form, dateOfBirth: form.dateOfBirth || null };
      if (player) await api.patch(`/players/${player.id}`, payload);
      else await api.post(`/leagues/${leagueId}/players`, payload);
      show(player ? "Player updated" : "Player created");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return <Modal title={player ? "Edit player" : "Create player"} onClose={onClose}>
    <form className="form-stack" onSubmit={submit}>
      <FormError message={error} />
      <div className="form-row"><TextField label="First name" required value={form.firstName} onChange={(firstName) => setForm({ ...form, firstName })} />
        <TextField label="Last name" required value={form.lastName} onChange={(lastName) => setForm({ ...form, lastName })} /></div>
      <TextField label="Display name" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} />
      <div className="form-row"><TextField label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <TextField label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} /></div>
      <TextField label="Date of birth" type="date" value={form.dateOfBirth} onChange={(dateOfBirth) => setForm({ ...form, dateOfBirth })} />
      <CheckboxField label="Active" checked={form.isActive} onChange={(isActive) => setForm({ ...form, isActive })} />
      <div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
        <button className="button" type="submit">Save player</button></div>
    </form>
  </Modal>;
}

export function PlayerWorkspacePage() {
  const { playerId } = useParams();
  const player = useApi(() => api.get(`/players/${playerId}`), [playerId]);
  const sanctions = useApi(() => api.get(`/players/${playerId}/sanctions?includeInactive=true`), [playerId]);
  const handicaps = useApi(() => api.get(`/players/${playerId}/handicaps`), [playerId]);
  const transfers = useApi(() => api.get(`/players/${playerId}/transfers`), [playerId]);
  const [sanctionOpen, setSanctionOpen] = useState(false);
  const [handicapOpen, setHandicapOpen] = useState(false);
  const { show } = useToast();

  if (player.loading || sanctions.loading || handicaps.loading || transfers.loading) return <Loading label="Loading player" />;
  const error = player.error || sanctions.error || handicaps.error || transfers.error;
  if (error) return <ErrorState error={error} />;

  const person = entity(player.data, "player");
  const sanctionRows = collection(sanctions.data, "sanctions");
  const handicapRows = collection(handicaps.data, "handicaps");
  const transferRows = collection(transfers.data, "transfers");

  return (
    <>
      <PageHeader title={person.displayName || `${person.firstName} ${person.lastName}`}
        description={[person.email, person.phone].filter(Boolean).join(" · ")}
        actions={<StatusBadge status={person.isActive ? "ACTIVE" : "INACTIVE"} />} />
      <div className="two-column">
        <Section title="Sanctions" action={<button className="button button--secondary" onClick={() => setSanctionOpen(true)} type="button">Issue sanction</button>}>
          {sanctionRows.length ? <div className="management-list">{sanctionRows.map((sanction) => (
            <article className="mini-record" key={sanction.id}>
              <div><strong>{sanction.type}</strong><StatusBadge status={sanction.status} /></div>
              <p>{sanction.reason}</p><small>{formatDate(sanction.startsOn)} – {sanction.endsOn ? formatDate(sanction.endsOn) : "open-ended"}</small>
              {sanction.status === "ACTIVE" ? <button className="danger-link" onClick={async () => {
                const reason = window.prompt("Revocation reason");
                if (!reason) return;
                try {
                  await api.post(`/player-sanctions/${sanction.id}/revoke`, { reason });
                  show("Sanction revoked");
                  sanctions.reload();
                } catch (requestError) {
                  show(requestError.message, "error");
                }
              }} type="button">Revoke</button> : null}
            </article>
          ))}</div> : <EmptyState title="No sanctions" message="This player has no discipline history." />}
        </Section>
        <Section title="Handicaps" action={<button className="button button--secondary" onClick={() => setHandicapOpen(true)} type="button">Add handicap</button>}>
          {handicapRows.length ? <div className="management-list">{handicapRows.map((handicap) => (
            <article className="mini-record" key={handicap.id}><div><strong>{handicap.value}</strong><StatusBadge status={handicap.source} /></div>
              <small>{formatDate(handicap.effectiveFrom)} – {handicap.effectiveUntil ? formatDate(handicap.effectiveUntil) : "current"}</small></article>
          ))}</div> : <EmptyState title="No handicaps" message="No player handicap records have been entered." />}
        </Section>
      </div>
      <Section title="Transfer history">
        {transferRows.length ? <div className="table-scroll"><table><thead><tr><th>Date</th><th>From</th><th>To</th><th>Reason</th></tr></thead>
          <tbody>{transferRows.map((row) => <tr key={row.id}><td>{formatDate(row.effectiveDate)}</td>
            <td>{row.fromSeasonTeam?.team?.name || row.fromSeasonTeamId}</td><td>{row.toSeasonTeam?.team?.name || row.toSeasonTeamId}</td><td>{row.reason || "—"}</td></tr>)}</tbody></table></div>
          : <EmptyState title="No transfers" message="This player has no recorded transfers." />}
      </Section>
      {sanctionOpen ? <SanctionModal playerId={playerId} onClose={() => setSanctionOpen(false)}
        onSaved={() => { setSanctionOpen(false); sanctions.reload(); }} /> : null}
      {handicapOpen ? <HandicapModal playerId={playerId} onClose={() => setHandicapOpen(false)}
        onSaved={() => { setHandicapOpen(false); handicaps.reload(); }} /> : null}
    </>
  );
}

function SanctionModal({ playerId, onClose, onSaved }) {
  const [form, setForm] = useState({
    seasonId: "", type: "WARNING", reason: "", startsOn: toDateInput(new Date()),
    endsOn: "", preventsMatchPlay: false
  });
  const [error, setError] = useState("");
  const { show } = useToast();
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/players/${playerId}/sanctions`, {
        ...form, seasonId: form.seasonId || null, endsOn: form.endsOn || null
      });
      show("Sanction issued");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return <Modal title="Issue sanction" onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <FormError message={error} />
    <SelectField label="Type" value={form.type} onChange={(type) => setForm({
      ...form, type, preventsMatchPlay: type !== "WARNING"
    })}>
      {["WARNING", "DATE_SUSPENSION", "SEASON_SUSPENSION", "INDEFINITE_SUSPENSION", "OTHER"].map((type) =>
        <option key={type} value={type}>{type}</option>)}
    </SelectField>
    <TextField label="Season ID (optional)" value={form.seasonId} onChange={(seasonId) => setForm({ ...form, seasonId })} />
    <div className="form-row"><TextField label="Starts on" required type="date" value={form.startsOn} onChange={(startsOn) => setForm({ ...form, startsOn })} />
      <TextField label="Ends on" type="date" value={form.endsOn} onChange={(endsOn) => setForm({ ...form, endsOn })} /></div>
    <TextAreaField label="Reason" required rows="4" value={form.reason} onChange={(reason) => setForm({ ...form, reason })} />
    <CheckboxField label="Prevents match play" checked={form.preventsMatchPlay}
      onChange={(preventsMatchPlay) => setForm({ ...form, preventsMatchPlay })} />
    <div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
      <button className="button" type="submit">Issue sanction</button></div>
  </form></Modal>;
}

function HandicapModal({ playerId, onClose, onSaved }) {
  const [form, setForm] = useState({
    seasonId: "", value: 0, source: "MANUAL", effectiveFrom: toDateInput(new Date()),
    effectiveUntil: "", notes: ""
  });
  const [error, setError] = useState("");
  const { show } = useToast();
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/players/${playerId}/handicaps`, {
        ...form, seasonId: form.seasonId || null, value: Number(form.value),
        effectiveUntil: form.effectiveUntil || null
      });
      show("Handicap added");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return <Modal title="Add player handicap" onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <FormError message={error} />
    <div className="form-row"><TextField label="Value" step="0.01" type="number" value={form.value} onChange={(value) => setForm({ ...form, value })} />
      <SelectField label="Source" value={form.source} onChange={(source) => setForm({ ...form, source })}>
        <option value="MANUAL">Manual</option><option value="IMPORTED">Imported</option>
      </SelectField></div>
    <TextField label="Season ID (optional)" value={form.seasonId} onChange={(seasonId) => setForm({ ...form, seasonId })} />
    <div className="form-row"><TextField label="Effective from" required type="date" value={form.effectiveFrom} onChange={(effectiveFrom) => setForm({ ...form, effectiveFrom })} />
      <TextField label="Effective until" type="date" value={form.effectiveUntil} onChange={(effectiveUntil) => setForm({ ...form, effectiveUntil })} /></div>
    <TextAreaField label="Notes" rows="3" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
    <div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
      <button className="button" type="submit">Add handicap</button></div>
  </form></Modal>;
}

export function MatchFormatsPage() {
  const { leagueId } = useParams();
  const request = useApi(() => api.get(`/leagues/${leagueId}/match-formats`), [leagueId]);
  const [editing, setEditing] = useState(null);

  if (request.loading) return <Loading label="Loading match formats" />;
  if (request.error) return <ErrorState error={request.error} />;
  const formats = collection(request.data, "matchFormats");

  return (
    <>
      <PageHeader title="Match formats" description="Define frame counts and scoring rules."
        actions={<button className="button" onClick={() => setEditing({})} type="button">Create format</button>} />
      <LeagueTabs />
      <div className="card-grid">{formats.map((format) => (
        <article className="entity-card" key={format.id}><div><strong>{format.name}</strong>
          {format.isDefault ? <span className="badge badge--approved">DEFAULT</span> : <StatusBadge status={format.isActive ? "ACTIVE" : "INACTIVE"} />}</div>
          <p>{format.framesPerMatch} frames · {format.scoringMethod}</p>
          <button className="button button--secondary" onClick={() => setEditing(format)} type="button">Edit</button>
        </article>
      ))}</div>
      {editing ? <MatchFormatEditor leagueId={leagueId} format={editing.id ? editing : null}
        onClose={() => setEditing(null)} onSaved={() => { setEditing(null); request.reload(); }} /> : null}
    </>
  );
}

function MatchFormatEditor({ leagueId, format, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: format?.name || "", framesPerMatch: format?.framesPerMatch || 12,
    scoringMethod: format?.scoringMethod || "MATCH_RESULT",
    pointsPerFrame: format?.pointsPerFrame ?? 1, winPoints: format?.winPoints ?? 2,
    drawPoints: format?.drawPoints ?? 1, lossPoints: format?.lossPoints ?? 0,
    isDefault: format?.isDefault ?? false, isActive: format?.isActive ?? true
  });
  const [error, setError] = useState("");
  const { show } = useToast();
  async function submit(event) {
    event.preventDefault();
    setError("");
    const payload = {
      ...form, framesPerMatch: Number(form.framesPerMatch),
      pointsPerFrame: form.scoringMethod === "FRAME_POINTS" ? Number(form.pointsPerFrame) : null,
      winPoints: form.scoringMethod === "MATCH_RESULT" ? Number(form.winPoints) : null,
      drawPoints: form.scoringMethod === "MATCH_RESULT" ? Number(form.drawPoints) : null,
      lossPoints: form.scoringMethod === "MATCH_RESULT" ? Number(form.lossPoints) : null
    };
    try {
      if (format) await api.patch(`/match-formats/${format.id}`, payload);
      else await api.post(`/leagues/${leagueId}/match-formats`, payload);
      show("Match format saved");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return <Modal title={format ? "Edit match format" : "Create match format"} onClose={onClose}>
    <form className="form-stack" onSubmit={submit}><FormError message={error} />
      <TextField label="Name" required value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <div className="form-row"><TextField label="Frames per match" min="1" type="number" value={form.framesPerMatch}
        onChange={(framesPerMatch) => setForm({ ...form, framesPerMatch })} />
        <SelectField label="Scoring method" value={form.scoringMethod} onChange={(scoringMethod) => setForm({ ...form, scoringMethod })}>
          <option value="MATCH_RESULT">Match result</option><option value="FRAME_POINTS">Frame points</option>
        </SelectField></div>
      {form.scoringMethod === "FRAME_POINTS" ? <TextField label="Points per frame" step="0.01" type="number"
        value={form.pointsPerFrame} onChange={(pointsPerFrame) => setForm({ ...form, pointsPerFrame })} /> :
        <div className="form-row three"><TextField label="Win points" step="0.01" type="number" value={form.winPoints}
          onChange={(winPoints) => setForm({ ...form, winPoints })} />
          <TextField label="Draw points" step="0.01" type="number" value={form.drawPoints}
          onChange={(drawPoints) => setForm({ ...form, drawPoints })} />
          <TextField label="Loss points" step="0.01" type="number" value={form.lossPoints}
          onChange={(lossPoints) => setForm({ ...form, lossPoints })} /></div>}
      <CheckboxField label="Default format" checked={form.isDefault} onChange={(isDefault) => setForm({ ...form, isDefault })} />
      <CheckboxField label="Active" checked={form.isActive} onChange={(isActive) => setForm({ ...form, isActive })} />
      <div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
        <button className="button" type="submit">Save format</button></div>
    </form>
  </Modal>;
}

export function ReportsPage() {
  const { seasonId } = useParams();
  const [type, setType] = useState("standings");
  const [status, setStatus] = useState("");
  const request = useApi(
    () => api.get(`/seasons/${seasonId}/reports/${type}${status ? `?status=${status}` : ""}`),
    [seasonId, type, status]
  );

  if (request.loading) return <Loading label="Generating report" />;
  if (request.error) return <ErrorState error={request.error} />;

  const rows = collection(request.data, type, "rows", "fixtures", "results", "standings");
  const headers = rows[0] ? Object.keys(rows[0]).filter((key) => typeof rows[0][key] !== "object") : [];

  return (
    <>
      <PageHeader title="Reports" description="Operational reports with JSON views and CSV export." actions={
        <a className="button" href={`${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/seasons/${seasonId}/reports/${type}?format=csv${status ? `&status=${status}` : ""}`}>
          Export CSV
        </a>
      } />
      <SeasonTabs />
      <div className="toolbar">
        <SelectField label="Report" value={type} onChange={setType}>
          <option value="fixtures">Fixtures</option><option value="results">Results</option><option value="standings">Standings</option>
        </SelectField>
        {type !== "standings" ? <SelectField label="Status" value={status} onChange={setStatus}>
          <option value="">All statuses</option>
          {["SCHEDULED", "POSTPONED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((item) =>
            <option key={item} value={item}>{item}</option>)}
        </SelectField> : null}
      </div>
      <Section title={`${rows.length} rows`}>
        {rows.length ? <div className="table-scroll"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={row.id || index}>{headers.map((header) => <td key={header}>{String(row[header] ?? "")}</td>)}</tr>)}</tbody></table></div>
          : <EmptyState title="No report data" message="No records match the current filters." />}
      </Section>
    </>
  );
}

export function HandicapCalculatorPage() {
  const { seasonId } = useParams();
  const [kind, setKind] = useState("players");
  const [form, setForm] = useState({
    minimumFrames: 5, minimumMatches: 3, baseValue: 0, scale: 1,
    lowerBound: -10, upperBound: 10, effectiveFrom: toDateInput(new Date()), apply: false
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { show } = useToast();

  async function calculate(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) =>
        [key, typeof value === "boolean" || key === "effectiveFrom" ? value : Number(value)]));
      const data = await api.post(`/seasons/${seasonId}/handicaps/${kind}/calculate`, payload);
      setResult(data);
      show(form.apply ? "Handicaps applied" : "Recommendations calculated");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const recommendations = collection(result, "recommendations", "players", "teams");
  return (
    <>
      <PageHeader title="Handicap calculator" description="Preview or apply automatic handicap recommendations." />
      <SeasonTabs />
      <Section title="Calculation settings">
        <form className="form-stack" onSubmit={calculate}>
          <FormError message={error} />
          <SelectField label="Calculate for" value={kind} onChange={setKind}>
            <option value="players">Players</option><option value="teams">Teams</option>
          </SelectField>
          <div className="form-row three">
            <TextField label="Minimum frames" type="number" value={form.minimumFrames} onChange={(minimumFrames) => setForm({ ...form, minimumFrames })} />
            <TextField label="Minimum matches" type="number" value={form.minimumMatches} onChange={(minimumMatches) => setForm({ ...form, minimumMatches })} />
            <TextField label="Base value" type="number" value={form.baseValue} onChange={(baseValue) => setForm({ ...form, baseValue })} />
          </div>
          <div className="form-row three">
            <TextField label="Scale" step="0.1" type="number" value={form.scale} onChange={(scale) => setForm({ ...form, scale })} />
            <TextField label="Lower bound" type="number" value={form.lowerBound} onChange={(lowerBound) => setForm({ ...form, lowerBound })} />
            <TextField label="Upper bound" type="number" value={form.upperBound} onChange={(upperBound) => setForm({ ...form, upperBound })} />
          </div>
          <TextField label="Effective from" type="date" value={form.effectiveFrom} onChange={(effectiveFrom) => setForm({ ...form, effectiveFrom })} />
          <CheckboxField label="Apply recommendations immediately" checked={form.apply}
            description="Leave disabled to preview without writing records."
            onChange={(apply) => setForm({ ...form, apply })} />
          <button className="button" type="submit">{form.apply ? "Calculate and apply" : "Preview recommendations"}</button>
        </form>
      </Section>
      {result ? <Section title="Recommendations">
        {recommendations.length ? <div className="table-scroll"><table><thead><tr><th>Name</th><th>Participation</th><th>Performance</th><th>Recommended</th></tr></thead>
          <tbody>{recommendations.map((row, index) => <tr key={row.playerId || row.seasonTeamId || index}>
            <td>{row.displayName || row.teamName || row.playerId || row.seasonTeamId}</td>
            <td>{row.framesPlayed ?? row.matchesPlayed ?? "—"}</td><td>{row.winPercentage ?? row.performance ?? "—"}</td>
            <td><strong>{row.recommendedValue ?? row.value}</strong></td></tr>)}</tbody></table></div>
          : <EmptyState title="No recommendations" message="No eligible records met the participation thresholds." />}
      </Section> : null}
    </>
  );
}

export function TransitionPlansPage() {
  const { leagueId, seasonId } = useParams();
  const plans = useApi(() => api.get(`/seasons/${seasonId}/transitions`), [seasonId]);
  const seasons = useApi(() => api.get(`/leagues/${leagueId}/seasons`), [leagueId]);
  const [creating, setCreating] = useState(false);

  if (plans.loading || seasons.loading) return <Loading label="Loading transition plans" />;
  const error = plans.error || seasons.error;
  if (error) return <ErrorState error={error} />;

  const rows = collection(plans.data, "plans");
  const seasonRows = collection(seasons.data, "seasons").filter((season) => season.id !== seasonId);

  return (
    <>
      <PageHeader title="Season transitions" description="Generate and approve promotion and relegation placements."
        actions={<button className="button" onClick={() => setCreating(true)} type="button">Generate plan</button>} />
      <SeasonTabs />
      <div className="card-grid">
        {rows.map((plan) => <Link className="entity-card" key={plan.id} to={`plans/${plan.id}`}>
          <div><strong>Transition plan</strong><StatusBadge status={plan.status} /></div>
          <p>Target season: {plan.targetSeasonId}</p><small>{formatDateTime(plan.createdAt)}</small>
        </Link>)}
      </div>
      {!rows.length ? <EmptyState title="No plans" message="Generate a draft after the standings are ready." /> : null}
      {creating ? <CreateTransitionModal seasonId={seasonId} seasons={seasonRows}
        onClose={() => setCreating(false)} onSaved={() => { setCreating(false); plans.reload(); }} /> : null}
    </>
  );
}

function CreateTransitionModal({ seasonId, seasons, onClose, onSaved }) {
  const [form, setForm] = useState({ targetSeasonId: seasons[0]?.id || "", notes: "" });
  const [error, setError] = useState("");
  const { show } = useToast();
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/seasons/${seasonId}/transitions`, form);
      show("Transition plan generated");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return <Modal title="Generate transition plan" onClose={onClose}><form className="form-stack" onSubmit={submit}>
    <FormError message={error} />
    <SelectField label="Target season" value={form.targetSeasonId} onChange={(targetSeasonId) => setForm({ ...form, targetSeasonId })}>
      {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
    </SelectField>
    <TextAreaField label="Notes" rows="4" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
    <div className="form-actions"><button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
      <button className="button" disabled={!seasons.length} type="submit">Generate plan</button></div>
  </form></Modal>;
}

export function TransitionPlanWorkspacePage() {
  const { planId } = useParams();
  const request = useApi(() => api.get(`/season-transition-plans/${planId}`), [planId]);
  const { show } = useToast();

  if (request.loading) return <Loading label="Loading transition plan" />;
  if (request.error) return <ErrorState error={request.error} />;

  const plan = entity(request.data, "plan");
  const entries = plan.entries || [];
  return (
    <>
      <PageHeader title="Transition plan" description={`Source ${plan.sourceSeasonId} → Target ${plan.targetSeasonId}`}
        actions={<StatusBadge status={plan.status} />} />
      <Section title={`${entries.length} placements`} action={
        <div className="row-actions">
          {plan.status === "DRAFT" ? <button className="button" onClick={async () => {
            try {
              await api.post(`/season-transition-plans/${plan.id}/approve`, { reason: "Approved in SwiftPool UI" });
              show("Plan approved"); request.reload();
            } catch (error) { show(error.message, "error"); }
          }} type="button">Approve</button> : null}
          {plan.status === "APPROVED" ? <button className="button" onClick={async () => {
            if (!window.confirm("Apply all placements to the target season?")) return;
            try {
              await api.post(`/season-transition-plans/${plan.id}/apply`, { reason: "Applied in SwiftPool UI" });
              show("Plan applied"); request.reload();
            } catch (error) { show(error.message, "error"); }
          }} type="button">Apply</button> : null}
          {!["APPLIED", "CANCELLED"].includes(plan.status) ? <button className="danger-button" onClick={async () => {
            try {
              await api.post(`/season-transition-plans/${plan.id}/cancel`, { reason: "Cancelled in SwiftPool UI" });
              show("Plan cancelled"); request.reload();
            } catch (error) { show(error.message, "error"); }
          }} type="button">Cancel</button> : null}
        </div>
      }>
        <div className="table-scroll"><table><thead><tr><th>Position</th><th>Team</th><th>Action</th><th>Source</th><th>Target</th><th>Seed</th></tr></thead>
          <tbody>{entries.map((entry) => <tr key={entry.id}><td>{entry.sourcePosition}</td>
            <td><strong>{entry.team?.name || entry.teamId}</strong></td><td><StatusBadge status={entry.action} /></td>
            <td>{entry.sourceDivision?.name || "—"}</td><td>{entry.targetDivision?.name || "Unassigned"}</td><td>{entry.seed || "—"}</td></tr>)}</tbody>
        </table></div>
      </Section>
    </>
  );
}
