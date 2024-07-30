import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  Interaction,
} from "discord.js";
import { lastFetchedAt, list } from "../index.js";
import { editMessage, mapOlPlus } from "../util.js";

// TODO: update this to check all the experiments

export default async function (i: CommandInteraction) {
  return i.reply(
    "This command isn't functional right now, please try again later."
  );

  const l = list();

  await i.reply(makeListReply(i as any, l, 0));
  return { success: true };
}

const CONTENT =
  "This list is **not** the list of rollouts that apply to your guild. It is a list of all the experiments currently active from Discord.";

function makeListReply(i: Interaction, l: string[], idx: number) {
  const index = idx * 15;

  return {
    content: CONTENT,
    embeds: [
      i.guild
        ? makeListEmbed(l.slice(index, index + 15), l.length, idx)
        : makeListEmbed(l, l.length, idx),
    ],
    components: makeListComponents(i, idx),
  };
}

function makeListEmbed(show: string[], total: number, idx: number) {
  return {
    title: "Active experiments",
    description: show.map(mapOlPlus(idx * 15)).join("\n"),
    footer: {
      text:
        show.length === total
          ? "Last updated"
          : `Showing page ${idx + 1}/${Math.ceil(
              total / 15
            )}, use buttons to navigate. Last updated`,
    },
    color: 0xffcc00,
    timestamp: new Date(lastFetchedAt).toISOString(),
  };
}

function makeListComponents(i: Interaction, idx: number) {
  return i.guild
    ? [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`list,prev,${idx}`)
              .setLabel("Previous")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(`list,next,${idx}`)
              .setLabel("Next")
              .setStyle(ButtonStyle.Primary)
          )
          .toJSON(),
      ]
    : [];
}

export function handleComponent(
  i: ButtonInteraction,
  command: "prev" | "next",
  idx: string
) {
  let index = +idx;

  const l = list();

  if (isNaN(index)) {
    throw new Error("invalid component index");
  }

  switch (command) {
    case "prev":
      if (index === 0) break;
      index--;
      break;
    case "next":
      if (index === Math.floor(l.length / 15)) break;
      index++;
      break;
    default:
      throw new Error("invalid command");
  }

  return editMessage(i, makeListReply(i as any, l, index));
}
