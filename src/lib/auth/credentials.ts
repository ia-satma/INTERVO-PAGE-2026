import { z } from "zod";

/**
 * The administration panel intentionally uses one authentication factor:
 * email plus password. Strict parsing prevents obsolete security-code fields from
 * silently reappearing in clients.
 */
export const loginInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1).max(256),
  })
  .strict();
