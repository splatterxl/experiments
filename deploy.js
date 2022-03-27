const { REST } = require("@discordjs/rest");
const { Routes, ApplicationCommandOptionType } = require("discord-api-types/v10");

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

!(async()=>{

  /** @type {import("discord-api-types/v10").RESTGetAPIOAuth2CurrentApplicationResult} */
  const application = await rest.get(Routes.oauth2CurrentApplication());

  /** @type {import("discord-api-types/v10").RESTPutAPIApplicationCommandsJSONBody} */
  const body = [{ 
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
        name_localizations: {
          fr: "id",
        },
        description_localizations: {
          fr: "L'ID de l'expérience",
        },
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
      },
    ],
  }];

  /** @type {import("discord-api-types/v10").RESTPutAPIApplicationCommandsResult} */
  const res = await rest.put(Routes.applicationCommands(application.id), {
    body,
  });

  console.info(`PUT ${res.length} commands`);

})();
