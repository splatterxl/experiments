import * as Sentry from "@sentry/node";
import { DiscordjsErrorCodes } from "discord.js";
import { __DEV__ } from "./util.js";

// Ensure to call this before importing any other modules!
Sentry.init({
  enabled: !__DEV__,

  dsn: "https://f6dc910d06a442c08251d608ff160fe7@o917511.ingest.us.sentry.io/4504746769514496",
  integrations: [],

  beforeSend(event, hint) {
    if (__DEV__) return null;

    if (
      // @ts-ignore
      [DiscordjsErrorCodes.InteractionAlreadyReplied].includes(event.code) ||
      event.message?.toLowerCase().includes("unknown interaction")
    )
      return null;

    return event;
  },
});
