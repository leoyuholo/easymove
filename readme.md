# easymove coding test

## Deployment
** Prerequisite**: Need to have [docker](https://store.docker.com/editions/community/docker-ce-server-ubuntu/plans/docker-ce-server-ubuntu-tier?tab=instructions) and [docker-compose](https://docs.docker.com/compose/install/) ](https://docs.docker.com/compose/) installed on system.

** Prerequisite**: Need [Google Maps](https://developers.google.com/maps/) API key to compute shortest route.

First, edit `docker-compose.yaml` to modify the environment variable `GOOGLE_MAPS_API_KEY`, change it to a valid Google Maps API key.

Then, run `docker-compose up` to spin up a fully functional HTTP endpoint.

For endpoint specification, please refer to the [original challenge specification](https://github.com/lalamove/challenge/blob/4a15d3e9480531b8e79fac418a2ea78f8b57efe4/backend.md).

To spin up more workers, run `docker-compose up --scale worker=3`, feel free to set 3 to any positive numbers you want.

## Development
You can utilize the scripts in `package.json` to further develop this project.

- To run test, run `npm run test`.
- To lint code, run `npm run lint`.
- To run coverage, run `npm run coverage` and check the generated `coverage/lcov-report` directory.
- To watch file changes and restart automatically, run `npm run dev`
- To watch file changes and run test automatically, run `npm run test-watch`

To avoid inconsistent development environment, you are recommended to do development with [docker](https://store.docker.com/editions/community/docker-ce-server-ubuntu/plans/docker-ce-server-ubuntu-tier?tab=instructions) and [docker-compose](https://docs.docker.com/compose/install/) on Ubuntu.

To start development, simplily run `docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up` to spin up the development environment. You may edit `docker-compose.dev.yaml` to run different scripts.

To run end to end test, simplily run `docker-compose -f docker-compose.yaml -f docker-compose.e2e.yaml up` to spin up the end to end test environment.
