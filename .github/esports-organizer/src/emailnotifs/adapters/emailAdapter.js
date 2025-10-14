import 'dotenv/config'; 
import nodemailer from "nodemailer";
import { emailConfig } from "../config/emailConfig.js";
import hbs from "nodemailer-express-handlebars";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbsOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.join(__dirname, '../templates'), // relative to adapter.js
    layoutsDir: path.join(__dirname, '../templates'),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, '../templates'),
  extName: '.hbs',
};

// -----------------------------
// Rate Limiting Setup
// -----------------------------
// Allows up to 5 emails every 10 seconds (customize as needed)
const RATE_LIMIT = { max: 5, windowMs: 10_000 };
let sentEmails = [];

// Helper function for rate limiting
function canSendEmail() {
  const now = Date.now();
  // Remove timestamps older than windowMs
  sentEmails = sentEmails.filter(ts => now - ts < RATE_LIMIT.windowMs);
  if (sentEmails.length >= RATE_LIMIT.max) {
    return false;
  }
  sentEmails.push(now);
  return true;
}

// -------------------------------------------
// Create transporter for SMTP email delivery
// -------------------------------------------
const transporter = nodemailer.createTransport({
  host: emailConfig.smtp.host,
  port: emailConfig.smtp.port,
  secure: emailConfig.smtp.secure, // false for STARTTLS
  auth: {
    user: emailConfig.smtp.auth.user,
    pass: emailConfig.smtp.auth.pass,
  },
  tls: {
    rejectUnauthorized: false, // <--- ignore self-signed certificate errors
  },
});

// Point to the templates folder
const templatesDir = path.join(__dirname, "../templates");

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".hbs",
      partialsDir: templatesDir,
      layoutsDir: templatesDir,
      defaultLayout: false,
    },
    viewPath: templatesDir,
    extName: ".hbs",
  })
);

/**
 * Send a template email.
 */
export async function sendTemplatedEmail({ to, template, context, subject }) {
  if (!emailConfig.enabled) {
    console.log(`[Email Adapter] Email sending disabled. Skipping email to ${to}`);
    return;
  }

  // Check rate limit before sending
  if (!canSendEmail()) {
    console.warn(`[Email Adapter] Rate limit reached. Email to ${to} skipped.`);
    return;
  }

  const mailOptions = {
    from: `"${context.appName || "My App"}" <${emailConfig.smtp.auth.user}>`,
    to,
    subject,
    template, // base name of file
    context,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Adapter] Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    console.error(`[Email Adapter] Error sending email to ${to}:`, error);

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= emailConfig.retry.attempts; attempt++) {
      try {
        console.log(`[Email Adapter] Retry attempt ${attempt} for ${to}`);
        const retryInfo = await transporter.sendMail(mailOptions);
        console.log(`[Email Adapter] Retry success: ${retryInfo.messageId}`);
        return retryInfo;
      } catch (retryError) {
        console.error(`[Email Adapter] Retry ${attempt} failed:`, retryError);

        // Exponential backoff delay
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, etc.
        console.log(`[Email Adapter] Waiting ${delay / 1000}s before next retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Failed to send email to ${to} after ${emailConfig.retry.attempts} attempts`);
  }
}