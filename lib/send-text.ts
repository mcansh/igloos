import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;

const client = new Twilio(accountSid, authToken);

const sendText = (message: string, to: string) =>
  client.messages.create({
    body: message,
    from: twilioNumber,
    to,
  });

export { sendText };
