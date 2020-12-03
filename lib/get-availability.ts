import type { APIResponse } from '../@types/api';

import { dates } from './constants';

function getAvailability(apiResponse: APIResponse) {
  const availability = dates
    .filter(date => apiResponse?.calendar_data?.[`202012${date}`])
    .map(date => new Date(2020, 11, date));

  return availability;
}

export { getAvailability };
