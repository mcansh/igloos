import type { NowApiHandler } from '@vercel/node';
import * as Sentry from '@sentry/node';
import { format, isAfter } from 'date-fns';
import fetch from 'node-fetch';

import { sendText } from '../lib/send-text';
import type { APIResponse } from '../@types/api';
import { getAvailability } from '../lib/get-availability';
import {
  dateFormatter,
  firstDay,
  humanFormattedDates,
  lastDay,
  listFormatter,
  phoneNumbers,
} from '../lib/constants';

Sentry.init({
  dsn: 'https://2287c79cc3f9459a9e3d45378510e484@sentry.io/1832768',
});

const inventoryUrl = `/reserve/inventory/?options=category_select&ssl=1&provider=droplet&filter_item_id=&customer_id=&original_start_date=&original_end_date=&date=${format(
  new Date(),
  'yyyy-MM-dd'
)}&language=&cacheable=1&view=&category_id=1&start_date=${format(
  firstDay,
  'yyyy-MM-dd'
)}&end_date=${format(lastDay, 'yyyy-MM-dd')}&keyword=&cf-month=20201203`;

const urls: Array<string> = [
  `https://thewhitehorseinn.checkfront.com`,
  `https://deadwoodbarandgrill.checkfront.com`,
  `https://moosepreserve.checkfront.com`,
];

const IglooChecker: NowApiHandler = async (_req, res) => {
  const now = new Date();

  if (isAfter(now, lastDay)) {
    return res.json({ message: 'date is in the past, sadness..' });
  }

  try {
    const payloads = await Promise.all(
      urls.map(async url => {
        const promise = await fetch(`${url}${inventoryUrl}`);
        const data = await promise.json();
        return data as APIResponse;
      })
    );

    const datesAvailable = payloads.reduce(
      (acc: Array<{ [key: string]: Array<Date> }>, payload, index) => {
        const availability = getAvailability(payload);
        const url = new URL(urls[index]);
        const [base] = url.hostname.split('.checkfront.com');
        return [...acc, { [base]: availability }];
      },
      []
    );

    const message = datesAvailable
      .map(o =>
        Object.entries(o)
          .map(([place, dates]) =>
            dates.map(date => {
              const readable = dateFormatter.format(date);
              const queryDate = format(date, 'yyyyMMdd');
              const base = urls.find(u => u.includes(place));
              return `There's an opening for an Igloo at whitehorse on ${readable}!!! ${base}/reserve?date=${queryDate}`;
            })
          )
          .flat()
      )
      .flat()
      .join('\n\n');

    const promises = phoneNumbers.map(phone => sendText(message, phone));

    await Promise.all(promises);

    const [whitehorse, deadwood, moose] = payloads;
    const whitehorseAvailability = getAvailability(whitehorse);
    const deadwoodAvailability = getAvailability(deadwood);
    const mooseAvailability = getAvailability(moose);
    if (
      whitehorseAvailability.length ||
      deadwoodAvailability.length ||
      mooseAvailability.length
    ) {
      res.setHeader('Content-Type', 'text/html');
      return res.end(`<h1>Check your phone for availability!!</h1>`);
    }

    res.setHeader('Content-Type', 'text/html');
    return res.end(
      `<h1>Sorry, no igloos are available for ${listFormatter.format(
        humanFormattedDates
      )}</h1>`
    );
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    res.setHeader('Content-Type', 'text/html');
    return res.end(`<h1>Sorry, something went wrong. I'm crying my best</h1>`);
  }
};

export default IglooChecker;
