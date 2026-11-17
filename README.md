# Project Tracker

A server-rendered project and task tracker backed by Neon Postgres.

## Features

- Create projects and tasks with Zod validation.
- View project progress and manage tasks on a three-column Kanban board.
- Move tasks between statuses optimistically or delete them with confirmation.
- Filter project tasks by priority and title.
- View aggregate task, priority, status, overdue, and project completion statistics.
- Show loading and error states while server-rendered pages load.

## Stack

- Next.js 15 App Router and React 19
- TypeScript
- Tailwind CSS
- Neon Postgres with `@neondatabase/serverless`
- Zod for server-side form validation

## Architecture

- App Router pages are React Server Components. They load data on the server and render the home page, project board, and statistics page.
- `src/lib/queries.ts` contains typed read functions. It uses Neon tagged-template SQL so interpolated values are sent as parameters.
- `src/app/actions.ts` contains Server Actions for writes. They validate submitted `FormData` with Zod, execute parameterized SQL, and revalidate affected routes.
- Client form components use React `useActionState`; the Kanban board uses `useOptimistic` for task moves and deletes.
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

5. Create the tables in the Neon SQL Editor:

   ```sql
   CREATE TABLE projects (
     id SERIAL PRIMARY KEY,
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

6. Install dependencies and start the development server:

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

- `projects`: serial ID, name, optional description, display color, and creation timestamp.
- `tasks`: serial ID, project foreign key with cascading delete, title, checked status and priority values, optional due date, and creation timestamp.
