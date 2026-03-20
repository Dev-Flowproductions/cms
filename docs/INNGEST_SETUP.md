# Inngest setup (replaces Vercel Cron)

The scheduler runs **every 10 minutes** via [Inngest](https://www.inngest.com/) instead of Vercel Cron (so it works on Hobby and runs more often).

## 1. Connect Vercel to Inngest

1. Sign up at [app.inngest.com](https://app.inngest.com/sign-up) (free tier is enough).
2. Install the **Vercel integration**: [Inngest → Integrations → Vercel](https://app.inngest.com/settings/integrations/vercel/connect).
3. Connect your Vercel account and select this project. The integration will set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in Vercel for you.

## 2. Deploy

Push and deploy to Vercel. After deploy, Inngest will sync your app and register the **run-scheduler** function (cron every 10 minutes).

## 3. Keep CRON_SECRET in Vercel

Your app still uses `CRON_SECRET` so the Inngest function can call `POST /api/scheduler` with `Authorization: Bearer <CRON_SECRET>`. Leave it set in Vercel (and in `.env.local` for local).

## 4. Optional: run locally with Inngest Dev Server

```bash
npx --ignore-scripts=false inngest-cli@latest dev
```

With your Next.js app and the Inngest dev server running, you can see and trigger the cron from [http://localhost:8288](http://localhost:8288).

## Summary

| Before (Vercel Cron) | After (Inngest)        |
|----------------------|------------------------|
| 1 run per day (Hobby) | 1 run every **10 minutes** |
| No retries / visibility | Retries + dashboard     |
| `vercel.json` crons  | No `vercel.json` cron  |

The scheduler logic is unchanged; only the **trigger** is Inngest’s cron instead of Vercel’s.
