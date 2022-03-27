import { ApplicationCommandOptionType, Interaction } from "discord.js";
import kleur from "kleur";
import { autocompleteStores, commands } from "..";

export default async function (i: Interaction) {
  if (i.isCommand()) {
    const command = commands.get(i.commandName);

    console.info(`[${kleur.blue("commands")}::handler] ${i.user.tag} (${kleur.gray(i.user.id)}) used command ${kleur.green(i.commandName)}`);

    if (commands.has(i.commandName)) {
      const result = await command!(i);

      console.debug(`[${kleur.blue("commands")}::handler] ${kleur.gray(i.user.id)} % ${kleur.green(i.commandName)} => ${result.success ? "success" : "error"} ${kleur.gray(result.error ?? "")}${i.options.data.length ? (() => {
        const data = i.options.data.map((d) => `\n\t${d.name} => ${ApplicationCommandOptionType[d.type]} : ${d.value ?? d.role?.id ?? d.user?.id ?? d.channel?.id ?? d.attachment?.url}`).join("");
        return `${kleur.gray(data)}`;
      })() : ""}`);
    } else {
      await i.command?.delete();
      i.reply({
        content: `Command \`${i.commandName}\` not found.`,
        ephemeral: true,
      });
      console.warn(`[${kleur.blue("commands")}::handler] ${kleur.gray(i.user.id)} tried to use command ${kleur.green(i.commandName)} but it was not found.`);
    }
  } else if (i.isAutocomplete()) {
    autocompleteStores.get(i.commandName)?.(i);
  } 
}
