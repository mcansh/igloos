import { createCookieSessionStorage } from "@remix-run/node"; // or cloudflare/deno

import { env } from "./constants.server";

type SessionFlashData = {
  dates: string;
  messages: Array<{
    url: string;
    date: Date;
    readableDate: string;
    place: string;
    message: string;
  }>;
};

export let sessionStorage = createCookieSessionStorage<null, SessionFlashData>({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60,
    path: "/",
    sameSite: "lax",
    secrets: env.SESSION_SECRETS,
    secure: process.env.NODE_ENV === "production",
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}
