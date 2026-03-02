## Base UBI v2

Next.js app for Base-focused UBI flows with:
- Wallet sign-in using EVM message signature (no gas).
- Governance voting protected by authenticated wallet sessions.
- USDC-focused copy and Base network configuration.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.local.example .env.local
```

3. Run dev server:

```bash
npm run dev
```

## Production build check

```bash
npm run build
npm run typecheck
```

## Deploy to Vercel

Set these environment variables in Vercel (Production):

- `NEXTAUTH_URL=https://<your-domain>`
- `NEXTAUTH_SECRET=<strong-random-secret>`
- `NEXT_PUBLIC_CHAIN=mainnet` (or `sepolia` for testing)
- `NEXT_PUBLIC_BASIC_INCOME_CONTRACT=<deployed-contract-address>`
- `NEXT_PUBLIC_STAKING_CONTRACT=<deployed-contract-address>`
- `DATABASE_PATH=/tmp/votes.db`
- Optional rate limit storage:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

Notes:
- `/tmp/votes.db` is ephemeral in serverless; votes may reset between instances/deployments.
- Use an external persistent database if you need durable governance history.
- Wallet sign-in uses signature only; it does not send on-chain transactions or consume gas.

## Security checklist

- Rotate any previously exposed keys/secrets.
- Enable GitHub 2FA and use SSH or PAT (never account password in CLI).
- Keep `.env` secrets out of git.
