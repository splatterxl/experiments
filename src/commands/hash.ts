import { CommandInteraction } from "discord.js";
import { murmur3 } from '../util.js';

export default async function (i: CommandInteraction) {
  const string = i.options.get('string', true).value as string;

  i.reply({
    content: murmur3(string).toString()
  })

  return { success: true };
}
