export type EnvName = "dev" | "staging" | "prod";

export interface EnvironmentConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export const environments: Record<EnvName, EnvironmentConfig> = {
  dev: {
    baseUrl: "https://jsonplaceholder.typicode.com",
    timeout: 15_000,
    retries: 0,
  },
  staging: {
    baseUrl: "https://jsonplaceholder.typicode.com",
    timeout: 20_000,
    retries: 1,
  },
  prod: {
    baseUrl: "https://jsonplaceholder.typicode.com",
    timeout: 30_000,
    retries: 2,
  },
};
