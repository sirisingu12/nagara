# Nagara

**Better streets. Better communities.**

Your city. Your voice. Your impact.

Nagara is a civic-technology prototype that connects citizens, municipal officers, and field workers so public infrastructure problems in Telangana can be reported, assigned, and resolved with a visible history.

This is an academic Software Engineering and Software Design project. It is not affiliated with the Government of Telangana or any municipal corporation, and it does not integrate with government systems.

**Current status:** Phase 0 is approved; Phase 1 has not started. The architecture is in [PROJECT_PLAN.md](PROJECT_PLAN.md). The application is not runnable yet.

## Who it is for

| Role | What they do |
| --- | --- |
| Citizen | Report an issue with photos and a map location, track status, comment, and give feedback. |
| Municipal officer | Verify reports inside their own municipality, assign a department and field worker, and approve completion evidence. |
| Field worker | Accept assigned work, post progress, and upload completion photos. A worker cannot mark a complaint officially resolved. |

Officers and workers only see complaints inside municipalities linked to their account. There is no global administrator.

## Planned stack

- **Client:** React, Vite, Tailwind CSS, React Router, Axios, Lucide, Chart.js, React Leaflet, OpenStreetMap
- **Server:** Node.js, Express, JWT, bcrypt, express-validator
- **Database:** MySQL Server 8.0.46, database `nagara`, user `nagara_user`
- **Photos:** Private local storage initially, behind a storage service that supports Cloudinary later. Uploads are validated as real images and served only after an authorization check.
- **Secrets:** environment variables only

## Repository layout

```text
client/     React application
server/     Express API
database/   schema.sql and seed data
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

## Setup still ahead

The application is not runnable yet, because Phase 1 has not been built.

1. No Cloudinary account is needed for the initial demo. Photos use a private local server directory; Cloudinary can be configured later through the same storage service.
2. After Phase 1, copy `.env.example` to `.env`. Set `DB_USER=nagara_user`, `DB_NAME=nagara`, `DB_HOST=127.0.0.1`, and `DB_PORT=3306`. Put the database password and two long random JWT secrets only in `.env`. Do not commit `.env`.

Planned commands, once those phases exist:

```bash
# Phase 1, from the nagara folder
npm install --prefix client
npm install --prefix server
npm run dev --prefix client
npm run dev --prefix server

# Phase 2, after MySQL is running and .env is filled in
npm run db:setup --prefix server
```

The client is planned for `http://localhost:5173` and the API for `http://localhost:4000`.

## Demo accounts

All seven fictional seed accounts below will be created in Phase 2. Every seed user will use the password `NagaraDemo#2026`. Municipality naming is standardized as GHMC and Warangal.

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
