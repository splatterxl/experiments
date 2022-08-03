import {
  ApplicationCommandOptionType,
  Interaction,
  InteractionType,
  MessageComponentInteraction,
} from "discord.js";
import kleur from "kleur";
import { autocompleteStores, commands } from "../index.js";

export default async function (i: Interaction) {
  try {
    if (i.isChatInputCommand()) {
      const command = commands.get(i.commandName);

      console.info(
        `[${kleur.blue("commands")}::handler] ${i.user.tag} (${kleur.gray(
          i.user.id
        )}) used command ${kleur.green(i.commandName)}`
      );

      if (commands.has(i.commandName)) {
        const result = await command!.handle(i);

        console.debug(
          `[${kleur.blue("commands")}::handler] ${kleur.gray(
            i.user.id
          )} % ${kleur.green(i.commandName)} => ${
            result.success ? "success" : "error"
          } ${kleur.gray(result.error ?? "")}${
            i.options.data.length
              ? (() => {
                  const data = i.options.data
                    .map(
                      (d) =>
                        `\n\t${d.name} => ${
                          ApplicationCommandOptionType[d.type]
                        } : ${
                          d.value ??
                          d.role?.id ??
                          d.user?.id ??
                          d.channel?.id ??
                          d.attachment?.url
                        }`
                    )
                    .join("");
                  return `${kleur.gray(data)}`;
                })()
              : ""
          }`
        );
      } else {
        await i.command?.delete();
        await i.reply({
          content: `Command \`${i.commandName}\` not found.`,
          ephemeral: true,
        });
        console.warn(
          `[${kleur.blue("commands")}::handler] ${kleur.gray(
            i.user.id
          )} % command ${kleur.green(i.commandName)} => not found`
        );
      }
    } else if (i.type === InteractionType.ApplicationCommandAutocomplete) {
      await autocompleteStores.get(i.commandName)?.(i);
    } else if (i.type === InteractionType.MessageComponent) {
      const [scope, ...args] = i.customId.split(",");

      console.debug(
        `[${kleur.blue("commands")}::handler] ${kleur.gray(
          i.user.id
        )} % component ${kleur.green(i.customId)}`
      );
      const component = commands.get(scope);

      if (component && component.handleComponent) {
        await component.handleComponent(i, ...args);
      } else {
        await notFound(i);
      }
    }
  } catch (e) {
    console.error(
      `[${kleur.blue("commands")}::handler] ${kleur.gray(
        i.user.id
      )} % ${kleur.green(InteractionType[i.type])} => ${kleur.red(
        "error"
      )} ${kleur.gray(((e as any)?.stack ?? e) as any)}`
    );
    // @ts-ignore
    if (i.isRepliable())
      try {
        i.reply({
          content: `An error occurred. \`\`\`js\n${e}\n\`\`\``,
          ephemeral: true,
        });
      } catch {}
  }
}

export async function notFound(i: MessageComponentInteraction) {
  console.warn(
    `[${kleur.blue("commands")}::handler] ${kleur.gray(
      i.user.id
    )} % component ${kleur.green(i.customId)} => not found`
  );
  await i.channel?.messages
    .fetch(i.message.id)
    .then((m) => m?.edit({ components: [] }));
  return i.reply({
    content: `Button \`${i.customId}\` not found.`,
    ephemeral: true,
  });
}
