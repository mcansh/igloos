/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly TWILIO_SID: string;
    readonly TWILIO_TOKEN: string;
    readonly TWILIO_NUMBER: string;
    readonly PHONE_NUMBERS: string;
  }
}
