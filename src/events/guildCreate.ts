import { Guild } from "discord.js";
import kleur from "kleur";
import { analytics, info } from "../instrument.js";

export default async function guildCreate(g: Guild) {
  analytics.group({
    anonymousId: g.id,
    groupId: g.id,
    userId: g.ownerId,
    timestamp: new Date(),
    traits: {
      name: g.name,
      createdAt: g.createdAt,
      avatar: g.iconURL(),
    },
  });

  info(
    "guild.add",
    `added to guild ${kleur.bold(g.name)} ${kleur.gray(`${g.id})`)}`
  );
}
