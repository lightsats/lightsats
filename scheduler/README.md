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
- _TODO: delete old machine if there is one_
- `yarn deploy`
- Add _APP_IMAGE_ID_ to .env (see .env.example)
- `yarn machines:create`
- `yarn machines:list`
- Add _$MACHINE_ID_ to .env

## Further Deployments

- `yarn deploy`
- _TODO: update fly machine_
- Open the fly.dev dashboard and go to the machine page → “machines” in the sidebar → your machine name → monitoring
- `yarn machines:start`

## Scheduling

- _TODO: update machine to be scheduled daily_
