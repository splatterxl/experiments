import { Client } from "discord.js";
import { info } from "../instrument.js";

export default async function (c: Client<true>) {
  info("events.ready", `Logged in as ${c.user!.tag}`);
}
