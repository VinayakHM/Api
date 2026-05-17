# REST API Automation Framework (TypeScript)

A scalable, modular API test framework built on *Playwright Test* + *Zod*, with structured logging, multi-env config, and HTML / JUnit / Allure reporting.

## Stack

| Concern | Library | Why |
| --- | --- | --- |
| Test runner | @playwright/test | Parallel by default, retries, traces, rich reporting |
| HTTP client | Playwright APIRequestContext | Built-in, traced, no extra dependency |
| Schema validation | zod | TS-first; runtime check + compile-time type from one source |
| Test data | @faker-js/faker | Realistic, randomized payloads |
| Logging | winston | Structured logs with levels |
| Config | dotenv + per-env map | TEST_ENV=staging switches base URL, timeouts, retries |
| Reporting | Playwright HTML + JUnit + Allure | Local + CI + stakeholder dashboards |

## Project layout


.
├── src/
│   ├── clients/         # HTTP clients (one per resource). Extend BaseClient.
│   │   ├── base.client.ts
│   │   ├── users.client.ts
│   │   └── posts.client.ts
│   ├── schemas/         # Zod schemas — source of truth for shape + types
│   ├── fixtures/        # Custom Playwright fixtures (auto-inject clients)
│   ├── config/          # env.ts + environments.ts (dev/staging/prod)
│   ├── utils/           # assertions, logger, data-builder
│   └── types/           # shared HTTP types
├── tests/               # *.spec.ts — one file per feature area
├── playwright.config.ts
├── tsconfig.json
└── package.json


## Setup

bash
npm install
cp .env.example .env       # optional — defaults work out of the box
npm test


## Run

bash
npm test                          # full suite
npm run test:smoke                # only @smoke tagged
npm run test:regression           # only @regression tagged
npm run test:dev                  # TEST_ENV=dev
npm run test:staging              # TEST_ENV=staging
npx playwright test tests/users.spec.ts -g "creates a user"
npm run test:debug                # Playwright inspector


## Reports

bash
npm run report           # Playwright HTML
npm run report:allure    # Allure (requires `allure` CLI installed globally)


JUnit XML lands in reports/junit.xml for CI ingestion.

## The three validation pillars

Every response is checked against the same contract. Use validateResponse for the common case (status + schema), and add assertData / assertResponseTime for business rules and SLOs.

ts
import { validateResponse, assertData, assertResponseTime } from '../src/utils/assertions';
import { userSchema } from '../src/schemas/user.schema';

const response = await usersClient.getById(1);

// 1. Status        2. Schema
const user = validateResponse(response, 200, userSchema);

// 3. Data integrity (business rules)
assertData(response, { id: 1 });
assertResponseTime(response, 2000);


## Adding a new endpoint (team workflow)

1. *Schema* — add a Zod schema in src/schemas/<resource>.schema.ts. Export the inferred TS type.
2. *Client* — add a method on the resource's client (or create a new client extending BaseClient).
3. *Fixture* — if you added a new client, register it in src/fixtures/api.fixtures.ts.
4. *Test* — write a *.spec.ts under tests/. Pull the client from the fixture, call it, and validate with validateResponse.

That's the whole flow — schema once, client thin, test thin.

## Environment configuration

src/config/environments.ts defines dev, staging, prod (base URL, timeout, retries).
TEST_ENV selects the active one. Anything in .env overrides per-env defaults.

bash
TEST_ENV=staging BASE_URL=https://api.staging.internal npm test


## Authentication

BaseClient.authHeaders() injects Authorization: Bearer <AUTH_TOKEN> and x-api-key: <API_KEY> when those env vars are set. Override per-request via options.headers if needed.

## CI

The framework is CI-ready:

- forbidOnly: true when CI=true (no accidental .only)
- retries: 2 and workers: 4 in CI mode
- JUnit output at reports/junit.xml
- Allure results at allure-results/

Example GitHub Actions step:

yaml
- run: npm ci
- run: npx playwright install --with-deps
- run: npm test
  env:
    CI: 'true'
    TEST_ENV: staging
    AUTH_TOKEN: ${{ secrets.AUTH_TOKEN }}


## Tags

Use Playwright's --grep to slice the suite by tag. Conventions:

- @smoke — runs on every PR (fast happy-path)
- @regression — runs nightly (full coverage)

Add tags inside test.describe or test titles: test('creates a user @regression', ...).

## Conventions

- *One client per resource.* Domain methods stay thin; complex logic belongs in utils.
- *Schemas are the contract.* Don't duplicate types — always z.infer<typeof schema>.
- *Tests use fixtures.* Never new UsersClient() directly in a spec.
- *Tag everything.* Untagged tests run in the default suite only.