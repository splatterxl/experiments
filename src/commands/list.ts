import { CommandInteraction } from "discord.js";
import { lastFetchedAt, rollouts } from "../index.js";
import { mapOl } from "../util.js";

export default async function (i: CommandInteraction) {
  await i.reply({
    embeds: [{
      title: "Active experiments",
      description: rollouts.map(r => `${r.data.title} (\`${r.data.id}\`)`).map(mapOl).join("\n"),
      footer: {
        text: "Last updated at"
      },
      color: 0xffcc00,
      timestamp: new Date(lastFetchedAt).toISOString(),
    }]
  });
  return { success: true };
}
