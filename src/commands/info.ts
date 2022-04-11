import { ButtonStyle, OAuth2Scopes } from "discord-api-types/v10";
import { CommandInteraction, ComponentType } from "discord.js";

export default function (i: CommandInteraction) {
  return i.reply({
    embeds: [
      {
        color: 0xffcc00,
        thumbnail: {
          url: i.client.user!.displayAvatarURL({
            size: 128,
          }),
        },
        title: "Experiments",
        description:
          "I'm a small bot made by <@957383358592217088> to explore Discord guild experiments. Type `/` to view my commands.",
      },
    ],
    components: [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            label: "Source code",
            link: "https://github.com/splatterxl/experiments",
          },
          {
            label: "Privacy policy",
            link: "https://github.com/splatterxl/experiments/blob/main/privacy.md",
          },
          {
            label: "Invite",
            link: i.client.generateInvite({
              scopes: [OAuth2Scopes.ApplicationsCommands],
            }),
          },
        ].map((v) => ({
          type: ComponentType.Button,
          style: ButtonStyle.Link,
          url: v.link,
          label: v.label,
        })),
      },
    ],
  });
}
