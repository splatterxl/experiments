import * as Sentry from "@sentry/node";
import { debug } from "console";
import { Collection, version } from "discord.js";
import { readFileSync, statSync, writeFileSync } from "fs";
import FuzzySearch from "fuzzy-search";
import { dirname } from "path";
import invariant from "tiny-invariant";
import { URLSearchParams } from "url";
import { Experiment, ExperimentType } from "./experiment.js";
import { error, info } from "./instrument.js";
import { __DEV__ } from "./util.js";

invariant(process.env.NELLY, "nelly.tools api url not set");

export let rollouts = new Collection<string, Experiment>(),
  list = () =>
    rollouts
      .sort((a, b) => b.exp_id.localeCompare(a.exp_id))
      .map((r) => `${r.title} (\`${r.exp_id}\`)`);
export let fuzzy: FuzzySearch<Experiment> = null as unknown as any;
export let lastFetchedAt = 0;

const __dirname = dirname(import.meta.url).replace(/^file:\/{2}/, "");

export async function loadRollouts() {
  try {
    const result = await fetch(
      `${process.env.NELLY}?${new URLSearchParams({
        type: "guild",
      })}`,
      {
        headers: {
          Referer: "https://splatterxl.github.io",
          "User-Agent": `Experiments (https://github.com/splatterxl/experiments; 2.0.0) Node.js/${process.version} Discord.js/${version}`,
        },
      }
    ).then((res) => res.json());

    if (!result.success) throw new Error("nelly.tools returned error");

    rollouts = new Collection(
      result.data
        .filter((s: Experiment) => s.exp_id && s.type === ExperimentType.GUILD)
        .map((d: any) => [d.exp_id, d])
    );
    info("rollouts.load", `loaded ${rollouts.size} rollouts`);
    fuzzy = new FuzzySearch(
      [...rollouts.values()],
      ["title", "exp_id", "hash_key"],
      {
        caseSensitive: false,
        sort: true,
      }
    );
    lastFetchedAt = Date.now();

    if (!__DEV__) backupRollouts();
  } catch (e) {
    Sentry.captureException(e);

    error("rollouts.load", `failed to fetch rollouts: ${e}`);

    // if (process.env.AETHER_URL) {
    //   try {
    //     const data = await request(process.env.AETHER_URL!).then((res) =>
    //       res.body.json()
    //     );

    //     rollouts = new Collection(
    //       data.filter((d: any) => d.type === "guild").map((d: any) => [d.id, d])
    //     );
    //     console.debug(
    //       `[${kleur.bold("rollouts")}::load] loaded ${
    //         rollouts.size
    //       } rollouts [aether]`
    //     );
    //     fuzzy = new FuzzySearch([...rollouts.values()], ["title", "id"], {
    //       caseSensitive: false,
    //       sort: true,
    //     });
    //     lastFetchedAt = Date.now();

    //     backupRollouts();
    //   } catch (e) {
    //     console.error(
    //       `[${kleur.bold(
    //         "rollouts"
    //       )}::load] failed to fetch aether experiments: ${e}`
    //     );
    //     if (rollouts.size === 0) startReAttemptingRolloutLoad();
    //   }
    // }

    if (rollouts.size === 0) {
      startReAttemptingRolloutLoad();
    }
  }
}

function startReAttemptingRolloutLoad() {
  error("rollouts.load", "failed to load rollouts, retrying in 5 minutes");
  if (rollouts.size === 0) {
    try {
      const data = JSON.parse(
        readFileSync(__dirname + "/../rollouts.json", "utf-8")
      );

      rollouts = new Collection(data.map((d: any) => [d.exp_id, d]));

      info("rollouts.load.file", `loaded ${rollouts.size} rollouts [file]`);

      fuzzy = new FuzzySearch(
        [...rollouts.values()],
        ["data.title", "data.id"],
        {
          caseSensitive: false,
          sort: true,
        }
      );
      lastFetchedAt = statSync(__dirname + "/../rollouts.json").mtimeMs;
    } catch (e) {
      Sentry.captureException(e);
      // invalid/missing backups
      error("rollouts.load.file", `failed to load rollouts from backup: ${e}`);
    }
  }
  setTimeout(loadRollouts, 5 * 60 * 1000);
}

// this isn't going to be corrupted because it's gonna be only done every four hours
function backupRollouts() {
  // return;
  debug("rollouts.backup", `backing up ${rollouts.size} rollouts`);

  try {
    const data = JSON.stringify([...rollouts.values()]);
    writeFileSync(__dirname + "/../rollouts.json", data, "utf8");

    info("rollouts.backup", `backed up ${rollouts.size} rollouts`);
  } catch (e) {
    Sentry.captureException(e);
    // trollface
  }
}
