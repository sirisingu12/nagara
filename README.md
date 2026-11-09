# Nagara

**Better streets. Better communities.**

Your city. Your voice. Your impact.

Nagara is a civic-technology prototype that connects citizens, municipal officers, and field workers so public infrastructure problems in Telangana can be reported, assigned, and resolved with a visible history.

This is an academic Software Engineering and Software Design project. It is not affiliated with the Government of Telangana or any municipal corporation, and it does not integrate with government systems.

**Current status:** The frontend public prototype, backend foundation, database schema, demo data, and authentication APIs are implemented. Complaint workflow APIs are not implemented yet.

## Who it is for

| Role | What they do |
| --- | --- |
| Citizen | Report an issue with photos and a map location, track status, comment, and give feedback. |
| Municipal officer | Verify reports inside their own municipality, assign a department and field worker, and approve completion evidence. |
| Field worker | Accept assigned work, post progress, and upload completion photos. A worker cannot mark a complaint officially resolved. |

Officers and workers only see complaints inside municipalities linked to their account. There is no global administrator.

## Planned stack

- **Client:** React, Vite, Tailwind CSS, React Router, fetch-based API client, Lucide, Chart.js, React Leaflet, OpenStreetMap
- **Server:** Node.js, Express 5, `mysql2`, `jsonwebtoken`, bcrypt
- **Database:** MySQL Server 8.0.46, database `nagara`, user `nagara_user`
- **Photos:** Private local storage initially, behind a storage service that supports Cloudinary later. Uploads are validated as real images and served only after an authorization check.
- **Secrets:** environment variables only

## Repository layout

```text
client/     React application
server/     Express API
database/   versioned SQL migrations
shared/     roles, statuses, and priorities used by both sides
docs/       API and design notes, added with the finished project
```

The reason for each major choice is written in `PROJECT_PLAN.md`.

## What is already installed

Confirmed on 8 November 2026. These do not need to be installed again.

| Tool | Status |
| --- | --- |
| Node.js 24.21.0 and npm 11.19.0 | Installed |
| Git for Windows | Installed |
| MySQL Server 8.0.46 | Installed |
| MySQL Workbench | Installed, and the connection test succeeded |
| Database `nagara` | Already created |
| User `nagara_user` | Already connected and able to run SQL on `nagara` |

## Backend setup

The Express API uses MySQL through `mysql2` and loads environment variables from the root `.env` file. The versioned migrations create the schema without dropping existing objects, and the seed script preserves existing demo-account passwords.

1. Copy `.env.example` to `.env` in the repository root.
2. Set `DB_PASSWORD` in `.env` to the local password for `nagara_user`. Keep `.env` private and never commit it.
3. Set `JWT_ACCESS_SECRET` to a private random value at least 32 characters long. The sample value in `.env.example` is only a placeholder. Refresh tokens are opaque random values; the API stores their SHA-256 hashes in MySQL.
4. Install server dependencies if needed, run tests, check the database connection, then apply the schema and seed demo data:

```powershell
Copy-Item .env.example .env
npm install --prefix server
npm test --prefix server
npm run db:check --prefix server
npm run db:migrate --prefix server
npm run db:seed --prefix server
npm run dev --prefix server
```

The API listens on `http://localhost:4000` by default. `GET /api/health` reports application and database health separately. `DB_PASSWORD` may be empty only if the local MySQL account is configured without a password.

## Authentication

The API signs two-hour HS256 access JWTs using `JWT_ACCESS_SECRET`; the frontend keeps the access token in React memory only and sends it as a bearer token. The frontend restores sessions on startup through `/api/auth/refresh` and refreshes an expired access token once before retrying an authorized API request. Seven-day refresh tokens are generated from cryptographically secure random bytes, stored only as SHA-256 hashes, and delivered in an HttpOnly, SameSite=Lax cookie scoped to `/api/auth`. Refresh rotates tokens transactionally. Reuse of a rotated token revokes the user's remaining active refresh tokens. Cookies are Secure in production and use the exact `CLIENT_ORIGIN` for credentialed CORS and origin checks. Helmet security headers, a 32 KB JSON body limit, and per-process login rate limiting are enabled.

Authentication endpoints:

| Method and path | Description |
| --- | --- |
| `POST /api/auth/login` | Validate credentials, return a short-lived access token, and set the refresh cookie. |
| `POST /api/auth/register` | Create a citizen only; validate selected district/municipality, then sign the new user in. |
| `POST /api/auth/refresh` | Validate, rotate, and replace the refresh cookie. |
| `POST /api/auth/logout` | Revoke the current refresh token and clear its cookie. |
| `GET /api/auth/me` | Return the safe profile for a valid bearer access token. |
| `GET /api/municipalities` | List municipalities and their districts for public registration. |

Citizens' selected municipality is stored in `users.home_district_id` and `users.home_municipality_id`. `user_municipalities` remains exclusively for officer and worker jurisdiction assignments. The authorization middleware checks officer/worker municipality memberships and additionally restricts workers to their assigned department; complaint data routes are not implemented yet.

## Demo accounts

The idempotent database seed creates these seven fictional accounts. Each uses `NagaraDemo#2026`, stored as a bcrypt hash. Rerunning the seed does not change an existing password. Municipality naming is standardized as GHMC and Warangal.

| Role | Email | Scope |
| --- | --- | --- |
| Citizen | `ananya.rao@nagara.demo` | Reports in GHMC |
| Citizen | `karthik.reddy@nagara.demo` | Reports in Warangal |
| Officer | `meera.nair@nagara.demo` | GHMC only |
| Officer | `imran.shaik@nagara.demo` | Warangal only |
| Field worker | `ravi.kumar@nagara.demo` | GHMC Roads |
| Field worker | `lakshmi.devi@nagara.demo` | GHMC Water |
| Field worker | `suresh.goud@nagara.demo` | Warangal Sanitation |

## Brand

- Primary teal `#075B57`
- Secondary teal `#159D91`
- Soft accent `#8ADBD0`
- Light background `#F7FAF9`
- Dark text `#263B3A`
- Dark page background `#172B2A`

Light and dark themes are part of the product, with the choice saved in the browser.

## License and academic use

Built as a student project. Geographic names from Telangana are used only as demo locations. People, phone numbers, and emails in the seed data are fictional.
