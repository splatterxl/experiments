#!/usr/bin/env node
const { REST } = require("@discordjs/rest");
const {
  Routes,
  ApplicationCommandOptionType,
} = require("discord-api-types/v10");

if (!process.env.DISCORD_TOKEN)
  throw new Error("invariant failed: DISCORD_TOKEN");

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

!(async () => {
  /** @type {import("discord-api-types/v10").RESTGetAPIOAuth2CurrentApplicationResult} */
  const application = await rest.get(Routes.oauth2CurrentApplication());

  /** @type {import("discord-api-types/v10").RESTPutAPIApplicationCommandsJSONBody} */
  const body = [
    {
      name: "view",
      description: "View a specific experiment",
      options: [
        {
          name: "id",
          description: "ID of the experiment to view",
          name_localizations: {},
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "page",
          description: "Page to view (default: 'home')",
          name_localizations: {},
          type: ApplicationCommandOptionType.String,
          required: false,
          choices: [
            {
              name: "home",
              name_localizations: {},
              value: "home",
            },
            {
              name: "rollout",
              name_localizations: {},
              value: "rollout",
            },
            {
              name: "overrides",
              name_localizations: {},
              value: "overrides",
            },
          ],
        },
      ],
    },
    {
      name: "list",
      description: "Shows a list of currently active experiments in your guild",
      dm_permission: false,
      contexts: [0],
    },
    {
      name: "invite",
      description: "Invite the bot to your server!",
    },
    {
      name: "check",
      description: "Check if an experiment is active in your guild",
      dm_permission: false,
      options: [
        {
          name: "experiment",
          description: "ID of the experiment to check",
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "id",
          description: "Guild ID to check against (default: current guild)",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
      contexts: [0],
    },
    {
      name: "info",
      description: "Get info about the bot",
    },
    {
      name: "hash",
      description: "Perform a MurmurHash3 on a string",
      options: [
        {
          name: "string",
          description: "The string to hash",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ].map((v) => ({ contexts: [0, 1, 2], integration_types: [0, 1], ...v }));

  /** @type {import("discord-api-types/v10").RESTPutAPIApplicationCommandsResult} */
  const res = await rest.put(Routes.applicationCommands(application.id), {
    body,
  });

  console.info(`PUT ${res.length} commands`);
})();
