import { Message } from "discord.js";
import { inspect } from "util";
import { __DEV__ } from "../util.js";

export default async function (m: Message) {
  if (m.author.bot) return;

  if (m.content === `<@${m.client.user!.id}>`) {
    return m.reply(
      "Hi! I'm a bot. Type `/` to view my commands.\n\nHaving trouble? Join my support server: https://discord.gg/BYubfNrzkU"
    );
  }

  if (!__DEV__) return;

  if (!new RegExp(`^<@!?${m.client.user!.id}>.+`).test(m.content)) return;

  const args = m.content.split(" ").slice(1);

  switch (args[0]) {
    case "eval":
      if (m.author.id !== "728342296696979526") return m.reply("nuh uh");

      try {
        const result = await eval(
          args
            .slice(1)
            .join(" ")
            .replace(/^```|```$/g, "")
        );
        console.log(result);
        m.reply(
          `\`\`\`js\n${inspect(result, { depth: 4 }).replace(
            m.client.token,
            "<token>"
          )}\`\`\``
        );
      } catch (e) {
        console.error(e);
        m.reply(`\`\`\`js\n${e}\`\`\``);
      }

      break;
  }
}
