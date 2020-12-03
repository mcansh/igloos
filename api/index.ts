import type { NowApiHandler } from '@vercel/node';
import * as Sentry from '@sentry/node';
import { format, isAfter } from 'date-fns';
import fetch from 'node-fetch';

import { sendText } from '../lib/send-text';

import type { APIResponse } from '~/@types/api';

Sentry.init({
  dsn: 'https://2287c79cc3f9459a9e3d45378510e484@sentry.io/1832768',
});

const inventoryUrl = `/reserve/inventory?language=en-US&cacheable=1&category_id=2`;

const urls: Array<string> = [
  `https://thewhitehorseinn.checkfront.com`,
  `https://deadwoodbarandgrill.checkfront.com`,
  `https://moosepreserve.checkfront.com`,
];

const phoneNumbers = process.env.PHONE_NUMBERS?.split(',');

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
});

const dates = [23];
const humanFormattedDates = dates.map(date =>
  formatter.format(new Date(2020, 11, date))
);
const lastDay = new Date(2020, 11, dates[dates.length - 1]);

const IglooChecker: NowApiHandler = async (_req, res) => {
  const now = new Date();

  if (isAfter(now, lastDay)) {
    return res.json({ message: 'date is in the past, sadness..' });
  }

  try {
    const [whitehorse, deadwood, moose] = await Promise.all(
      urls.map(async url => {
        const promise = await fetch(`${url}${inventoryUrl}`);
        const data = await promise.json();
        return data as APIResponse;
      })
    );

    const whitehorseAvailability = dates.filter(
      date => whitehorse.calendar_data[`202012${date}`]
    );
    const deadwoodAvailability = dates.filter(
      date => deadwood.calendar_data[`202012${date}`]
    );
    const mooseAvailability = dates.filter(
      date => moose.calendar_data[`202012${date}`]
    );

    const promises: Array<ReturnType<typeof sendText>> = [];

    if (whitehorseAvailability.length) {
      const origin = urls[0];
      const dateObjects = whitehorseAvailability.map(
        date => new Date(2020, 11, date)
      );

      for (const date of dateObjects) {
        for (const phone of phoneNumbers) {
          const readable = formatter.format(date);
          const queryDate = format(date, 'yyyyMMdd');

          promises.push(
            sendText(
              `There's an opening for an Igloo at whitehorse on ${readable}!!! ${origin}/reserve/?date=${queryDate}`,
              phone
            )
          );
        }
      }
    }

    if (deadwoodAvailability.length) {
      const origin = urls[1];
      const dateObjects = deadwoodAvailability.map(
        date => new Date(2020, 11, date)
      );

      for (const date of dateObjects) {
        for (const phone of phoneNumbers) {
          const readable = formatter.format(date);
          const queryDate = format(date, 'yyyyMMdd');

          promises.push(
            sendText(
              `There's an opening for an Igloo at deadwood on ${readable}!!! ${origin}/reserve/?date=${queryDate}`,
              phone
            )
          );
        }
      }
    }

    if (mooseAvailability.length) {
      const origin = urls[2];
      const dateObjects = mooseAvailability.map(
        date => new Date(2020, 11, date)
      );

      for (const date of dateObjects) {
        for (const phone of phoneNumbers) {
          const readable = formatter.format(date);
          const queryDate = format(date, 'yyyyMMdd');

          promises.push(
            sendText(
              `There's an opening for an Igloo at moosepreserve on ${readable}!!! ${origin}/reserve/?date=${queryDate}`,
              phone
            )
          );
        }
      }
    }

    await Promise.all(promises);

    if (whitehorseAvailability.length || deadwoodAvailability.length) {
      res.setHeader('Content-Type', 'text/html');
      return res.end(`<h1>Check your phone for availability!!</h1>`);
    }

    res.setHeader('Content-Type', 'text/html');
    return res.end(
      `<h1>Sorry, no igloos are available for ${humanFormattedDates}</h1>`
    );
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    res.setHeader('Content-Type', 'text/html');
    return res.end(`<h1>Sorry, something went wrong. I'm crying my best</h1>`);
  }
};

export default IglooChecker;
