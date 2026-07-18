# SwiftPool API — Phase 14

Phase 14 adds a privacy-aware, read-only public league API.

## Included

- Slug-based public league URLs
- Public league and season overviews
- Public teams and divisions
- Public fixtures and results
- Public match details
- Public calculated standings
- Optional public rosters
- Optional public player statistics
- Optional venue-address publication
- Public API rate limiting
- Cache-Control headers
- Privacy-safe response mapping
- Public access disabled by default
- No session or CSRF requirement for public GET routes

## Upgrade from Phase 13

```bash
npm install
npm run db:migrate
npm test
npm run dev
```

## Public settings

The existing league settings resource now accepts:

```json
{
  "publicEnabled": true,
  "publicRosterNames": false,
  "publicPlayerStatistics": true,
  "publicVenueAddresses": false
}
```

All four options default to `false`.

## Public endpoints

```text
GET /api/v1/public/leagues/:leagueSlug
GET /api/v1/public/leagues/:leagueSlug/seasons/:seasonSlug
GET /api/v1/public/leagues/:leagueSlug/seasons/:seasonSlug/teams
GET /api/v1/public/leagues/:leagueSlug/seasons/:seasonSlug/roster
GET /api/v1/public/leagues/:leagueSlug/seasons/:seasonSlug/matches
GET /api/v1/public/leagues/:leagueSlug/seasons/:seasonSlug/matches/:matchId
GET /api/v1/public/leagues/:leagueSlug/seasons/:seasonSlug/standings
GET /api/v1/public/leagues/:leagueSlug/seasons/:seasonSlug/statistics/players
```

Match listing options:

```text
?status=COMPLETED&divisionId=<uuid>&limit=50&order=desc
```

Player statistics options:

```text
?limit=25&minimumFrames=5
```

## Privacy rules

Public responses never expose:

- email addresses
- phone numbers
- dates of birth
- linked user IDs
- sanctions or appeals
- administrative audits
- result submitter identities
- team contact details
- private notes

Player responses use `displayName` only.

Venue addresses are omitted unless `publicVenueAddresses` is enabled.

Frame-level player names and roster endpoints return `404` unless
`publicRosterNames` is enabled.

Player statistics return `404` unless `publicPlayerStatistics` is enabled.

## Visibility rules

- The league must be active.
- `publicEnabled` must be true.
- Draft and cancelled seasons are hidden.
- Registration, active, and completed seasons may be shown.
- Disabled public resources deliberately return `404` rather than revealing
  that a private league or feature exists.
