# Chirp Backend Deployment (Supabase Edge Function)

## Audit result

| Item | Value |
|------|--------|
| **Deploy function name** | `make-server-b89d4352` (NOT `server`) |
| **Source folder** | `supabase/functions/make-server-b89d4352/` |
| **Public base URL** | `https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352` |
| **KV table** | `public.kv_store_b89d4352` |
| **Project ref** | `edjtshisztwaunytdlxd` |

Routes (Hono `basePath` = `/make-server-b89d4352`):

| Method | Path (after base URL) | Full URL path |
|--------|----------------------|---------------|
| GET | `/health` | `/make-server-b89d4352/health` |
| POST | `/newsletter` | `/make-server-b89d4352/newsletter` |
| GET | `/auth/register` | Diagnostic only (returns JSON) |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout (header `X-Chirp-Session`) |
| GET | `/auth/me` | Current user |
| PUT | `/auth/profile` | Update profile |
| POST | `/auth/onboarding` | Complete onboarding |

---

## 1. Install Supabase CLI (Windows)

**Option A — Scoop (recommended):**

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Option B — npm:**

```powershell
npm install -g supabase
```

Verify:

```powershell
supabase --version
```

---

## 2. Login and link project

```powershell
cd C:\Users\hermi\Desktop\CHIRP\Chirp
supabase login
supabase link --project-ref edjtshisztwaunytdlxd
```

---

## 3. Create KV table (SQL)

Run in **Supabase Dashboard → SQL Editor** (or `supabase db push` if using migrations):

```sql
CREATE TABLE IF NOT EXISTS public.kv_store_b89d4352 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);

ALTER TABLE public.kv_store_b89d4352 ENABLE ROW LEVEL SECURITY;
```

File copy: `supabase/migrations/20250530000000_create_kv_store_b89d4352.sql`

---

## 4. Supabase secrets / environment variables

### Auto-injected on Edge Functions (do NOT set manually)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | KV read/write via service role |
| `SUPABASE_ANON_KEY` | Available but unused by auth |

### Optional secret (newsletter only)

```powershell
supabase secrets set RESEND_API_KEY=re_xxxxxxxx --project-ref edjtshisztwaunytdlxd
```

Auth routes do **not** require `RESEND_API_KEY`.

---

## 5. Deploy Edge Function (Windows)

**Important:** Run from `Chirp\` (the app folder), NOT `CHIRP\` (parent). The parent has no `supabase\functions\` folder.

Entrypoint must be `index.ts` (Supabase CLI does not use `index.tsx`).

```powershell
cd C:\Users\hermi\Desktop\CHIRP\Chirp
.\scripts\deploy-edge-function.ps1
```

Or manually:

```powershell
cd C:\Users\hermi\Desktop\CHIRP\Chirp
supabase functions deploy make-server-b89d4352 --project-ref edjtshisztwaunytdlxd --no-verify-jwt
```

If an old `server` function exists in the dashboard, delete it or leave it unused.

---

## 6. Verify deployment (replace ANON_KEY)

Get anon key from `utils/supabase/info.tsx` (`publicAnonKey`) or Dashboard → Settings → API.

**Health:**

```powershell
curl -s "https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352/health" -H "Authorization: Bearer ANON_KEY"
```

Expected: `{"status":"ok","function":"make-server-b89d4352"}`

**Auth register route exists (GET diagnostic):**

```powershell
curl -s "https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352/auth/register" -H "Authorization: Bearer ANON_KEY"
```

Expected: JSON with `"ok":true` and message to use POST.

**KV check:**

```powershell
curl.exe -s "https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352/health/db" -H "Authorization: Bearer ANON_KEY"
```

**Auth register (POST)** — do not use `-d "{\"email\":...}"` in PowerShell (breaks JSON). Use the script or a file:

```powershell
cd C:\Users\hermi\Desktop\CHIRP\Chirp
.\scripts\test-auth-register.ps1
```

Or:

```powershell
curl.exe -s -X POST "https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352/auth/register" -H "Authorization: Bearer ANON_KEY" -H "Content-Type: application/json" --data-binary "@scripts\test-register-body.json"
```

Expected: `200` with `{ "user": {...}, "token": "..." }` or `409` if email exists.

**Missing body (should be 400, not 404):**

```powershell
curl -s -X POST "https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352/auth/register" -H "Authorization: Bearer ANON_KEY" -H "Content-Type: application/json" -d "{}"
```

Expected: `400` with validation error.

---

## 7. Rebuild frontend

```powershell
cd C:\Users\hermi\Desktop\CHIRP\Chirp
npm run build
```

---

## Manual steps only you can do

1. Run `supabase login` in a browser-authenticated terminal.
2. Run `supabase link --project-ref edjtshisztwaunytdlxd` (enter DB password if prompted).
3. Execute KV SQL in dashboard if table `kv_store_b89d4352` does not exist.
4. Run `supabase functions deploy make-server-b89d4352 --no-verify-jwt`.
5. Run verification curls with your real anon key.
6. Clear browser `localStorage` key `chirp_auth_token` if testing fresh auth (or disable local fallback by fixing API first).
7. Optional: set `RESEND_API_KEY` for newsletter emails.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `404` on all routes | Function not deployed or wrong name; deploy `make-server-b89d4352` |
| `404` on auth only | Old code with wrong paths; redeploy from this repo |
| `500` on register | Missing `kv_store_b89d4352` table or RLS blocking service role |
| `401` on `/auth/me` | Missing `X-Chirp-Session` header |
| Frontend uses localStorage | API unreachable; fix deploy then hard-refresh |
