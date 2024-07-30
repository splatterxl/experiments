import { Client } from "discord.js";
import kleur from "kleur";
import { LOADING_COMPLETE } from "../index.js";
import { info } from "../instrument.js";
import { hostname } from "../util.js";

export default async function (c: Client<true>) {
  const uptime = process.uptime();

  info(
    "events.ready",
    `Logged in as ${c.user!.tag}...\n\ttook ${kleur.yellow(
      uptime
    )} secs\n\tspent ${kleur.yellow(
      uptime - LOADING_COMPLETE
    )} secs waiting for READY`
  );

  if (process.env.MAINTENANCE_WEBHOOK)
    c.rest.post(
      new URL(process.env.MAINTENANCE_WEBHOOK).pathname.replace(
        /^\/api(\/v\d{1,2})?/,
        ""
      ) as `/${string}`,
      {
        auth: false,
        versioned: false,
        body: {
          content: `* [${
            process.env.NODE_ENV
          }] Starting on \`${hostname()}\`... took \`${uptime.toFixed(
            4
          )}\` seconds\n\t* of which \`${(
            (uptime - LOADING_COMPLETE) *
            1000
          ).toFixed(2)}\` ms was spent waiting for Discord`,
          username: hostname(),
        },
      }
    );
}
