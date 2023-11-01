import { z } from "zod";

let envSchema = z.object({
  PHONE_NUMBERS: z.string().transform((val) => val.split(",")),
  SENTRY_DSN: z.string().url(),
  TWILIO_SID: z.string().min(1),
  TWILIO_TOKEN: z.string().min(1),
  TWILIO_NUMBER: z.string().min(1),
});

export let env = envSchema.parse(process.env);

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
});

export const dates = [23];

export const humanFormattedDates = dates.map((date) =>
  dateFormatter.format(new Date(2020, 11, date)),
);

export const lastDay = new Date(2020, 11, dates.at(-1));
export const firstDay = new Date(2020, 11, dates.at(0));

export const listFormatter = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction",
});
