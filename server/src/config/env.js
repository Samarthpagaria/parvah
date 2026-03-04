const { z } = require("zod");

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Supabase
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  SUPABASE_JWT_SECRET: z.string().min(1, "SUPABASE_JWT_SECRET is required"),
  // Frontend
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Invite token
  INVITE_TOKEN_SECRET: z
    .string()
    .min(16, "INVITE_TOKEN_SECRET must be at least 16 characters"),

  // Email (optional during development)
  RESEND_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("src/config/env.js: Invalid environment variables:");
  parsed.error.issues.forEach((issue) => console.error(`  • ${issue.message}`));
  process.exit(1);
}

module.exports = parsed.data;

console.log("src/config/env.js: Environment variables validated");
