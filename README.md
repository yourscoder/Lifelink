# LifeLink — minimal blood bank app

Donors keep a profile and go "active" automatically based on how long it's
been since their last donation. Patients verify their phone, submit an
emergency request, and get matched to the nearest active, compatible donors.
When a donor accepts, the patient sees that donor's name and phone number.

Stack: Next.js (App Router, deployed on Vercel) + Postgres.

## 1. Database

Uses **Neon** (serverless Postgres), created directly from Vercel's
Storage tab — a genuine free tier, one click to provision:

1. In your Vercel project → **Storage** → find **Neon** in the Marketplace list → **Create**.
2. Pick a region, name the database (e.g. `bloodbank`), create it.
3. Vercel automatically sets a `DATABASE_URL` env var on your project (a Postgres connection string with `sslmode=require` built in) — you don't need to copy anything by hand.
4. Run `schema.sql` against it once. Easiest way: open the database in Neon's console → **SQL Editor** → paste the contents of `schema.sql` → run. Or from your machine, if you have `psql`:
   ```
   psql "$DATABASE_URL" -f schema.sql
   ```

Any other Postgres host (Supabase, Prisma Postgres, a plain managed
Postgres instance) works the same way — just set `DATABASE_URL` to point
at it.

## 2. OTP / phone login

Donors and patients log in with phone + a 6-digit code. This uses
**Twilio Verify**:

1. Create a Twilio account → Verify → create a Verify Service → copy its SID.
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID`.

If you leave these blank, the app runs in **demo mode**: it generates the
code itself, stores it in the `otp_codes` table, and prints it to the
server log *and* shows it directly in the UI so you can test the whole
flow without sending real SMS. Don't ship to real users in this mode —
anyone could sign in as anyone.

## 3. Environment variables

Copy `.env.example` to `.env.local` for local dev, and add the same
variables in Vercel → Project → Settings → Environment Variables for
production. Generate `JWT_SECRET` with:
```
openssl rand -base64 32
```

## 4. Run locally

```
npm install
npm run dev
```
Visit http://localhost:3000.

## 5. Deploy to Vercel

```
npm i -g vercel
vercel
```
Or connect the GitHub repo in the Vercel dashboard. Set the environment
variables from step 3 before the first deploy.

## How matching works

- A donor is **active** once `DONOR_ELIGIBILITY_DAYS` (default 90) days have
  passed since `last_donation_date`, or they've never donated.
- A patient request pulls all active donors whose blood group is a safe
  match for the recipient's group (standard compatibility rules), computes
  distance with the haversine formula if GPS coordinates are available, and
  notifies up to `MATCH_LIMIT` of the closest ones within `MATCH_RADIUS_KM`.
  If GPS isn't available, it falls back to a plain city-name match.
- Any matched donor can accept or decline from their dashboard. The first
  to accept gets the request; all other pending matches for that request
  are closed automatically, and the patient's status page reveals that
  donor's name and phone number.

## Project structure

```
app/
  page.js                        greeting screen (donor vs patient)
  donor/login, donor/register, donor/dashboard
  patient/request, patient/status/[id]
  api/auth/...                   OTP send/verify
  api/donor/...                  profile, incoming requests
  api/patient/...                create request, poll status
lib/
  db.js           Postgres pool
  auth.js         session cookie (JWT)
  otp.js          Twilio Verify + demo-mode fallback
  distance.js     haversine distance
  blood.js        compatibility table + eligibility rule
schema.sql        run once against your database
```

## Notes on "minimal"

- No separate admin panel, notifications service, or push notifications —
  the patient's status page and donor's dashboard both poll the API every
  few seconds instead.
- One phone number = one role (donor or patient). Someone who wants both
  would need two numbers, which was an intentional simplification.
- No payment, blood-bank inventory, or multi-unit tracking — this covers
  the request → match → accept → reveal-contact flow described in the brief.
