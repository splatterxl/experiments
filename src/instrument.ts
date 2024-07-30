import * as Sentry from "@sentry/node";
import { DiscordjsErrorCodes } from "discord.js";
import { __DEV__ } from "./util.js";

// Ensure to call this before importing any other modules!
Sentry.init({
  enabled: !__DEV__,

  dsn:
    process.env.SENTRY_DSN ??
    "https://352f8e9b23364aa284aaf79fd69cf727@o917511.ingest.us.sentry.io/4504368705830912",
  integrations: [],

  beforeSend(event, hint) {
    if (__DEV__) return null;

    if (
      [
        DiscordjsErrorCodes.InteractionAlreadyReplied,
        10062 /* Unknown interaction */,
      ].includes(
        // @ts-ignore
        event.code
      ) ||
      event.message?.toLowerCase().includes("unknown interaction")
    )
      return null;

    return event;
  },
});
