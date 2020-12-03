import { toDate } from 'date-fns';

import type { APIResponse } from '../@types/api';

import { dates } from './constants';

function getAvailability(apiResponse: APIResponse) {
  const availability = dates
    .filter(date => apiResponse?.calendar_data?.[`202012${date}`])
    .map(date => toDate(Date.UTC(2020, 11, date)));

  return availability;
}

export { getAvailability };
