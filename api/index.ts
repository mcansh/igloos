import { format as formatUrl } from 'url';

import type { NowApiHandler } from '@vercel/node';
import * as Sentry from '@sentry/node';
import { format, isAfter } from 'date-fns';
import fetch from 'node-fetch';

import { sendText } from '../lib/send-text';
import type { APIResponse } from '../@types/api';
import { getAvailability } from '../lib/get-availability';
import {
  dateFormatter,
  humanFormattedDates,
  lastDay,
  listFormatter,
  phoneNumbers,
} from '../lib/constants';
import { createPage } from '../lib/create-page';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const inventoryUrl = formatUrl({
  pathname: '/reserve/inventory',
  query: {
    filter_item_id: '',
    customer_id: '',
    original_start_date: '',
    original_end_date: '',
    date: format(lastDay, 'yyyy-MM-dd'),
    language: '',
    cacheable: 1,
    category_id: 2,
    view: '',
    start_date: format(lastDay, 'yyyy-MM-dd'),
    end_date: format(lastDay, 'yyyy-MM-dd'),
    'cf-month': format(new Date(), 'yyyy-MM-dd'),
  },
});

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

    const messages = datesAvailable
      .map(o =>
        Object.entries(o)
          .map(([place, dates]) =>
            dates.map(date => {
              const readable = dateFormatter.format(date);
              const queryDate = format(date, 'yyyyMMdd');
              const base = urls.find(u => u.includes(place));
              const url = `${base}/reserve?date=${queryDate}`;
              return {
                url,
                date,
                readableDate: readable,
                place,
                message: `There's an opening for an Igloo at ${place} on ${readable}!!!`,
              };
            })
          )
          .flat()
      )
      .flat();

    if (messages.length > 0) {
      const textMessages = messages
        .map(message => `${message.message} ${message.url}`)
        .join('\n\n');

      const promises = phoneNumbers.map(phone => sendText(textMessages, phone));

      await Promise.all(promises);

      const html = createPage(`
        <h1 class="mb-2 text-2xl text-purple-500">There are igloos available!</h1>
        <ul class="list-disc text-lg px-4">
          ${messages.map(
            message => `
              <li>
                ${message.message} - <a class="text-purple-500" href="${message.url}">Book now!</a>
              </li>
            `
          )}
        </ul>
      `);
      res.setHeader('Content-Type', 'text/html');
      return res.end(html);
    }

    const html = createPage(`
      <h1>Sorry, no igloos are available for ${listFormatter.format(
        humanFormattedDates
      )}</h1>
    `);
    res.setHeader('Content-Type', 'text/html');
    return res.end(html);
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    res.setHeader('Content-Type', 'text/html');
    return res.end(
      createPage(`<h1>Sorry, something went wrong. I'm crying my best</h1>`)
    );
  }
};

export default IglooChecker;
