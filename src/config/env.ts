import * as dotenv from "dotenv";
import { environments, EnvName, EnvironmentConfig } from "./environments";

dotenv.config();

const activeEnv = (process.env.TEST_ENV ?? "dev") as EnvName;

if (!environments[activeEnv]) {
  throw new Error(
    `Unknown TEST_ENV "${activeEnv}". Valid values: ${Object.keys(environments).join(",")}`,
  );
}

const base: EnvironmentConfig = environments[activeEnv];

export const env = {
  NAME: activeEnv,
  BASE_URL: process.env.BASE_URL ?? base.baseUrl,
  TIMEOUT: Number(process.env.TIMEOUT ?? base.timeout),
  RETRIES: Number(process.env.RETRIES ?? base.retries),
  API_KEY: process.env.API_KEY ?? "",
  AUTH_TOKEN: process.env.AUTH_TOKEN ?? "info",
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
} as const;
