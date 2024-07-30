import { ActivityType, Client } from "discord.js";
import kleur from "kleur";
import { LOADING_COMPLETE } from "../index.js";
import { info, postMaintenance } from "../instrument.js";
import { __DEV__, hostname } from "../util.js";

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

  postMaintenance(
    `Starting on \`${hostname()}\`... took \`${uptime.toFixed(
      4
    )}\` seconds\n\t* of which \`${((uptime - LOADING_COMPLETE) * 1000).toFixed(
      2
    )}\` ms was spent waiting for Discord`
  );

  if (__DEV__) {
    c.user.setActivity({
      name: "development build",
      state: "testing on prod",
      type: ActivityType.Watching,
    });
  }
}
