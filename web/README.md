# SwiftPool Web — Production UI Phase 2

A full React administration and public user interface for the SwiftPool Phase 14 backend.

## Technology

- React 19
- React Router
- Vite
- Native Fetch API
- Cookie-based sessions
- Automatic CSRF token acquisition
- Responsive custom CSS
- No frontend state-management dependency

## Public UI

- League lookup
- Public league and season pages
- Fixtures and results
- Match detail and frame results
- Standings
- Player statistics
- Privacy-aware public views

## Account UI

- Registration
- Login and logout
- Session restoration
- Profile editing
- Password/session-ready API client
- Protected administration routes

## League administration

- League creation and dashboard
- League settings
- Team directory
- Player directory
- Player detail workspaces
- Match-format creation and editing
- Public visibility controls

## Season administration

- Season creation
- Season dashboards
- Division CRUD and reorder
- Promotion and relegation counts
- Team registration and division assignment
- Points adjustments
- Roster management
- Captain assignment
- Eligibility dates
- Player release and transfer workflow
- Round-robin fixture generation
- Manual fixture creation
- Fixture update, postponement and deletion
- Match workspace
- Frame-by-frame result submission
- Result correction and reopening
- Calculated standings
- Player statistics
- Automatic handicap preview and apply
- Promotion/relegation transition plans
- Plan approval, application and cancellation
- JSON reports and CSV export

## Discipline and player records

- Player profile editing
- Player handicap history
- Manual handicap creation
- Sanction history
- Warnings and suspensions
- Sanction revocation
- Transfer history

## Configuration

```bash
cp .env.example .env
npm install
npm run dev
```

Default environment:

```env
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=SwiftPool
```

The Vite proxy forwards `/api` to `http://localhost:3000`.

## Production deployment

Build the static application:

```bash
npm run build
```

Serve `dist/` behind the same origin as the API, or configure the backend
`APP_ORIGIN` to the exact frontend origin and retain credentialed CORS.

The backend must expose:

```text
GET /api/v1/auth/csrf-token
```

The API client retrieves this token before all POST, PUT, PATCH and DELETE
requests and sends it in `X-CSRF-Token`.

## Integration note

The UI is mapped to all Phase 14 route groups and validator payloads. Because
the generated backend phases have not yet been run together against MySQL,
end-to-end browser testing should be performed after the API migrations and
seed data are installed.
