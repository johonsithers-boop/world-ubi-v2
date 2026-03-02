# Vercel Deploy Checklist (Base UBI v2)

## 1) Prerequisites

- Repository linked in Vercel: `johonsithers-boop/world-ubi-v2`
- Branch: `main`
- Framework preset: `Next.js`

## 2) Production environment variables

Set these in **Vercel Project Settings -> Environment Variables** (Production):

- `NEXTAUTH_URL` = `https://<your-vercel-domain>`
- `NEXTAUTH_SECRET` = `<strong-random-secret>`
- `NEXT_PUBLIC_CHAIN` = `mainnet`
- `NEXT_PUBLIC_BASIC_INCOME_CONTRACT` = `0x0000000000000000000000000000000000000000`
- `NEXT_PUBLIC_STAKING_CONTRACT` = `0x0000000000000000000000000000000000000000`
- `DATABASE_PATH` = `/tmp/votes.db`

Optional (recommended for distributed rate limiting):
- `UPSTASH_REDIS_REST_URL` = `<your-upstash-url>`
- `UPSTASH_REDIS_REST_TOKEN` = `<your-upstash-token>`

Notes:
- Current app flow is Base wallet sign-in + protected voting.
- `DATABASE_PATH=/tmp/votes.db` is ephemeral in serverless. For persistent governance history, migrate votes to an external DB.

## 3) CLI commands (optional)

From project root:

```bash
npx vercel link
npx vercel env add NEXTAUTH_URL production
npx vercel env add NEXTAUTH_SECRET production
npx vercel env add NEXT_PUBLIC_CHAIN production
npx vercel env add NEXT_PUBLIC_BASIC_INCOME_CONTRACT production
npx vercel env add NEXT_PUBLIC_STAKING_CONTRACT production
npx vercel env add DATABASE_PATH production
```

Optional:

```bash
npx vercel env add UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
```

Deploy:

```bash
npx vercel --prod
```

## 4) Post-deploy smoke test

1. Open `https://<your-vercel-domain>/en`
2. Connect Base-compatible wallet and sign message (no gas)
3. Go to `/en/govern`
4. Cast vote and verify no 401/409 unexpected errors
5. Refresh and verify one-vote-per-wallet behavior persists for that instance

## 5) Security actions required now

- Rotate any leaked wallet private keys.
- Rotate any leaked passwords.
- Keep secrets only in Vercel/GitHub Secrets, never in repo.
