import { createLogger, format, transports } from "winston";
import { env } from "../config/env";

export const logger = createLogger({
  level: env.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.errors(),
    format.splat(),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const extra = Object.keys(meta).length ? `${JSON.stringify(meta)}` : "";
      return `[${timestamp}]${level.toUpperCase()} ${message}${extra}`;
    }),
  ),
  transports: [new transports.Console()],
});
