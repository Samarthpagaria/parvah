// config/mailer.js
// Resend client initialization
// Docs: https://resend.com/docs/send-with-nodejs

const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is missing from environment variables.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// The "from" address — must be a verified domain in your Resend dashboard
// For development/testing you can use: onboarding@resend.dev
const FROM_EMAIL =
  process.env.FROM_EMAIL || "CivicTrack <onboarding@resend.dev>";

module.exports = { resend, FROM_EMAIL };
