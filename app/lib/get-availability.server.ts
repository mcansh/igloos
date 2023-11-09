import { format } from "date-fns";
import { z } from "zod";

import { DATES, MONTH, YEAR } from "./constants.server.js";

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

export let urls: Array<string> = [`https://thewhitehorseinn.checkfront.com`];

export function getReservationUrl(base: string, date: Date) {
  let queryDate = format(date, "yyyyMMdd");
  let url = new URL("/reserve", base);
  let searchParams = new URLSearchParams({ date: queryDate });
  url.search = searchParams.toString();
  return url.toString();
}

export function getInventoryUrl(
  base: string,
  startDate: Date,
  endDate: Date = startDate,
) {
  let searchParams = new URLSearchParams({
    filter_item_id: "",
    customer_id: "",
    original_start_date: "",
    original_end_date: "",
    date: format(startDate, "yyyy-MM-dd"),
    language: "",
    cacheable: "1",
    category_id: "2",
    view: "",
    start_date: format(startDate, "yyyy-MM-dd"),
    end_date: format(endDate, "yyyy-MM-dd"),
    "cf-month": format(new Date(), "yyyy-MM-dd"),
  });

  let url = new URL("/reserve/inventory", base);
  url.search = searchParams.toString();
  return url.toString();
}
