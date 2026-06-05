import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  transport: isProduction
    ? undefined
    : {
        target: "pino/file",
        options: { destination: 1 }, // stdout
      },
  redact: {
    paths: ["req.headers.cookie", "req.headers.authorization", "body.password", "body.password_hash"],
    censor: "[REDACTED]",
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.ip,
    }),
    err: pino.stdSerializers.err,
  },
});

export default logger;
