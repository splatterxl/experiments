const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandOptionType } = require("discord-api-types/v10");

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

!(async()=>{

  /** @type {import("discord-api-types/v10").RESTGetAPIOAuth2CurrentApplicationResult} */
  const application = await rest.get(Routes.oauth2CurrentApplication());

  /** @type {import("discord-api-types/v10").RESTPutAPIApplicationCommandsJSONBody} */
  const body = [
    { 
      name: "view",
      description: "View a specific experiment",
      name_localizations: {
        fr: "voir",
      },
      description_localizations: {
        fr: "Voir un expérience spécifique",
      },
      options: [
        {
          name: "id",
          description: "ID of the experiment to view",
          name_localizations: {},
          description_localizations: {
            fr: "L'ID de l'expérience",
          },
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
        {
          name: "page",
          description: "Page to view (default: 'home')",
          name_localizations: {},
          description_localizations: {
            fr: "Page à afficher (par défaut: 'home')",
          },
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
      description: "Shows a list of currently active experiments",
      name_localizations: {},
      description_localizations: {
        fr: "Affiche la liste des expériences actives",
      },
    },
    { 
      name: "invite",
      description: "Invite the bot to your server!",
      name_localizations: {},
      description_localizations: {
        fr: "Invite le bot sur votre serveur!",
      },
    },
    {
      name: "check",
      description: "Check if an experiment is active in your guild",
      dm_permission: false,
      name_localizations: {},
      description_localizations: {
        fr: "Vérifie si une expérience est active dans votre serveur",
      },
      options: [
        {
          name: "id",
          description: "ID of the experiment to check",
          name_localizations: {},
          description_localizations: {
            fr: "L'ID de l'expérience à vérifier",
          },
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    }
  ];

  /** @type {import("discord-api-types/v10").RESTPutAPIApplicationCommandsResult} */
  const res = await rest.put(Routes.applicationCommands(application.id), {
    body,
  });

  console.info(`PUT ${res.length} commands`);

})();
