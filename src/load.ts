import FuzzySearch from "fuzzy-search";
import kleur from "kleur";
import { Experiment } from "./experiment";
import { request } from "undici";
import { Collection } from "discord.js";
import { readFileSync, statSync, writeFileSync } from "fs";

export let rollouts = new Collection<string, Experiment>();
export let fuzzy: FuzzySearch<Experiment> = null as unknown as any;
export let lastFetchedAt = 0;

export async function loadRollouts() { 
  try {
    const data = await request("https://rollouts.advaith.workers.dev/", { 
      headers: { 
        Referer: "https://splatterxl.github.io" 
      }
    }).then(res => res.body.json());

    rollouts = new Collection(data.map((d: any) => [d.data.id, d])); 
    console.debug(`[${kleur.bold("rollouts")}::load] loaded ${rollouts.size} rollouts`);
    fuzzy = new FuzzySearch([...rollouts.values()], ['data.title', 'data.id'], {
      caseSensitive: false,
      sort: true,
    });
    lastFetchedAt = Date.now();

    backupRollouts();
  } catch (e) {
    console.error(`[${kleur.bold("rollouts")}::load] failed to fetch rollouts: ${e}`);
    
    if (process.env.AETHER_URL) {
      try {
        const data = await request(process.env.AETHER_URL!).then(res => res.body.json());

        rollouts = new Collection(data.filter((d: any) => d.type === "guild").map((d: any) => [d.id, d]));
        console.debug(`[${kleur.bold("rollouts")}::load] loaded ${rollouts.size} rollouts [aether]`);
        fuzzy = new FuzzySearch([...rollouts.values()], ['title', 'id'], {
          caseSensitive: false,
          sort: true,
        }); 
        lastFetchedAt = Date.now();

        backupRollouts();
      } catch (e) {
        console.error(`[${kleur.bold("rollouts")}::load] failed to fetch aether experiments: ${e}`);
        if (rollouts.size === 0) startReAttemptingRolloutLoad();
      }
    } else if (rollouts.size === 0) {
      startReAttemptingRolloutLoad();
    }
  }
}

function startReAttemptingRolloutLoad() {
  console.debug(`[${kleur.bold("rollouts")}::load] failed to load rollouts, retrying in 5 minutes`);
  if (rollouts.size === 0) {
    try {
      const data = JSON.parse(readFileSync(__dirname + "/../rollouts.json", "utf-8"));

      rollouts = new Collection(data.map((d: any) => [d.data.id, d]));
      console.debug(`[${kleur.bold("rollouts")}::load] loaded ${rollouts.size} rollouts [file]`);
      fuzzy = new FuzzySearch([...rollouts.values()], ['data.title', 'data.id'], {
        caseSensitive: false,
        sort: true,
      });
      lastFetchedAt = statSync(__dirname + "/../rollouts.json").mtimeMs;
    } catch (e) {
      // invalid/missing backups
      console.error(`[${kleur.bold("rollouts")}::load] failed to load rollouts from backup: ${e}`);
    }
  }
  setTimeout(loadRollouts, 5 * 60 * 1000);
}

// this isn't going to be corrupted because it's gonna be only done every four hours
function backupRollouts() {
  console.debug(`[${kleur.bold("rollouts")}::backup] backing up ${rollouts.size} rollouts`);
  try {
    const data = JSON.stringify([...rollouts.values()]);
    writeFileSync(__dirname + "/../rollouts.json", data, "utf8");

    console.info(`[${kleur.bold("rollouts")}::backup] backed up ${rollouts.size} rollouts`);
  } catch {
    // trollface
  }
}
