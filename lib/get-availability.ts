import type { APIResponse } from "./types/api.js";

import { dates } from "./constants.js";

export function getAvailability(apiResponse: APIResponse) {
  const availability = dates
    .filter((date) => apiResponse?.calendar_data?.[`202012${date}`])
    .map((date) => new Date(2020, 11, date));

  return availability;
}
