import { captureException } from "@sentry/node";
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  Interaction,
  InteractionType,
  MessageComponentInteraction,
} from "discord.js";
import kleur from "kleur";
import { inspect } from "util";
import { autocompleteStores, commands } from "../index.js";
import { debug, error, info, warn } from "../instrument.js";
import { __DEV__ } from "../util.js";

export default async function (i: Interaction) {
  const fingerprint = [InteractionType[i.type]];

  let args = (
    i as Interaction & {
      options?: ChatInputCommandInteraction["options"];
    }
  ).options
    ? Object.fromEntries(
        (
          i as Interaction & {
            options: ChatInputCommandInteraction["options"];
          }
        ).options!.data.map((d) => [
          d.name,
          d.value ??
            d.role?.id ??
            d.user?.id ??
            d.channel?.id ??
            d.attachment?.url,
        ])
      )
    : {};

  try {
    if (i.isChatInputCommand()) {
      const command = commands.get(i.commandName);

      fingerprint.push(i.commandName);

      info(
        "commands.handler",
        `${i.user.tag} (${kleur.gray(i.user.id)}) used command ${kleur.green(
          i.commandName
        )}`
      );

      if (commands.has(i.commandName)) {
        const started = performance.now();

        const result = await command!.handle(i);

        const ended = performance.now();

        fingerprint.push(
          result ? (result.success ? "success" : "error") : "completed"
        );

        info(
          "commands.handler",
          `${kleur.gray(i.user.id)} % ${kleur.green(i.commandName)} => ${
            result ? (result.success ? "success" : "error") : "completed"
          } in ${ended - started}ms. ${kleur.gray(result?.error ?? "")}${
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
        fingerprint.push("not_found");

        await i.command?.delete();
        await i.reply({
          content: `Command \`${i.commandName}\` not found.`,
          ephemeral: true,
        });

        warn(
          "commands.handler",
          `${kleur.gray(i.user.id)} % command ${kleur.green(
            i.commandName
          )} => not found`
        );
      }
    } else if (i.type === InteractionType.ApplicationCommandAutocomplete) {
      fingerprint.push("autocomplete", i.commandName);

      await autocompleteStores.get(i.commandName)?.(i);
    } else if (i.type === InteractionType.MessageComponent) {
      fingerprint.push("component", ComponentType[i.componentType]);

      if (i.message.interaction?.user.id !== i.user.id) {
        fingerprint.push("not_author");

        await i.reply({
          content: `I'm sorry, ${i.user.toString()}, I'm afraid I can't do that.`,
          ephemeral: true,
        });
        return;
      }

      const [scope, ...params] = i.customId.split(",");

      args = { scope, rest: params.join(",") };

      debug(
        "commands.handler",
        `${kleur.gray(i.user.id)} % component ${kleur.green(i.customId)}`
      );
      const component = commands.get(scope);

      if (component && component.handleComponent) {
        await component.handleComponent(i, ...params);

        fingerprint.push("handled");
      } else {
        await notFound(i);

        fingerprint.push("not_found");
      }
    }
  } catch (e) {
    captureException(e, (scope) => {
      scope.setTags({
        replied: i.isRepliable(),
        guild_id: i.guildId,
        guild_name: i.guild?.name,
        channel_id: i.channelId,
        channel_type: i.channel && ChannelType[i.channel?.type ?? 0],
        ...args,
      });

      scope.setUser({
        id: i.user.id,
        username: i.user.username,
      });

      scope.setFingerprint(fingerprint);

      scope.setTransactionName(`events.handle_interaction`);

      return scope;
    });

    error(
      "commands.handler",
      `${kleur.gray(i.user.id)} % ${kleur.green(
        InteractionType[i.type]
      )} => ${kleur.red("error")} ${kleur.gray(
        ((e as any)?.stack ?? e) as any
      )}`
    );

    // @ts-ignore
    if (i.isRepliable())
      try {
        i.reply({
          content: __DEV__
            ? ""
            : `An error occurred. The developers have been notified. \`\`\`js\n${e}\n\`\`\``,
          files: __DEV__
            ? [
                new AttachmentBuilder(
                  Buffer.from(
                    (e as Error).stack ??
                      inspect(e, {
                        colors: false,
                        compact: false,
                        depth: 999,
                      })
                  ),
                  {
                    name: "data.txt",
                  }
                ),
              ]
            : [],
          ephemeral: true,
        });
      } catch {}
  }
}

export async function notFound(i: MessageComponentInteraction) {
  warn(
    "commands.handler",
    `${kleur.gray(i.user.id)} % component ${kleur.green(
      i.customId
    )} => not found`
  );
  await i.channel?.messages
    .fetch(i.message.id)
    .then((m) => m?.edit({ components: [] }));
  return i.reply({
    content: `Button \`${i.customId}\` not found.`,
    ephemeral: true,
  });
}
