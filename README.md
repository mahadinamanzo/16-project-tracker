# Project Tracker

A server-rendered project and task tracker backed by Neon Postgres.

## Features

- Create projects and tasks with Zod validation.
- View project progress and manage tasks on a three-column Kanban board.
- Move tasks between statuses optimistically or delete them with confirmation.
- Filter project tasks by priority and title.
- View aggregate task, priority, status, overdue, and project completion statistics.
- Show loading and error states while server-rendered pages load.
- GitHub sign-in with private, per-user projects and tasks.

## Stack

- Next.js 15 App Router and React 19
- TypeScript
- Tailwind CSS
- Neon Postgres with `@neondatabase/serverless`
- Zod for server-side form validation
- Auth.js (NextAuth.js v5) with the GitHub OAuth provider

## Architecture

- App Router pages are React Server Components. They load data on the server and render the home page, project board, and statistics page.
- `src/lib/queries.ts` contains typed read functions. It uses Neon tagged-template SQL so interpolated values are sent as parameters.
- `src/app/actions.ts` contains Server Actions for writes. They validate submitted `FormData` with Zod, execute parameterized SQL, and revalidate affected routes.
- Client form components use React `useActionState`; the Kanban board uses `useOptimistic` for task moves and deletes.
- `src/auth.ts` configures Auth.js with GitHub and upserts users into the `users` table. Its JWT carries the application user ID, which is exposed as `session.user.id`.
- Project reads, statistics, and mutations are scoped to the signed-in user's `owner_id`; server actions verify ownership in the SQL mutation itself.
- The `/api/auth/[...nextauth]` route handles OAuth callbacks. The shared `UserMenu` displays the GitHub avatar and name with sign-out, or a sign-in button.
- `src/middleware.ts` redirects unauthenticated requests to `/login` with their original path and query as `callbackUrl`, except for login, Auth.js endpoints, and static assets. After GitHub returns to the Auth.js callback, Auth.js sets the JWT session cookie and sign-in resumes at that URL.
- `src/lib/callback-url.ts` validates callback destinations as same-site relative paths, falling back to `/` for external or malformed values to prevent open redirects.
- Data pages and project mutation Server Actions call `requireUser()` themselves. Middleware is only a request-level guard: Server Actions can be invoked directly, and matchers can change or be bypassed by other server entry points. Authentication therefore must be checked at the operation that reads or changes private data.
- Aggregate statistics are calculated in SQL using `COUNT`, `FILTER`, and `GROUP BY`; the page only formats the returned counts as simple Tailwind bars.

## Setup

1. Install Node.js 20 or newer.
2. Create a Neon project and database. Copy its pooled or direct Postgres connection string from the Neon dashboard.
3. Create a local environment file:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Put the Neon connection string in `.env.local`:

   ```dotenv
   DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
   ```

   Keep `.env.local` private; it is ignored by Git. `.env.example` intentionally contains no credential.

5. In GitHub, create an OAuth App with this callback URL for local development:

   ```text
   http://localhost:3000/api/auth/callback/github
   ```

   Add its client ID and newly generated client secret to `.env.local`, together with an Auth.js secret:

   ```dotenv
   AUTH_GITHUB_ID=your-github-oauth-client-id
   AUTH_GITHUB_SECRET=your-new-github-oauth-client-secret
   AUTH_SECRET=your-generated-authjs-secret
   ```

   Generate an `AUTH_SECRET` with `npx auth secret`. Do not commit `.env.local` or share OAuth secrets in chat.

6. The OAuth flow is:

   1. The user selects **Sign in with GitHub**; Auth.js redirects the browser to GitHub's authorization page.
   2. The user approves the OAuth request on GitHub.
   3. GitHub redirects to `/api/auth/callback/github` with a temporary authorization code.
   4. Auth.js exchanges the code for the GitHub profile, upserts the local user by `github_id`, then stores the local numeric user ID in its JWT.
   5. Auth.js sets an encrypted session cookie. On later requests it verifies the cookie and exposes that numeric ID as `session.user.id`; the app uses it to scope project access.

7. Create the tables in the Neon SQL Editor:

   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     github_id TEXT NOT NULL UNIQUE,
     name TEXT,
     email TEXT,
     image TEXT
   );

   CREATE TABLE projects (
     id SERIAL PRIMARY KEY,
     owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     description TEXT,
     color TEXT NOT NULL DEFAULT '#6366f1',
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE TABLE tasks (
     id SERIAL PRIMARY KEY,
     project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('todo', 'doing', 'done')),
     priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
     due_date DATE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

8. Install dependencies and start the development server:

   ```powershell
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`.

## Validation

```powershell
npm run lint
npm run build
```

## Schema overview

- `users`: serial ID, unique GitHub account ID, and profile name, email, and avatar URL.
- `projects`: serial ID, owner foreign key, name, optional description, display color, and creation timestamp.
- `tasks`: serial ID, project foreign key with cascading delete, title, checked status and priority values, optional due date, and creation timestamp.
