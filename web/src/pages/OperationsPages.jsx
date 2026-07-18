import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import {
  collection,
  entity,
  formatDate,
  formatDateTime,
  slugify,
  toDateInput,
  toDateTimeInput
} from "../lib/data.js";
import { useApi } from "../hooks/useApi.js";
import { useToast } from "../context/ToastContext.jsx";
import { SeasonTabs } from "../components/SeasonTabs.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import {
  CheckboxField,
  FormError,
  SelectField,
  TextAreaField,
  TextField
} from "../components/FormFields.jsx";
import {
  EmptyState,
  ErrorState,
  Loading,
  Modal,
  PageHeader,
  Section,
  StatusBadge
} from "../components/ui.jsx";

export function DivisionManagementPage() {
  const { seasonId } = useParams();
  const request = useApi(() => api.get(`/seasons/${seasonId}/divisions`), [seasonId]);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const { show } = useToast();

  if (request.loading) return <Loading label="Loading divisions" />;
  if (request.error) return <ErrorState error={request.error} onRetry={request.reload} />;

  const divisions = collection(request.data, "divisions");

  async function move(index, amount) {
    const next = index + amount;
    if (next < 0 || next >= divisions.length) return;
    const reordered = [...divisions];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    try {
      await api.put(`/seasons/${seasonId}/divisions/order`, {
        divisionIds: reordered.map((item) => item.id)
      });
      show("Division order updated");
      await request.reload();
    } catch (error) {
      show(error.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Divisions"
        description="Configure the competition structure and promotion or relegation rules."
        actions={<button className="button" onClick={() => setEditing({})} type="button">Add division</button>}
      />
      <SeasonTabs />
      <Section title="Season structure">
        {divisions.length ? (
          <div className="management-list">
            {divisions.map((division, index) => (
              <article className="management-row" key={division.id}>
                <div className="position-controls">
                  <button disabled={index === 0} onClick={() => move(index, -1)} type="button">↑</button>
                  <strong>{index + 1}</strong>
                  <button disabled={index === divisions.length - 1} onClick={() => move(index, 1)} type="button">↓</button>
                </div>
                <div className="management-main">
                  <div><strong>{division.name}</strong><StatusBadge status={division.isActive === false ? "INACTIVE" : "ACTIVE"} /></div>
                  <small>Promote {division.promotionPlaces || 0} · Relegate {division.relegationPlaces || 0}</small>
                </div>
                <div className="row-actions">
                  <button className="button button--secondary" onClick={() => setEditing(division)} type="button">Edit</button>
                  <button className="danger-button" onClick={() => setDeleting(division)} type="button">Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="No divisions" message="Create a division before registering teams." />}
      </Section>
      {editing ? (
        <DivisionModal
          division={editing.id ? editing : null}
          seasonId={seasonId}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); request.reload(); }}
        />
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title="Delete division"
          message={`Delete ${deleting.name}? This is only allowed when no protected historical data depends on it.`}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await api.delete(`/divisions/${deleting.id}`);
              show("Division deleted");
              setDeleting(null);
              request.reload();
            } catch (error) {
              show(error.message, "error");
            }
          }}
        />
      ) : null}
    </>
  );
}

function DivisionModal({ division, seasonId, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: division?.name || "",
    slug: division?.slug || "",
    promotionPlaces: division?.promotionPlaces ?? 0,
    relegationPlaces: division?.relegationPlaces ?? 0,
    isActive: division?.isActive ?? true,
    notes: division?.notes || ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        promotionPlaces: Number(form.promotionPlaces),
        relegationPlaces: Number(form.relegationPlaces)
      };
      if (division) {
        await api.patch(`/divisions/${division.id}`, payload);
        show("Division updated");
      } else {
        await api.post(`/seasons/${seasonId}/divisions`, payload);
        show("Division created");
      }
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={division ? "Edit division" : "Create division"} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        <TextField label="Name" required value={form.name} onChange={(name) => setForm({
          ...form, name, slug: form.slug || slugify(name)
        })} />
        <TextField label="Slug" required value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
        <div className="form-row">
          <TextField label="Promotion places" min="0" type="number" value={form.promotionPlaces}
            onChange={(promotionPlaces) => setForm({ ...form, promotionPlaces })} />
          <TextField label="Relegation places" min="0" type="number" value={form.relegationPlaces}
            onChange={(relegationPlaces) => setForm({ ...form, relegationPlaces })} />
        </div>
        <TextAreaField label="Notes" rows="4" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
        <CheckboxField label="Active division" checked={form.isActive} onChange={(isActive) => setForm({ ...form, isActive })} />
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" disabled={saving} type="submit">{saving ? "Saving…" : "Save division"}</button>
        </div>
      </form>
    </Modal>
  );
}

