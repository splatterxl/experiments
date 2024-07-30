import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { __DEV__ } from "./util.js";

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: "https://f6dc910d06a442c08251d608ff160fe7@o917511.ingest.us.sentry.io/4504746769514496",
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: __DEV__ ? 1.0 : 0.1,
});
