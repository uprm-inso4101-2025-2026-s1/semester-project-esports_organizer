export const emailConfig = {
  enabled: process.env.EMAIL_ENABLED === "true" || true,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  retry: {
    attempts: Number(process.env.EMAIL_RETRY_ATTEMPTS),
    factor: Number(process.env.EMAIL_RETRY_FACTOR),
    minTimeout: Number(process.env.EMAIL_RETRY_MIN_MS)
  },
  rateLimit: {
    maxConcurrent: Number(process.env.EMAIL_MAX_CONCURRENT),
    minTime: Number(process.env.EMAIL_MIN_TIME_MS)
  }
};
