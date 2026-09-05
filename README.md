# Lumen List

Modern React todo app with **Supabase** persistence. Replaces the old Bootstrap + dummyjson + localStorage version on `master` (`reactproj/`).

Live attempt on Vercel was returning 404 because `main` only contained this README. This branch is a complete app at the repo root so Vercel can build it.

## Stack

- React 19 + Vite 6
- Supabase Postgres + Auth (magic link)
- LocalStorage fallback if env keys are missing

## How to run

### 1. Clone

```bash
git clone https://github.com/Manjusri-developer/Todo-List.git
cd Todo-List
git checkout feature/modern-ui-supabase
npm install
```

### 2. Create a Supabase project

1. Open [https://supabase.com](https://supabase.com) and create a project.
2. Project Settings → API → copy **Project URL** and **anon public** key.
3. SQL Editor → paste and run `supabase/schema.sql`.
4. Authentication → Providers → Email → enable magic link.

### 3. Env file

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

### 4. Start

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Without `.env` the UI still runs; tasks stay in the browser only.

### 5. Production build

```bash
npm run build
npm run preview
```

On Vercel: set Root Directory to repo root, Framework Preset **Vite**, and add the same two env vars.

## Features

- Add / edit / complete / delete tasks
- Priority (low / medium / high)
- Filters: all, active, done
- Magic-link sign-in so rows are scoped to `auth.uid()`
- Row Level Security in `supabase/schema.sql`

## Project layout

```
.
├── src/
│   ├── App.jsx           # UI
│   ├── lib/supabase.js   # client
│   └── lib/todos.js      # CRUD
├── supabase/schema.sql
├── .env.example
└── package.json
```
