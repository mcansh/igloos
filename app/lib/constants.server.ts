import { z } from "zod";
import { endOfDay, startOfDay } from "date-fns";

let envSchema = z.object({
  PHONE_NUMBERS: z.string().transform((val) => val.split(",")),
  SENTRY_DSN: z
    .string()
    .url()
    .optional()
    .refine((v) => {
      if (process.env.NODE_ENV === "production") {
        return v !== undefined;
      }
      return true;
    }),
  TWILIO_SID: z.string().min(1),
  TWILIO_TOKEN: z.string().min(1),
  TWILIO_NUMBER: z.string().min(1),
  SESSION_SECRETS: z
    .string()
    .min(1)
    .transform((val) => val.split(",")),
});

export let env = envSchema.parse(process.env);

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

export const MONTH = 11 as const; // 0 indexed
export const DATES = [23] as const;
export const YEAR = 2023 as const;

export const humanFormattedDates = DATES.map((date) =>
  dateFormatter.format(new Date(YEAR, 11, date)),
);

export const lastDay = endOfDay(new Date(YEAR, 11, DATES.at(-1)));
export const firstDay = startOfDay(new Date(YEAR, 11, DATES.at(0)));

export const listFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction",
});
