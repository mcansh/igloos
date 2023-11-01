import { z } from "zod";

import { DATES, MONTH, YEAR } from "./constants.js";

export let availabilitySchema = z.object({
  date_str: z.string(),
  end_date: z.string(),
  start_date: z.string(),
  local_start_date: z.string(),
  local_end_date: z.string(),
  inventory: z.string(),
  calendar: z.string(),
  calendar_data: z.record(z.string(), z.number()),
});

export type Availability = z.infer<typeof availabilitySchema>;

export function getAvailability(availability: Availability) {
  return DATES.filter((date) => {
    // this month is 1 indexed
    return availability?.calendar_data?.[`${YEAR}${MONTH + 1}${date}`];
  }).map((date) => new Date(YEAR, 11, date));
}
