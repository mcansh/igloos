/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly IGLOO_TWILIO_SID: string;
    readonly IGLOO_TWILIO_TOKEN: string;
    readonly IGLOO_TWILIO_NUMBER: string;
    readonly IGLOO_PHONE: string; // really an array of strings
  }
}
