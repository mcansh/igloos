import type { APIResponse } from "./types/api.js";

import { DATES, MONTH, YEAR } from "./constants.js";

export function getAvailability(apiResponse: APIResponse) {
  const availability = DATES.filter(
    (date) => {
      // this month is 1 indexed
      return apiResponse?.calendar_data?.[`${YEAR}${MONTH+1}${date}`]
    },
  ).map((date) => new Date(YEAR, 11, date));

  return availability;
}
