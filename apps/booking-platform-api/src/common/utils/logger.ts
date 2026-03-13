import crypto from "crypto";
import { env } from "../../config/env";

type LogLevel = "debug" | "info" | "error";

interface LogContext {
  [key: string]: unknown;
}

function shouldLog(level: LogLevel): boolean {
  const configured = (env.nodeEnv || "development").toLowerCase();
  if (configured === "production") {
    return level === "info" || level === "error";
  }
  return true;
}

function generateCorrelationId(): string {
  return crypto.randomUUID();
}

function baseLog(level: LogLevel, correlationId: string | undefined, message: string, context?: LogContext): void {
  if (!shouldLog(level)) {
    return;
  }

  const time = new Date().toISOString();
  const payload: Record<string, unknown> = {level, time, correlationId: correlationId || generateCorrelationId(), message };

  if (context && Object.keys(context).length > 0) {
    Object.assign(payload, context);
  }

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug(correlationId: string | undefined, message: string, context?: LogContext): void {
    baseLog("debug", correlationId, message, context);
  },
  info(correlationId: string | undefined, message: string, context?: LogContext): void {
    baseLog("info", correlationId, message, context);
  },
  error(correlationId: string | undefined, message: string, context?: LogContext): void {
    baseLog("error", correlationId, message, context);
  },
};