import * as Sentry from "@sentry/node";
import {
  DiscordjsErrorCodes,
  REST,
  RESTPostAPIChannelMessageFormDataBody,
} from "discord.js";
import kleur from "kleur";
import { dirname, resolve } from "path";
import { stringify } from "yaml";
import { __DEV__, hostname } from "./util.js";

// TODO: rewrite this whole file

let rest: REST;

if (process.env.ERROR_WEBHOOK) rest = new REST({ version: "10" });

const __dirname = dirname(import.meta.url).replace(/^file:\/\//, "");

// Ensure to call this before importing any other modules!
Sentry.init({
  environment: process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.NODE_ENV,
  release: process.env.RAILWAY_GIT_COMMIT_SHA ?? undefined,

  dsn:
    process.env.SENTRY_DSN ??
    "https://352f8e9b23364aa284aaf79fd69cf727@o917511.ingest.us.sentry.io/4504368705830912",
  integrations: [],

  sampleRate: 1,

  ignoreErrors: [
    "Unknown interaction",
    DiscordjsErrorCodes.InteractionAlreadyReplied,
    "Interaction has already been",
    "nelly.tools returned",
  ],

  beforeSend(event, hint) {
    // if (__DEV__) return null;

    if (
      process.env.ERROR_WEBHOOK &&
      /* normally caught error */ (hint.originalException instanceof Error ||
        /* unhandled rejection */ hint.originalException instanceof Promise)
    ) {
      debug("sentry.beforeSend", "captured error");

      (async () => {
        const workableTags = Object.fromEntries(
          Object.entries({
            ...(event.tags ?? {}),
            ...(hint.originalException instanceof Error
              ? hint.originalException
              : hint.originalException instanceof Promise
              ? await hint.originalException.catch((res) => res)
              : {}),
          }).filter(
            ([k, v]) =>
              ![
                "guild_id",
                "guild_name",
                "replied",
                "channel_id",
                "channel_type",
                "message",
                "stack",
                "requestBody",
                "rawError",
              ].includes(k) && v
          )
        );

        rest
          .post(
            new URL(process.env.ERROR_WEBHOOK!).pathname.replace(
              /^\/api(\/v\d{1,2})?/,
              ""
            ) as `/${string}`,
            {
              body: {
                content: `🚨 ${
                  hint.mechanism?.handled === false
                    ? `Un${
                        hint.originalException instanceof Promise
                          ? "handled"
                          : "caught"
                      }`
                    : ""
                } ${
                  hint.mechanism?.type === "onunhandledrejection"
                    ? "Promise Rejection"
                    : hint.mechanism?.type === "onuncaughtexception"
                    ? "Exception"
                    : "Error"
                } \`[${hostname()}-${event.event_id}]\` ${
                  event.fingerprint
                    ? `@ \`${event.fingerprint.join("::")}\``
                    : ""
                }\n\n${
                  event.user
                    ? `Exception occured processing request from \n* user <@${
                        event.user!.id
                      }> (\`${event.user.id}\` – ${event.user.username})${
                        event.tags?.replied != null
                          ? event.tags.replied
                            ? ". Error was returned through ephemeral response."
                            : ". User could not be informed of error."
                          : ""
                      }${
                        event.tags?.guild_id
                          ? `\n* guild ${
                              event.tags!.guild_name
                                ? `**${event.tags!.guild_name.toString()}** (\`${event.tags.guild_id.toString()}\`)`
                                : `\`${event.tags!.guild_id.toString()}\``
                            }`
                          : ""
                      }${
                        event.tags?.channel_id
                          ? `\n* channel \`${event.tags.channel_id.toString()}\` (${
                              event.tags.channel_type?.toString() ?? "unknown"
                            })`
                          : ""
                      }\n\n`
                    : ""
                }${
                  Object.keys(workableTags).length
                    ? `Additional metadata:\n\`\`\`yaml\n${stringify(
                        workableTags
                      )}\n\`\`\`\n\n`
                    : ""
                }>>> ${
                  event.exception?.values?.slice(0, 5)?.map(
                    (exception) =>
                      `__**${exception.type}**: ${exception.value?.replace(
                        "\n",
                        "__\n"
                      )}${exception.value?.includes("\n") ? "" : "__"}\n-# ${
                        exception.mechanism?.type
                          ? `${exception.mechanism.type.replace(
                              /onun(handled|caught)(rejection|exception)/,
                              (_, p1, p2) =>
                                `Un${p1} ${p2[0].toUpperCase()}${p2.slice(1)}`
                            )}`
                          : exception.mechanism?.handled
                          ? "Handled"
                          : "Unhandled"
                      }\n${
                        exception.stacktrace?.frames
                          ?.reverse()
                          .slice(0, 5)
                          .map((trace, i) => {
                            const filename = trace.filename
                              ?.replace(resolve(__dirname, "../"), "")
                              .replace("/dist/", "/");

                            return `* ${trace.in_app && filename ? "[" : ""}\`${
                              filename
                                ? filename?.includes("node_modules") ||
                                  trace.in_app === false
                                  ? trace.module ?? "unknown"
                                  : filename ?? "unknown"
                                : "unknown"
                            }${trace.lineno ? `:${trace.lineno}` : ""}${
                              trace.colno ? `:${trace.colno}` : ""
                            }\`${
                              trace.in_app && filename
                                ? `](<https://github.com/splatterxl/experiments/blob/new-bot/src/${filename
                                    .replace(/\.js$/, ".ts")
                                    .replace(/^\//, "")}>)`
                                : ""
                            }${
                              trace.function ? ` @ \`${trace.function}\`` : ""
                            }${
                              i === 0 && trace.context_line
                                ? `\n\`\`\`js\n${
                                    trace.pre_context?.join("\n") ?? ""
                                  }\n${
                                    trace.context_line
                                  } // <-- HAPPENED HERE\n${
                                    trace.post_context?.join("\n") ?? ""
                                  }\n\`\`\``
                                : ""
                            }`;
                          })
                          .join("\n") ?? "No stacktrace attached."
                      }${
                        exception.stacktrace?.frames?.length! > 5 ? "\n..." : ""
                      }`
                  ) ??
                  // @ts-ignore
                  hint.originalException.stack ??
                  "No stacktrace attached."
                }`,
                attachments: [
                  {
                    id: 0,
                    filename: "error.json",
                  },
                ],
                username: `${__DEV__ ? "dev" : "prd"}-${event.server_name}-${
                  !__DEV__ ? event.release?.slice(0, 8) ?? "unknown" : "wip"
                }`,
              } as RESTPostAPIChannelMessageFormDataBody,
              files: [
                {
                  data: Buffer.from(JSON.stringify([event, hint], null, 2)),
                  name: "error.json",
                  contentType: "application/json",
                },
              ],
              auth: false,
            }
          )
          // .then(console.log)
          .catch((e) =>
            error("sentry.webhook", "Failed to send error to webhook: ", e)
          );
      })().catch((e) => {
        error("sentry.webhook", "Failed to send error to webhook: ", e);
      });
    }

    if (__DEV__) return null;

    return event;
  },
});

export const log = (
  color: Exclude<keyof typeof kleur, "enabled">,
  level: string,
  scope: string,
  message: string,
  ...args: any[]
) => {
  console.log(
    `${kleur[color](` ${level} `)} ${kleur.bold(scope)} ${kleur.dim(
      new Date().toISOString()
    )} ${message}`,
    ...args
  );

  const lvl = level.trim();

  if (lvl !== "debug") {
    Sentry.addBreadcrumb({
      level: lvl === "warn" ? "warning" : (lvl as Sentry.SeverityLevel),
      category: scope,
      message: message,
      data: args,
      type: "debug",
    });
  }
};

export const info = log.bind(null, "bgBlue", "info ");

export const error = log.bind(null, "bgRed", "error");

export const warn = log.bind(null, "bgYellow", "warn  ");

export const debug = log.bind(null, "gray", "debug");

export const fatal = log.bind(null, "bgMagenta", "fatal");

export function postMaintenance(
  message: string,
  file?: Buffer,
  filename?: string
) {
  if (process.env.MAINTENANCE_WEBHOOK && !__DEV__)
    rest.post(
      new URL(process.env.MAINTENANCE_WEBHOOK).pathname.replace(
        /^\/api(\/v\d{1,2})?/,
        ""
      ) as `/${string}`,
      {
        auth: false,
        versioned: false,
        body: {
          content: `* [${process.env.NODE_ENV}] ${message}`,
          username: hostname(),
          attachments: file
            ? [
                {
                  id: 0,
                  filename: filename ?? "maintenance.txt",
                },
              ]
            : [],
        } as RESTPostAPIChannelMessageFormDataBody,
        files: file
          ? [
              {
                data: file!,
                name: filename ?? "maintenance.txt",
                contentType: "text/plain",
              },
            ]
          : [],
      }
    );
}
