import TwilioPkg from "twilio";

import { env } from "./constants.server.js";

const { Twilio } = TwilioPkg;

const client = new Twilio(env.TWILIO_SID, env.TWILIO_TOKEN);

export function sendText(message: string, to: string) {
  client.messages.create({
    body: message,
    from: env.TWILIO_NUMBER,
    to,
  });
}
