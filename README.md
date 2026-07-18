# SwiftPool — Railway Single-URL Deployment

This package deploys the SwiftPool Phase 14 API and Phase 2 React frontend as
one Railway web service.

The final URL has this structure:

```text
https://your-app.up.railway.app/
https://your-app.up.railway.app/login
https://your-app.up.railway.app/app
https://your-app.up.railway.app/api/v1/...
https://your-app.up.railway.app/health
```

The React application is compiled during the Docker build and copied into the
Express application. Express serves frontend assets and provides the React
Router fallback. API endpoints remain under `/api/v1`.

## Railway project structure

Create one Railway project with:

```text
SwiftPool web service
Railway MySQL service
```

Only the SwiftPool web service receives a public domain.

## Backend variables

Add these to the SwiftPool service:

```env
NODE_ENV=production
TRUST_PROXY=1

DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_LOGGING=false

SESSION_SECRET=replace-with-a-random-secret-at-least-32-characters
SESSION_NAME=swiftpool.sid
SESSION_MAX_AGE_MS=86400000
SESSION_SECURE=true
SESSION_SAME_SITE=lax
BCRYPT_ROUNDS=12
```

Do not manually define `PORT`; Railway supplies it.

`APP_ORIGIN` is still required by the current backend configuration. For the
first deployment, set it to the generated Railway domain:

```env
APP_ORIGIN=https://your-app.up.railway.app
```

After adding a custom domain, update `APP_ORIGIN` to that exact HTTPS origin.

Because the frontend and backend share an origin, use:

```env
SESSION_SAME_SITE=lax
```

rather than `none`.

## Deploy

1. Extract this project and push the contents to a GitHub repository.
2. Create an empty Railway project.
3. Add a Railway MySQL database.
4. Add a service from the GitHub repository.
5. Add the variables above.
6. Deploy.
7. Generate one public domain on the SwiftPool service.
8. Set `APP_ORIGIN` to that domain and redeploy.

The included Railway configuration runs database migrations as a pre-deploy
command and checks `/health` before completing deployment.

## Local Docker test

Create an `api/.env` file and run:

```bash
docker build -t swiftpool-single .
docker run --rm --env-file api/.env -p 3000:3000 swiftpool-single
```

Open:

```text
http://localhost:3000
```

For local Docker use, set:

```env
APP_ORIGIN=http://localhost:3000
SESSION_SECURE=false
SESSION_SAME_SITE=lax
```
