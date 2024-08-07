import * as Sentry from "@sentry/node";
import { debug } from "console";
import { Collection, version } from "discord.js";
import { existsSync, readFileSync, statSync, writeFileSync } from "fs";
import FuzzySearch from "fuzzy-search";
import { dirname } from "path";
import invariant from "tiny-invariant";
import { URLSearchParams } from "url";
import { Experiment, ExperimentType } from "./experiment.js";
import { VERSION } from "./index.js";
import { error, info, postMaintenance } from "./instrument.js";
import { __DEV__ } from "./util.js";

invariant(process.env.NELLY, "nelly.tools api url not set");

let rollouts = new Collection<string, Experiment>();

let fuzzy: FuzzySearch<Experiment> = null as unknown as any;

export let lastFetchedAt = 0;

const __dirname = dirname(import.meta.url).replace(/^file:\/{2}/, "");

export const getRollouts = () => rollouts;
export const getRollout = (id: string) => rollouts.get(id);
export const getFuzzy = () => fuzzy;

export async function loadRollouts() {
  try {
    const resp = await fetch(
      `${process.env.NELLY}?${new URLSearchParams({
        type: "guild",
      })}`,
      {
        headers: {
          Referer: "https://splt.dev",

          "User-Agent": `Experiments (https://github.com/splatterxl/experiments; ${VERSION}) Node.js/${process.version} Discord.js/${version}`,
        },
      }
    ).then((res) => res.text());

    let result;

    try {
      result = JSON.parse(resp);
    } catch {
      error("rollouts.load", "nelly.tools returned invalid JSON", resp);

      postMaintenance(
        "failed to check rollouts from nelly.tools",
        Buffer.from(resp),
        "response.txt"
      );

      throw new Error("nelly.tools returned invalid JSON");
    }

    if (!result.success || !result.data?.length) {
      postMaintenance(
        "failed to check rollouts from nelly.tools",
        Buffer.from(JSON.stringify(result, null, 2)),
        "response.json"
      );

      throw new Error("nelly.tools returned error");
    }

    rollouts.clear();
    rollouts = rollouts.concat(
      new Collection(
        result.data
          .filter(
            (s: Experiment) => s.exp_id && s.type === ExperimentType.GUILD
          )
          .map((d: any) => [d.exp_id, d])
      )
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
  if (rollouts.size === 0 && existsSync(__dirname + "/../rollouts.json")) {
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
  } else {
    error("rollouts.load.file", "no backup found");
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
