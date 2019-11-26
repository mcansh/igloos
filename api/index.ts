// eslint-disable-next-line import/no-extraneous-dependencies
import { NowRequest, NowResponse } from '@now/node';
import { launch } from 'puppeteer-core';
import * as Sentry from '@sentry/node';

import { sendText } from '../lib/send-text';
import { getOptions } from '../lib/get-options';

Sentry.init({
  dsn: 'https://2287c79cc3f9459a9e3d45378510e484@sentry.io/1832768',
});

const urls = new Map<string, string>([
  [
    'thewhitehorseinn.com',
    'https://thewhitehorseinn.checkfront.com/reserve/?inline=1&category_id=2&date=20191221&options=tabs&style=font-family%3A%20tahoma&provider=droplet&ssl=1&src=https%3A%2F%2Fwww.thewhitehorseinn.com&1574728158411#D20191221',
  ],
  [
    'campticonderoga.com',
    'https://campticonderoga.checkfront.com/reserve/?inline=1&date=20191221&options=category_select&style=font-family%3A%20tahoma&provider=droplet&ssl=1&src=https%3A%2F%2Fcampticonderoga.com&1574626041874#',
  ],
]);

const isDev = process.env.NOW_REGION === 'dev1';

const IglooChecker = async (req: NowRequest, res: NowResponse) => {
  const url =
    urls.get(Array.isArray(req.query.url) ? req.query.url[0] : req.query.url) ??
    'https://campticonderoga.checkfront.com/reserve/?inline=1&date=20191221&options=category_select&style=font-family%3A%20tahoma&provider=droplet&ssl=1&src=https%3A%2F%2Fcampticonderoga.com&1574626041874#';

  const now = new Date();
  const lastDay = new Date(2019, 11, 21);
  const date = lastDay.toLocaleDateString('en', {
    month: 'long',
    day: 'numeric',
  });

  if (now > lastDay) {
    return res.json({ message: 'date is in the past, sadness..' });
  }

  const options = await getOptions(isDev);
  const browser = await launch(options);
  const page = await browser.newPage();

  await page.goto(url);

  const available = await page.$('.cf-item-status.AVAILABLE');

  if (available) {
    const promises = [];
    for (const number of JSON.parse(process.env.IGLOO_PHONE)) {
      promises.push(
        sendText(`There's an opening for an Igloo on ${date}!!! ${url}`, number)
      );
    }
    await Promise.all(promises);

    await browser.close();

    res.setHeader('Content-Type', 'text/html');
    return res.end(
      `<h1><a href="${url}">There's an opening for an Igloo on ${date}!!</a></h1>`
    );
  }

  await browser.close();
  res.setHeader('Content-Type', 'text/html');
  return res.end(`<h1>Sorry, no igloos available for ${date}`);
};

export default IglooChecker;
