This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. Run yarn install both in this directory and the parent directory
2. Run `yarn docker:start`

If you experience any issues with posgres, make sure you do not already have a postgres service running locally outside of docker.

3. Add .env.local (see .env.example)
4. yarn db:migrate:local

### Running the development server

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Email

Open [http://localhost:8025](http://localhost:8025) to open the development mailbox.

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
8. create .sentryclirc (see .sentryclirc.example)

### Automatic Deployments (Main Application)

- Staging deployments (https://lightsats.fly.dev/) will happen on push to `main`
- Production deployments (https://lightsats.com/) will happen on push to `production`

### Automatic Deployments (Scheduler app)

TODO
