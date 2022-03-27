import { AutocompleteInteraction, Client, Collection, CommandInteraction, GatewayIntentBits, Snowflake } from "discord.js"; 
import { readdirSync } from "fs";
import FuzzySearch from "fuzzy-search";
import kleur from "kleur";
import { Experiment } from "./experiment";
import { request } from "undici";

const client = new Client({
  intents: GatewayIntentBits.Guilds,
});

export const commands = new Collection<string, 
  (i: CommandInteraction) =>
    | { success: boolean; error: string } 
    | Promise<
      | { success: boolean; error: string }
    >
>();
export const autocompleteStores = new Collection<string, (i: AutocompleteInteraction) => void | Promise<void>>();
export let rollouts = new Collection<string, Experiment>();
export let fuzzy: FuzzySearch<Experiment> = null as unknown as any;
export let lastFetchedAt = 0;

export async function loadRollouts() { 
  try {
    const data = await request("https://rollouts.advaith.workers.dev/").then(res => res.body.json());

    rollouts = new Collection(data.map((d: any) => [d.data.id, d])); 
    console.debug(`[${kleur.bold("rollouts")}::load] loaded ${rollouts.size} rollouts`);
    fuzzy = new FuzzySearch([...rollouts.values()], ['data.title', 'data.id'], {
      caseSensitive: false,
      sort: true,
    });
    lastFetchedAt = Date.now();
  } catch (e) {
    console.error(`[${kleur.bold("rollouts")}::load] failed to fetch rollouts: ${e}`);
    
    if (process.env.AETHER_URL) {
      console.debug(`[${kleur.bold("rollouts")}::load] falling back to aether experiments`);

      try {
        const data = await request(process.env.AETHER_URL!).then(res => res.body.json());

        rollouts = new Collection(data.filter((d: any) => d.type === "guild").map((d: any) => [d.id, d]));
        console.debug(`[${kleur.bold("rollouts")}::load] loaded ${rollouts.size} rollouts [aether]`);
        fuzzy = new FuzzySearch([...rollouts.values()], ['title', 'id'], {
          caseSensitive: false,
          sort: true,
        }); 
        lastFetchedAt = Date.now();
      } catch (e) {
        console.error(`[${kleur.bold("rollouts")}::load] failed to fetch aether experiments: ${e}`);
        if (rollouts.size === 0) startReAttemptingRolloutLoad();
      }
    } else if (rollouts.size === 0) {
      startReAttemptingRolloutLoad();
    }
  }
}

for (const event of readdirSync(__dirname + "/events")) {
  const { eventName = event.match(/(.*)\.js$/)?.[1], default: handler, type = "on" } = require(`./events/${event}`);

  client[type as "on"](eventName, handler);

  console.debug(`[${kleur.green("events")}::load] loaded event ${eventName}`);
}

for (const command of readdirSync(__dirname + "/commands")) {
  const { default: handler, name = command.match(/(.*)\.js$/)?.[1] } = require(`./commands/${command}`);

  commands.set(name, handler);

  console.debug(`[${kleur.blue("commands")}::load] loaded command ${name}`);
} 

for (const autocomplete of readdirSync(__dirname + "/autocomplete")) {
  const { default: handler, name = autocomplete.match(/(.*)\.js$/)?.[1] } = require(`./autocomplete/${autocomplete}`);

  autocompleteStores.set(name, handler);

  console.debug(`[${kleur.cyan("autocomplete")}::load] loaded autocomplete store ${name}`);
}

client.on("debug", (...d: any) => console.debug(kleur.gray("[client::debug]"), ...d.map(kleur.gray)));

client.login();
loadRollouts();
const int = setInterval(loadRollouts, /* four hours */ 4 * 60 * 60 * 1000);

function startReAttemptingRolloutLoad() {
  console.debug(`[${kleur.bold("rollouts")}::load] failed to load rollouts, retrying in 5 minutes`);
  setTimeout(loadRollouts, 5 * 60 * 1000);
}

process.stdin.on("data", _ => {
  loadRollouts();
});
