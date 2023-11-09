import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type {
  ActionFunctionArgs,
  MetaFunction,
  LoaderFunctionArgs,
} from "@vercel/remix";
import { json, redirect } from "@vercel/remix";
import { isAfter } from "date-fns";

import {
  dateFormatter,
  env,
  humanFormattedDates,
  lastDay,
  listFormatter,
} from "~/lib/constants.server";
import {
  availabilitySchema,
  getAvailability,
  getInventoryUrl,
  getReservationUrl,
  urls,
} from "~/lib/get-availability.server";
import { sendText } from "~/lib/send-text.server";
import { getSession, sessionStorage } from "~/lib/session.server";

export async function action({ request }: ActionFunctionArgs) {
  let session = await getSession(request);
  let formData = await request.formData();

  let intent = formData.get("intent");

  let now = new Date();

  if (isAfter(now, lastDay)) {
    throw new Response("date is in the past, sadness..", { status: 422 });
  }

  let payloads = await Promise.all(
    urls.map(async (domain) => {
      let url = getInventoryUrl(domain, lastDay);
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

  let messages = datesAvailable.flatMap((places) => {
    return Object.entries(places).flatMap(([place, dates]) => {
      return dates.map((date) => {
        let readable = dateFormatter.format(date);
        let reservationUrl = getReservationUrl(place, date);
        return {
          url: reservationUrl,
          date,
          readableDate: readable,
          place,
          message: `There's an opening for an Igloo at ${place} on ${readable}!!!`,
        };
      });
    });
  });

  if (messages.length === 0) {
    session.flash("messages", []);
    session.flash("dates", listFormatter.format(humanFormattedDates));
    return redirect("/", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }

  if (intent !== "manual") {
    let textMessages = messages
      .map((message) => `${message.message} ${message.url}`)
      .join("\n\n");

    await Promise.all(
      env.PHONE_NUMBERS.map((phone) => {
        return sendText(textMessages, phone);
      }),
    );
  }

  session.flash("messages", messages);
  session.flash("dates", listFormatter.format(humanFormattedDates));
  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  let session = await getSession(request);
  let messages = session.get("messages");
  let dates = session.get("dates");

  return json(
    {
      messages,
      dates,
      urls: urls.map((domain) => getReservationUrl(domain, lastDay)),
    },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } },
  );
}

export const meta: MetaFunction = () => {
  return [{ title: "Igloo Availability Checker" }];
};

export default function Index() {
  let data = useLoaderData<typeof loader>();

  if (data.messages) {
    if (data.messages.length === 0) {
      return <h1>Sorry, no igloos are available for {data.dates}</h1>;
    }

    return (
      <>
        <h1 className="mb-2 text-2xl font-semibold text-indigo-500">
          There are igloos available!
        </h1>

        <ul className="list-disc px-4 text-lg">
          {data.messages.map((message) => (
            <li key={message.readableDate + message.place}>
              {message.message}
              {" - "}
              <a
                className="font-semibold text-indigo-500 underline"
                href={message.url}
              >
                Book now!
              </a>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-indigo-500">
        Find an available igloo!
      </h1>
      <p>
        By default this runs automatically every 15 minutes via a{" "}
        <a
          href="https://github.com/mcansh/igloos/actions?query=workflow%3A%22check+for+igloos%22"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo-500 underline"
        >
          GitHub Action
        </a>
        .
      </p>

      <Form method="post" className="inline">
        <p>
          If you'd like to manually check availability, you can do so by{" "}
          <button
            type="submit"
            className="font-medium text-indigo-500 underline"
            name="intent"
            value="manual"
          >
            running it
          </button>
        </p>
      </Form>

      <p>Don't believe me? check for yourself</p>
      <ul className="list-disc px-4 text-lg">
        {data.urls.map((url) => {
          let domain = new URL(url).hostname;
          return (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-500 underline"
              >
                {domain}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ErrorBoundary() {
  let error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 422) {
      return (
        <div>
          <h1 className="text-2xl text-indigo-400">{error.data}</h1>
        </div>
      );
    } else {
      return (
        <div>
          <h1 className="text-2xl text-indigo-400">
            {error.status} | {error.statusText}
          </h1>
        </div>
      );
    }
  }

  if (error instanceof Error) {
    return (
      <div>
        <h1 className="text-2xl text-indigo-400">Something Went Wrong</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl text-indigo-400">Something Went Wrong</h1>
      <p>Unknown error</p>
    </div>
  );
}
