Scheduler for Lightsats

This app will be run as a fly machine on a schedule to manage things such as sending reminders to tippees to withdraw their tips.

## Getting Started

- `yarn install`
- `yarn build`

## Run locally

- `yarn start`

## Initial Fly Setup

- `yarn machines:init`
- Create a .env file and add _MACHINES_APP_ID_ (see .env.example)
- `yarn deploy:staging`
- Add _APP_IMAGE_ID_ to .env (see .env.example)
- `yarn machines:create:scheduled:staging`
- `yarn machines:list`
- Add _$MACHINE_ID_ to .env
- `yarn machines:start`

## Further Deployments

### Staging

- `yarn deploy:staging`
- Update _APP_IMAGE_ID_ in .env.staging
- `yarn machines:update:imageid:staging`
- Open the fly.dev dashboard and go to the machine page → “machines” in the sidebar → your machine name → monitoring

### Production

- `yarn deploy:production`
- Update _APP_IMAGE_ID_ in .env.production
- `yarn machines:update:imageid:production`
- Open the fly.dev dashboard and go to the machine page → “machines” in the sidebar → your machine name → monitoring

## Scheduling

- `yarn machines:update:schedule`
- `yarn machines:start`
