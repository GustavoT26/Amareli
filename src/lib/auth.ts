import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export function configuredAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return configuredAdminEmails().includes(email.trim().toLowerCase());
}

export const googleAuthConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const authBaseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = prisma && process.env.BETTER_AUTH_SECRET
  ? betterAuth({
      appName: "Amareli",
      baseURL: authBaseUrl,
      trustedOrigins: [...new Set([authBaseUrl, ...trustedOrigins])],
      secret: process.env.BETTER_AUTH_SECRET,
      database: prismaAdapter(prisma, { provider: "postgresql" }),
      socialProviders: googleAuthConfigured ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          requireEmailVerification: true,
        },
      } : {},
      user: {
        validateUserInfo: ({ user }) => {
          if (!isAdminEmail(user.email ?? "")) {
            return {
              error: "email_not_allowed",
              errorDescription: "Esta conta Google não está autorizada a acessar o painel administrativo.",
            };
          }
        },
      },
      advanced: {
        cookiePrefix: "amareli",
      },
    })
  : null;
