import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { MetaFunction, json } from "@vercel/remix";
import { format, isAfter } from "date-fns";

import {
  dateFormatter,
  env,
  humanFormattedDates,
  lastDay,
  listFormatter,
} from "~/lib/constants";
import { availabilitySchema, getAvailability } from "~/lib/get-availability";
import { sendText } from "~/lib/send-text";

export const meta: MetaFunction = () => {
  return [{ title: "Igloo Availability Checker" }];
};

export async function loader() {
  let now = new Date();

  if (isAfter(now, lastDay)) {
    throw new Response("date is in the past, sadness..", { status: 422 });
  }

  let urls: Array<string> = [`https://thewhitehorseinn.checkfront.com`];

  let searchParams = new URLSearchParams({
    filter_item_id: "",
    customer_id: "",
    original_start_date: "",
    original_end_date: "",
    date: format(lastDay, "yyyy-MM-dd"),
    language: "",
    cacheable: "1",
    category_id: "2",
    view: "",
    start_date: format(lastDay, "yyyy-MM-dd"),
    end_date: format(lastDay, "yyyy-MM-dd"),
    "cf-month": format(new Date(), "yyyy-MM-dd"),
  });

  let payloads = await Promise.all(
    urls.map(async (domain) => {
      let url = new URL("/reserve/inventory", domain);
      url.search = searchParams.toString();
      let promise = await fetch(url);
      let data = await promise.json();
      let result = availabilitySchema.parse(data);
      return result;
    }),
  );

  let datesAvailable = payloads.reduce(
    (acc: Array<{ [key: string]: Array<Date> }>, payload, index) => {
      let availability = getAvailability(payload);
      let url = urls.at(index);
      if (!url) {
        console.error(`No url found for index ${index}`);
        return acc;
      }
      return [...acc, { [url]: availability }];
    },
    [],
  );

  let messages = datesAvailable
    .map((o) =>
      Object.entries(o)
        .map(([place, dates]) =>
          dates.map((date) => {
            let readable = dateFormatter.format(date);
            let queryDate = format(date, "yyyyMMdd");
            let base = urls.find((u) => u.includes(place));
            let url = `${base}/reserve?date=${queryDate}`;
            return {
              url,
              date,
              readableDate: readable,
              place,
              message: `There's an opening for an Igloo at ${place} on ${readable}!!!`,
            };
          }),
        )
        .flat(),
    )
    .flat();

  if (messages.length === 0) {
    return json({
      messages: [],
      dates: listFormatter.format(humanFormattedDates),
    });
  }

  let textMessages = messages
    .map((message) => `${message.message} ${message.url}`)
    .join("\n\n");

  let promises = env.PHONE_NUMBERS.map((phone) =>
    sendText(textMessages, phone),
  );

  await Promise.all(promises);

  return json({ messages, dates: listFormatter.format(humanFormattedDates) });
}

export default function RunPage() {
  let data = useLoaderData<typeof loader>();

  if (data.messages.length === 0) {
    return <h1>Sorry, no igloos are available for {data.dates}</h1>;
  }

  return (
    <>
      <h1 className="mb-2 text-2xl text-purple-500">
        There are igloos available!
      </h1>
      <ul className="list-disc px-4 text-lg">
        {data.messages.map((message) => (
          <li key={message.readableDate + message.place}>
            ${message.message} -{" "}
            <a className="text-purple-500" href="${message.url}">
              Book now!
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ErrorBoundary() {
  let error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 422) {
      return (
        <div>
          <h1 className="text-2xl text-purple-400">{error.data}</h1>
        </div>
      );
    } else {
      return (
        <div>
          <h1 className="text-2xl text-purple-400">
            {error.status} | {error.statusText}
          </h1>
        </div>
      );
    }
  }

  if (error instanceof Error) {
    return (
      <div>
        <h1 className="text-2xl text-purple-400">Something Went Wrong</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl text-purple-400">Something Went Wrong</h1>
      <p>Unknown error</p>
    </div>
  );
}