export function TeamRegistrationPage() {
  const { leagueId, seasonId } = useParams();
  const seasonTeams = useApi(() => api.get(`/seasons/${seasonId}/teams`), [seasonId]);
  const leagueTeams = useApi(() => api.get(`/leagues/${leagueId}/teams?includeInactive=true`), [leagueId]);
  const divisions = useApi(() => api.get(`/seasons/${seasonId}/divisions`), [seasonId]);
  const [registering, setRegistering] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const { show } = useToast();

  if (seasonTeams.loading || leagueTeams.loading || divisions.loading) return <Loading label="Loading teams" />;
  const error = seasonTeams.error || leagueTeams.error || divisions.error;
  if (error) return <ErrorState error={error} />;

  const registrations = collection(seasonTeams.data, "seasonTeams", "teams");
  const teams = collection(leagueTeams.data, "teams");
  const divisionRows = collection(divisions.data, "divisions");
  const registeredIds = new Set(registrations.map((row) => row.teamId || row.team?.id));
  const available = teams.filter((team) => !registeredIds.has(team.id));

  async function update(entry, patch) {
    try {
      await api.patch(`/season-teams/${entry.id}`, patch);
      show("Registration updated");
      seasonTeams.reload();
    } catch (requestError) {
      show(requestError.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Season teams"
        description="Register reusable league teams, assign divisions and manage rosters."
        actions={
          <>
            <button className="button button--secondary" onClick={() => setCreatingTeam(true)} type="button">Create league team</button>
            <button className="button" onClick={() => setRegistering(true)} type="button">Register team</button>
          </>
        }
      />
      <SeasonTabs />
      <Section title={`${registrations.length} registrations`}>
        {registrations.length ? (
          <div className="management-list">
            {registrations.map((entry) => (
              <article className="management-row management-row--wide" key={entry.id}>
                <div className="management-main">
                  <div><strong>{entry.team?.name || entry.teamName}</strong><StatusBadge status={entry.status} /></div>
                  <small>{entry.team?.venueName || "Venue not set"}</small>
                </div>
                <SelectField label="Division" value={entry.divisionId || entry.division?.id || ""}
                  onChange={(divisionId) => update(entry, { divisionId: divisionId || null })}>
                  <option value="">Unassigned</option>
                  {divisionRows.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
                </SelectField>
                <SelectField label="Status" value={entry.status} onChange={(status) => update(entry, { status })}>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </SelectField>
                <div className="row-actions">
                  <Link className="button button--secondary" to={`rosters/${entry.id}`}>Roster</Link>
                  <button className="danger-button" onClick={async () => {
                    if (!window.confirm("Remove this team from the season?")) return;
                    try {
                      await api.delete(`/season-teams/${entry.id}`);
                      show("Team removed");
                      seasonTeams.reload();
                    } catch (requestError) {
                      show(requestError.message, "error");
                    }
                  }} type="button">Remove</button>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="No registered teams" message="Register a league team into this season." />}
      </Section>
      {registering ? (
        <RegisterTeamModal
          available={available}
          divisions={divisionRows}
          seasonId={seasonId}
          onClose={() => setRegistering(false)}
          onSaved={() => { setRegistering(false); seasonTeams.reload(); }}
        />
      ) : null}
      {creatingTeam ? (
        <CreateTeamModal
          leagueId={leagueId}
          onClose={() => setCreatingTeam(false)}
          onSaved={() => { setCreatingTeam(false); leagueTeams.reload(); }}
        />
      ) : null}
    </>
  );
}

function CreateTeamModal({ leagueId, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "", shortName: "", slug: "", venueName: "", venueAddress: "",
    contactEmail: "", contactPhone: "", isActive: true
  });
  const [error, setError] = useState("");
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/leagues/${leagueId}/teams`, form);
      show("League team created");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title="Create league team" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        <TextField label="Team name" required value={form.name} onChange={(name) => setForm({
          ...form, name, slug: form.slug || slugify(name)
        })} />
        <div className="form-row">
          <TextField label="Short name" value={form.shortName} onChange={(shortName) => setForm({ ...form, shortName })} />
          <TextField label="Slug" value={form.slug} onChange={(slug) => setForm({ ...form, slug })} />
        </div>
        <TextField label="Venue name" value={form.venueName} onChange={(venueName) => setForm({ ...form, venueName })} />
        <TextAreaField label="Venue address" rows="3" value={form.venueAddress} onChange={(venueAddress) => setForm({ ...form, venueAddress })} />
        <div className="form-row">
          <TextField label="Contact email" type="email" value={form.contactEmail} onChange={(contactEmail) => setForm({ ...form, contactEmail })} />
          <TextField label="Contact phone" value={form.contactPhone} onChange={(contactPhone) => setForm({ ...form, contactPhone })} />
        </div>
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" type="submit">Create team</button>
        </div>
      </form>
    </Modal>
  );
}

function RegisterTeamModal({ available, divisions, seasonId, onClose, onSaved }) {
  const [form, setForm] = useState({
    teamId: available[0]?.id || "", divisionId: "", status: "APPROVED",
    seed: "", pointsAdjustment: 0, adjustmentReason: ""
  });
  const [error, setError] = useState("");
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/seasons/${seasonId}/teams`, {
        ...form,
        divisionId: form.divisionId || null,
        seed: form.seed ? Number(form.seed) : null,
        pointsAdjustment: Number(form.pointsAdjustment)
      });
      show("Team registered");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title="Register team" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        {available.length ? (
          <>
            <SelectField label="League team" required value={form.teamId} onChange={(teamId) => setForm({ ...form, teamId })}>
              {available.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </SelectField>
            <SelectField label="Division" value={form.divisionId} onChange={(divisionId) => setForm({ ...form, divisionId })}>
              <option value="">Unassigned</option>
              {divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
            </SelectField>
            <div className="form-row">
              <SelectField label="Status" value={form.status} onChange={(status) => setForm({ ...form, status })}>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </SelectField>
              <TextField label="Seed" min="1" type="number" value={form.seed} onChange={(seed) => setForm({ ...form, seed })} />
            </div>
            <TextField label="Points adjustment" step="0.01" type="number" value={form.pointsAdjustment}
              onChange={(pointsAdjustment) => setForm({ ...form, pointsAdjustment })} />
            {Number(form.pointsAdjustment) !== 0 ? (
              <TextAreaField label="Adjustment reason" required rows="3" value={form.adjustmentReason}
                onChange={(adjustmentReason) => setForm({ ...form, adjustmentReason })} />
            ) : null}
          </>
        ) : <EmptyState title="No available teams" message="Create another league team first." />}
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" disabled={!available.length} type="submit">Register team</button>
        </div>
      </form>
    </Modal>
  );
}

export function RosterManagementPage() {
  const { leagueId, seasonId, seasonTeamId } = useParams();
  const roster = useApi(() => api.get(`/season-teams/${seasonTeamId}/roster`), [seasonTeamId]);
  const seasonTeam = useApi(() => api.get(`/season-teams/${seasonTeamId}`), [seasonTeamId]);
  const players = useApi(() => api.get(`/leagues/${leagueId}/players?includeInactive=true`), [leagueId]);
  const teams = useApi(() => api.get(`/seasons/${seasonId}/teams`), [seasonId]);
  const [adding, setAdding] = useState(false);
  const [creating, setCreating] = useState(false);
  const { show } = useToast();

  if (roster.loading || seasonTeam.loading || players.loading || teams.loading) return <Loading label="Loading roster" />;
  const error = roster.error || seasonTeam.error || players.error || teams.error;
  if (error) return <ErrorState error={error} />;

  const entries = collection(roster.data, "roster", "players", "rosterEntries");
  const playerRows = collection(players.data, "players");
  const seasonTeamRows = collection(teams.data, "seasonTeams", "teams");
  const current = entity(seasonTeam.data, "seasonTeam");
  const existingIds = new Set(entries.map((entry) => entry.playerId || entry.player?.id));
  const available = playerRows.filter((player) => !existingIds.has(player.id));

  async function patch(entry, payload) {
    try {
      await api.patch(`/roster-entries/${entry.id}`, payload);
      show("Roster updated");
      roster.reload();
    } catch (requestError) {
      show(requestError.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        title={`${current?.team?.name || "Team"} roster`}
        description="Manage eligibility, captaincy, transfers and roster status."
        actions={
          <>
            <button className="button button--secondary" onClick={() => setCreating(true)} type="button">Create player</button>
            <button className="button" onClick={() => setAdding(true)} type="button">Add player</button>
          </>
        }
      />
      <SeasonTabs />
      <Section title={`${entries.length} roster entries`}>
        {entries.length ? (
          <div className="management-list">
            {entries.map((entry) => (
              <article className="management-row management-row--wide" key={entry.id}>
                <div className="management-main">
                  <div><strong>{entry.player?.displayName || `${entry.player?.firstName || ""} ${entry.player?.lastName || ""}`}</strong>
                    {entry.isCaptain ? <span className="badge badge--approved">CAPTAIN</span> : null}
                    <StatusBadge status={entry.status} />
                  </div>
                  <small>Eligible {formatDate(entry.eligibleFrom || entry.joinedAt)} to {entry.eligibleUntil ? formatDate(entry.eligibleUntil) : "open-ended"}</small>
                </div>
                <label className="inline-check">
                  <input checked={Boolean(entry.isCaptain)} type="checkbox"
                    onChange={(event) => patch(entry, { isCaptain: event.target.checked })} />
                  Captain
                </label>
                <SelectField label="Status" value={entry.status} onChange={(status) => patch(entry, { status })}>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="RELEASED">Released</option>
                </SelectField>
                <div className="row-actions">
                  <button className="button button--secondary" onClick={() => {
                    const target = window.prompt("Target season-team ID");
                    const effectiveDate = window.prompt("Effective date (YYYY-MM-DD)", toDateInput(new Date()));
                    if (!target || !effectiveDate) return;
                    api.post(`/roster-entries/${entry.id}/transfer`, {
                      toSeasonTeamId: target,
                      effectiveDate,
                      makeCaptain: false,
                      reason: "Transferred through SwiftPool UI"
                    }).then(() => {
                      show("Player transferred");
                      roster.reload();
                    }).catch((requestError) => show(requestError.message, "error"));
                  }} type="button">Transfer</button>
                  <button className="danger-button" onClick={async () => {
                    if (!window.confirm("Remove this roster entry?")) return;
                    try {
                      await api.delete(`/roster-entries/${entry.id}`);
                      show("Roster entry removed");
                      roster.reload();
                    } catch (requestError) {
                      show(requestError.message, "error");
                    }
                  }} type="button">Remove</button>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState title="Empty roster" message="Add eligible players to this season team." />}
      </Section>
      {adding ? (
        <AddRosterPlayerModal
          available={available}
          seasonTeamId={seasonTeamId}
          onClose={() => setAdding(false)}
          onSaved={() => { setAdding(false); roster.reload(); }}
        />
      ) : null}
      {creating ? (
        <CreatePlayerModal
          leagueId={leagueId}
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); players.reload(); }}
        />
      ) : null}
    </>
  );
}

function CreatePlayerModal({ leagueId, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", displayName: "", email: "", phone: "",
    dateOfBirth: "", isActive: true
  });
  const [error, setError] = useState("");
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/leagues/${leagueId}/players`, {
        ...form,
        displayName: form.displayName || undefined,
        dateOfBirth: form.dateOfBirth || null
      });
      show("Player created");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title="Create player" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        <div className="form-row">
          <TextField label="First name" required value={form.firstName} onChange={(firstName) => setForm({ ...form, firstName })} />
          <TextField label="Last name" required value={form.lastName} onChange={(lastName) => setForm({ ...form, lastName })} />
        </div>
        <TextField label="Display name" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} />
        <div className="form-row">
          <TextField label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <TextField label="Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
        </div>
        <TextField label="Date of birth" type="date" value={form.dateOfBirth} onChange={(dateOfBirth) => setForm({ ...form, dateOfBirth })} />
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" type="submit">Create player</button>
        </div>
      </form>
    </Modal>
  );
}

function AddRosterPlayerModal({ available, seasonTeamId, onClose, onSaved }) {
  const today = toDateInput(new Date());
  const [form, setForm] = useState({
    playerId: available[0]?.id || "", isCaptain: false, joinedAt: today,
    eligibleFrom: today, eligibleUntil: "", shirtNumber: "", notes: ""
  });
  const [error, setError] = useState("");
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/season-teams/${seasonTeamId}/roster`, {
        ...form,
        eligibleUntil: form.eligibleUntil || null,
        shirtNumber: form.shirtNumber ? Number(form.shirtNumber) : null
      });
      show("Player added to roster");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title="Add roster player" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        {available.length ? (
          <>
            <SelectField label="Player" value={form.playerId} onChange={(playerId) => setForm({ ...form, playerId })}>
              {available.map((player) => <option key={player.id} value={player.id}>{player.displayName || `${player.firstName} ${player.lastName}`}</option>)}
            </SelectField>
            <div className="form-row">
              <TextField label="Joined" required type="date" value={form.joinedAt} onChange={(joinedAt) => setForm({ ...form, joinedAt })} />
              <TextField label="Eligible from" required type="date" value={form.eligibleFrom} onChange={(eligibleFrom) => setForm({ ...form, eligibleFrom })} />
            </div>
            <div className="form-row">
              <TextField label="Eligible until" type="date" value={form.eligibleUntil} onChange={(eligibleUntil) => setForm({ ...form, eligibleUntil })} />
              <TextField label="Shirt number" min="1" type="number" value={form.shirtNumber} onChange={(shirtNumber) => setForm({ ...form, shirtNumber })} />
            </div>
            <CheckboxField label="Team captain" checked={form.isCaptain} onChange={(isCaptain) => setForm({ ...form, isCaptain })} />
            <TextAreaField label="Notes" rows="3" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
          </>
        ) : <EmptyState title="No available players" message="Create a new player or release one from another roster." />}
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" disabled={!available.length} type="submit">Add player</button>
        </div>
      </form>
    </Modal>
  );
}

export function FixtureManagementPage() {
  const { leagueId, seasonId } = useParams();
  const matches = useApi(() => api.get(`/seasons/${seasonId}/matches`), [seasonId]);
  const divisions = useApi(() => api.get(`/seasons/${seasonId}/divisions`), [seasonId]);
  const teams = useApi(() => api.get(`/seasons/${seasonId}/teams`), [seasonId]);
  const [manualOpen, setManualOpen] = useState(false);
  const [generateDivision, setGenerateDivision] = useState(null);
  const { show } = useToast();

  if (matches.loading || divisions.loading || teams.loading) return <Loading label="Loading fixtures" />;
  const error = matches.error || divisions.error || teams.error;
  if (error) return <ErrorState error={error} />;

  const matchRows = collection(matches.data, "matches");
  const divisionRows = collection(divisions.data, "divisions");
  const teamRows = collection(teams.data, "seasonTeams", "teams");

  return (
    <>
      <PageHeader
        title="Fixtures"
        description="Generate round-robin schedules, create manual fixtures and manage match status."
        actions={<button className="button" onClick={() => setManualOpen(true)} type="button">Create fixture</button>}
      />
      <SeasonTabs />
      <Section title="Generate fixtures">
        <div className="quick-actions">
          {divisionRows.map((division) => (
            <button className="quick-action" key={division.id} onClick={() => setGenerateDivision(division)} type="button">
              <strong>{division.name}</strong>
              <small>Generate round robin</small>
            </button>
          ))}
        </div>
      </Section>
      <Section title={`${matchRows.length} matches`}>
        {matchRows.length ? (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Date</th><th>Round</th><th>Division</th><th>Home</th><th>Away</th><th>Status</th><th /></tr></thead>
              <tbody>
                {matchRows.map((match) => (
                  <tr key={match.id}>
                    <td>{formatDateTime(match.scheduledAt)}</td>
                    <td>{match.roundNumber}</td>
                    <td>{match.division?.name || "—"}</td>
                    <td>{match.homeSeasonTeam?.team?.name || match.homeTeam?.name || "—"}</td>
                    <td>{match.awaySeasonTeam?.team?.name || match.awayTeam?.name || "—"}</td>
                    <td><StatusBadge status={match.status} /></td>
                    <td className="table-actions">
                      <Link className="text-link" to={`matches/${match.id}`}>Open</Link>
                      <button className="danger-link" onClick={async () => {
                        if (!window.confirm("Delete this fixture?")) return;
                        try {
                          await api.delete(`/matches/${match.id}`);
                          show("Fixture deleted");
                          matches.reload();
                        } catch (requestError) {
                          show(requestError.message, "error");
                        }
                      }} type="button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No fixtures" message="Generate a division schedule or create a manual fixture." />}
      </Section>
      {manualOpen ? (
        <ManualFixtureModal
          divisions={divisionRows}
          seasonId={seasonId}
          teams={teamRows}
          onClose={() => setManualOpen(false)}
          onSaved={() => { setManualOpen(false); matches.reload(); }}
        />
      ) : null}
      {generateDivision ? (
        <GenerateFixturesModal
          division={generateDivision}
          onClose={() => setGenerateDivision(null)}
          onSaved={() => { setGenerateDivision(null); matches.reload(); }}
        />
      ) : null}
    </>
  );
}

function GenerateFixturesModal({ division, onClose, onSaved }) {
  const [form, setForm] = useState({
    startDate: toDateInput(new Date()), kickoffTime: "19:30", intervalDays: 7, replaceExisting: false
  });
  const [error, setError] = useState("");
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const result = await api.post(`/divisions/${division.id}/fixtures/generate`, {
        ...form,
        intervalDays: Number(form.intervalDays)
      });
      show(`${collection(result, "matches", "fixtures").length || "Fixtures"} generated`);
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title={`Generate ${division.name} fixtures`} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        <div className="form-row">
          <TextField label="First match date" required type="date" value={form.startDate}
            onChange={(startDate) => setForm({ ...form, startDate })} />
          <TextField label="Kick-off time" required type="time" value={form.kickoffTime}
            onChange={(kickoffTime) => setForm({ ...form, kickoffTime })} />
        </div>
        <TextField label="Days between rounds" min="1" max="60" type="number" value={form.intervalDays}
          onChange={(intervalDays) => setForm({ ...form, intervalDays })} />
        <CheckboxField label="Replace existing fixtures" checked={form.replaceExisting}
          description="Deletes existing scheduled fixtures in this division before regeneration."
          onChange={(replaceExisting) => setForm({ ...form, replaceExisting })} />
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" type="submit">Generate fixtures</button>
        </div>
      </form>
    </Modal>
  );
}

function ManualFixtureModal({ divisions, teams, seasonId, onClose, onSaved }) {
  const [form, setForm] = useState({
    divisionId: divisions[0]?.id || "", homeSeasonTeamId: "", awaySeasonTeamId: "",
    roundNumber: 1, legNumber: 1, scheduledAt: toDateTimeInput(new Date()),
    venueName: "", notes: ""
  });
  const [error, setError] = useState("");
  const { show } = useToast();
  const eligible = teams.filter((team) => (team.divisionId || team.division?.id) === form.divisionId);

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.post(`/seasons/${seasonId}/matches`, {
        ...form,
        roundNumber: Number(form.roundNumber),
        legNumber: Number(form.legNumber),
        scheduledAt: new Date(form.scheduledAt).toISOString()
      });
      show("Fixture created");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title="Create fixture" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        <SelectField label="Division" value={form.divisionId} onChange={(divisionId) => setForm({
          ...form, divisionId, homeSeasonTeamId: "", awaySeasonTeamId: ""
        })}>
          {divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}
        </SelectField>
        <div className="form-row">
          <SelectField label="Home team" required value={form.homeSeasonTeamId}
            onChange={(homeSeasonTeamId) => setForm({ ...form, homeSeasonTeamId })}>
            <option value="">Select team</option>
            {eligible.map((team) => <option key={team.id} value={team.id}>{team.team?.name || team.teamName}</option>)}
          </SelectField>
          <SelectField label="Away team" required value={form.awaySeasonTeamId}
            onChange={(awaySeasonTeamId) => setForm({ ...form, awaySeasonTeamId })}>
            <option value="">Select team</option>
            {eligible.filter((team) => team.id !== form.homeSeasonTeamId).map((team) =>
              <option key={team.id} value={team.id}>{team.team?.name || team.teamName}</option>)}
          </SelectField>
        </div>
        <div className="form-row">
          <TextField label="Round" min="1" type="number" value={form.roundNumber}
            onChange={(roundNumber) => setForm({ ...form, roundNumber })} />
          <TextField label="Leg" min="1" type="number" value={form.legNumber}
            onChange={(legNumber) => setForm({ ...form, legNumber })} />
        </div>
        <TextField label="Scheduled date and time" required type="datetime-local" value={form.scheduledAt}
          onChange={(scheduledAt) => setForm({ ...form, scheduledAt })} />
        <TextField label="Venue" value={form.venueName} onChange={(venueName) => setForm({ ...form, venueName })} />
        <TextAreaField label="Notes" rows="3" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" type="submit">Create fixture</button>
        </div>
      </form>
    </Modal>
  );
}

export function MatchWorkspacePage() {
  const { matchId } = useParams();
  const matchRequest = useApi(() => api.get(`/matches/${matchId}`), [matchId]);
  const resultRequest = useApi(() => api.get(`/matches/${matchId}/result`), [matchId]);
  const [editing, setEditing] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const { show } = useToast();

  if (matchRequest.loading || resultRequest.loading) return <Loading label="Loading match" />;
  const error = matchRequest.error || (resultRequest.error?.status === 404 ? null : resultRequest.error);
  if (error) return <ErrorState error={error} />;

  const match = entity(matchRequest.data, "match");
  const result = entity(resultRequest.data, "result", "match");

  return (
    <>
      <PageHeader
        eyebrow={match.division?.name}
        title={`${match.homeSeasonTeam?.team?.name || "Home"} v ${match.awaySeasonTeam?.team?.name || "Away"}`}
        description={`${formatDateTime(match.scheduledAt)} · Round ${match.roundNumber}`}
        actions={<StatusBadge status={match.status} />}
      />
      <SeasonTabs />
      <div className="stats-grid">
        <article className="stat-card"><p>Home frames</p><strong>{result?.homeFramesWon ?? match.homeFramesWon ?? "—"}</strong></article>
        <article className="stat-card"><p>Away frames</p><strong>{result?.awayFramesWon ?? match.awayFramesWon ?? "—"}</strong></article>
        <article className="stat-card"><p>Venue</p><strong className="stat-card__text">{match.venueName || "TBC"}</strong></article>
        <article className="stat-card"><p>Status</p><strong className="stat-card__text">{match.status}</strong></article>
      </div>
      <Section
        title="Match actions"
        action={
          <div className="row-actions">
            <button className="button button--secondary" onClick={() => setEditing(true)} type="button">Edit fixture</button>
            <button className="button" onClick={() => setResultOpen(true)} type="button">
              {match.status === "COMPLETED" ? "Correct result" : "Enter result"}
            </button>
            {match.status === "COMPLETED" ? (
              <button className="button button--secondary" onClick={async () => {
                const reason = window.prompt("Reason for reopening");
                if (reason === null) return;
                try {
                  await api.post(`/matches/${matchId}/result/reopen`, { reason });
                  show("Result reopened");
                  matchRequest.reload();
                  resultRequest.reload();
                } catch (requestError) {
                  show(requestError.message, "error");
                }
              }} type="button">Reopen</button>
            ) : null}
          </div>
        }
      >
        <p className="muted-copy">{match.notes || "No match notes."}</p>
      </Section>
      {result?.frames?.length ? (
        <Section title="Frames">
          <div className="frame-list">
            {result.frames.map((frame) => (
              <div className="frame-row" key={frame.id || frame.frameNumber}>
                <b>{frame.frameNumber}</b>
                <span>{frame.homePlayer?.displayName || frame.homePlayerName || "—"}</span>
                <strong>{frame.winnerSide === "HOME" ? "1–0" : frame.winnerSide === "AWAY" ? "0–1" : "—"}</strong>
                <span>{frame.awayPlayer?.displayName || frame.awayPlayerName || "—"}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      {editing ? (
        <EditMatchModal
          match={match}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); matchRequest.reload(); }}
        />
      ) : null}
      {resultOpen ? (
        <ResultEntryModal
          match={match}
          existing={result}
          onClose={() => setResultOpen(false)}
          onSaved={() => {
            setResultOpen(false);
            matchRequest.reload();
            resultRequest.reload();
          }}
        />
      ) : null}
    </>
  );
}

function EditMatchModal({ match, onClose, onSaved }) {
  const [form, setForm] = useState({
    scheduledAt: toDateTimeInput(match.scheduledAt),
    venueName: match.venueName || "",
    status: match.status,
    postponedReason: match.postponedReason || "",
    notes: match.notes || ""
  });
  const [error, setError] = useState("");
  const { show } = useToast();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.patch(`/matches/${match.id}`, {
        ...form,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        postponedReason: form.status === "POSTPONED" ? form.postponedReason : null
      });
      show("Fixture updated");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title="Edit fixture" onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        <TextField label="Scheduled date and time" required type="datetime-local" value={form.scheduledAt}
          onChange={(scheduledAt) => setForm({ ...form, scheduledAt })} />
        <TextField label="Venue" value={form.venueName} onChange={(venueName) => setForm({ ...form, venueName })} />
        <SelectField label="Status" value={form.status} onChange={(status) => setForm({ ...form, status })}>
          {["SCHEDULED", "POSTPONED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) =>
            <option key={status} value={status}>{status}</option>)}
        </SelectField>
        {form.status === "POSTPONED" ? (
          <TextAreaField label="Postponement reason" required rows="3" value={form.postponedReason}
            onChange={(postponedReason) => setForm({ ...form, postponedReason })} />
        ) : null}
        <TextAreaField label="Notes" rows="3" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" type="submit">Save fixture</button>
        </div>
      </form>
    </Modal>
  );
}

function ResultEntryModal({ match, existing, onClose, onSaved }) {
  const homeRoster = useApi(() => api.get(`/season-teams/${match.homeSeasonTeamId}/roster`), [match.homeSeasonTeamId]);
  const awayRoster = useApi(() => api.get(`/season-teams/${match.awaySeasonTeamId}/roster`), [match.awaySeasonTeamId]);
  const defaultCount = Math.max(existing?.frames?.length || 0, match.matchFormat?.framesPerMatch || 1);
  const [frameCount, setFrameCount] = useState(defaultCount);
  const [frames, setFrames] = useState(() =>
    Array.from({ length: defaultCount }, (_, index) => {
      const old = existing?.frames?.[index];
      return {
        frameNumber: index + 1,
        homePlayerId: old?.homePlayerId || old?.homePlayer?.id || "",
        awayPlayerId: old?.awayPlayerId || old?.awayPlayer?.id || "",
        winnerSide: old?.winnerSide || "HOME",
        resultType: old?.resultType || "NORMAL",
        notes: old?.notes || ""
      };
    })
  );
  const [notes, setNotes] = useState(existing?.notes || "");
  const [correctionReason, setCorrectionReason] = useState("");
  const [error, setError] = useState("");
  const { show } = useToast();

  if (homeRoster.loading || awayRoster.loading) return <Loading label="Loading eligible players" />;
  if (homeRoster.error || awayRoster.error) return <ErrorState error={homeRoster.error || awayRoster.error} />;

  const home = collection(homeRoster.data, "roster", "players", "rosterEntries").filter((entry) => entry.status === "ACTIVE");
  const away = collection(awayRoster.data, "roster", "players", "rosterEntries").filter((entry) => entry.status === "ACTIVE");

  function resize(value) {
    const nextCount = Math.max(1, Number(value));
    setFrameCount(nextCount);
    setFrames((current) => Array.from({ length: nextCount }, (_, index) => current[index] || {
      frameNumber: index + 1, homePlayerId: "", awayPlayerId: "",
      winnerSide: "HOME", resultType: "NORMAL", notes: ""
    }));
  }

  function change(index, patch) {
    setFrames((current) => current.map((frame, frameIndex) =>
      frameIndex === index ? { ...frame, ...patch } : frame));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api.put(`/matches/${match.id}/result`, {
        frames: frames.map((frame) => ({
          ...frame,
          homePlayerId: frame.resultType === "NORMAL" ? frame.homePlayerId : frame.homePlayerId || null,
          awayPlayerId: frame.resultType === "NORMAL" ? frame.awayPlayerId : frame.awayPlayerId || null,
          winnerPlayerId:
            frame.winnerSide === "HOME" ? frame.homePlayerId :
            frame.winnerSide === "AWAY" ? frame.awayPlayerId : null
        })),
        notes,
        correctionReason: existing?.frames?.length ? correctionReason : null
      });
      show(existing?.frames?.length ? "Result corrected" : "Result submitted");
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <Modal title={existing?.frames?.length ? "Correct match result" : "Enter match result"} onClose={onClose}>
      <form className="form-stack" onSubmit={submit}>
        <FormError message={error} />
        <TextField label="Number of frames" min="1" type="number" value={frameCount} onChange={resize} />
        <div className="result-grid">
          {frames.map((frame, index) => (
            <article className="result-frame" key={frame.frameNumber}>
              <strong>Frame {frame.frameNumber}</strong>
              <SelectField label="Result type" value={frame.resultType}
                onChange={(resultType) => change(index, { resultType })}>
                {["NORMAL", "WALKOVER", "VOID", "FORFEIT"].map((type) =>
                  <option key={type} value={type}>{type}</option>)}
              </SelectField>
              <div className="form-row">
                <SelectField label="Home player" value={frame.homePlayerId}
                  onChange={(homePlayerId) => change(index, { homePlayerId })}>
                  <option value="">Select player</option>
                  {home.map((entry) => <option key={entry.playerId || entry.player?.id}
                    value={entry.playerId || entry.player?.id}>{entry.player?.displayName}</option>)}
                </SelectField>
                <SelectField label="Away player" value={frame.awayPlayerId}
                  onChange={(awayPlayerId) => change(index, { awayPlayerId })}>
                  <option value="">Select player</option>
                  {away.map((entry) => <option key={entry.playerId || entry.player?.id}
                    value={entry.playerId || entry.player?.id}>{entry.player?.displayName}</option>)}
                </SelectField>
              </div>
              <SelectField label="Winner" value={frame.winnerSide}
                onChange={(winnerSide) => change(index, { winnerSide })}>
                <option value="HOME">Home</option>
                <option value="AWAY">Away</option>
                <option value="NONE">No winner</option>
              </SelectField>
            </article>
          ))}
        </div>
        <TextAreaField label="Match notes" rows="3" value={notes} onChange={setNotes} />
        {existing?.frames?.length ? (
          <TextAreaField label="Correction reason" required rows="3" value={correctionReason}
            onChange={setCorrectionReason} />
        ) : null}
        <div className="form-actions">
          <button className="button button--secondary" onClick={onClose} type="button">Cancel</button>
          <button className="button" type="submit">Submit result</button>
        </div>
      </form>
    </Modal>
  );
}
