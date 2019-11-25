/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly IGLOO_TWILIO_SID: string;
    readonly IGLOO_TWILIO_TOKEN: string;
    readonly IGLOO_TWILIO_NUMBER: string;
  }
}
