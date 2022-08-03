import {
  AutocompleteInteraction,
  Client,
  Collection,
  CommandInteraction,
  GatewayIntentBits,
  MessageComponentInteraction,
  Options,
} from "discord.js";
import { readdirSync } from "fs";
import kleur from "kleur";
import { dirname } from "path";
import { loadRollouts } from "./load.js";

const __dirname = dirname(import.meta.url).replace(/^file:\/{2}/, "");

/// --- BOT --- ///

const client = new Client({
  intents: GatewayIntentBits.Guilds,
  makeCache: Options.cacheWithLimits({
    ApplicationCommandManager: 0,
    BaseGuildEmojiManager: 0,
    GuildBanManager: 0,
    GuildEmojiManager: 0,
    GuildInviteManager: 0,
    GuildMemberManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    MessageManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    UserManager: 0,
    ThreadManager: 0,
    VoiceStateManager: 0,
  }),
  allowedMentions: {
    parse: [],
  },
  partials: [],
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(`[${kleur.red("unhandledRejection")}] ${reason}`);
});
process.on("uncaughtException", (err: Error) => {
  console.error(`[${kleur.red("uncaughtException")}] ${err.message}`);
});
process.on("beforeExit", () => {
  console.info(`[${kleur.bold("exit")}] exiting`);
  client.destroy();
});

load();

export const commands = new Collection<
  string,
  {
    handle: (
      i: CommandInteraction
    ) =>
      | { success: boolean; error: string }
      | Promise<{ success: boolean; error: string }>;
    handleComponent: (
      i: MessageComponentInteraction,
      ...args: any[]
    ) => void | Promise<void>;
  }
>();
export const autocompleteStores = new Collection<
  string,
  (i: AutocompleteInteraction) => void | Promise<void>
>();

async function load() {
  for (const event of readdirSync(__dirname + "/events")) {
    const {
      eventName = event.match(/(.*)\.js$/)?.[1],
      default: handler,
      type = "on",
    } = await import(`./events/${event}`);

    client[type as "on"](eventName, handler);

    console.debug(`[${kleur.green("events")}::load] loaded event ${eventName}`);
  }

  for (const command of readdirSync(__dirname + "/commands")) {
    const {
      default: handler,
      name = command.match(/(.*)\.js$/)?.[1],
      handleComponent,
    } = await import(`./commands/${command}`);

    commands.set(name, { handle: handler, handleComponent });

    console.debug(`[${kleur.blue("commands")}::load] loaded command ${name}`);
  }

  for (const autocomplete of readdirSync(__dirname + "/autocomplete")) {
    const { default: handler, name = autocomplete.match(/(.*)\.js$/)?.[1] } =
      await import(`./autocomplete/${autocomplete}`);

    autocompleteStores.set(name, handler);

    console.debug(
      `[${kleur.cyan("autocomplete")}::load] loaded autocomplete store ${name}`
    );
  }

  client.on("debug", (...d: any) =>
    console.debug(kleur.gray("[client::debug]"), ...d.map(kleur.gray))
  );
}

client.login();
loadRollouts();
setInterval(loadRollouts, /* four hours */ 4 * 60 * 60 * 1000);

export * from "./load.js";
