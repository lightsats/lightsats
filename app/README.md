This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Run yarn install both in this directory and the parent directory

### Database setup

1. Install postgresql and create a database (TODO: make this a docker container)
2. Add .env.local (see .env.example)
3. yarn db:generate:local
4. yarn db:push:local

### Running the development server

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

In order to receive webhook requests, make sure to run a tunnel such as ngrok and update your .env.local file.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/test). This endpoint can be edited in `pages/api/test.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on fly.io

1. Install fly.io https://fly.io/docs/speedrun/
2. Add .env.production file with `DATABASE_URL` set (currently required for prisma db push)
3. `yarn deploy`
4. Deploy a postgresql database on fly.io (lightsats-db)
5. `flyctl postgres attach --app lightsats lightsats-db` OR `flyctl secrets set DATABASE_URL=postgres://postgres:XXXXXXXXXXXXXXXXXX@lightsats-db.internal:5432/lightsats?schema=public --app lightsats`
6. set NEXTAUTH_SECRET: `flyctl secrets set NEXTAUTH_SECRET=XXXXXXXXXXXXXXXXXXXXX --app lightsats-prod`
7. add other secrets (see .env.example)
