import { AutocompleteInteraction } from "discord.js";
import { getFuzzy, getRollouts } from "../index.js";
import { removeRolloutsPrefix } from "../util.js";

export default function (i: AutocompleteInteraction) {
  const typing = removeRolloutsPrefix(i.options.getString("id", true));

  if (typing.length === 0)
    return i.respond(
      getRollouts()
        .sort((a, b) => b.exp_id.localeCompare(a.exp_id))
        .map((x) => ({
          name: (x.title ?? x.exp_id).slice(0, 100),
          value: x.exp_id,
        }))
        .slice(0, 24)
    );

  const res =
    getFuzzy()
      ?.search(typing)
      .map((x: any) => ({
        name: (x.title ?? x.exp_id).slice(0, 100),
        value: x.exp_id,
      }))
      .slice(0, 24) ?? [];

  return i.respond(res);
}
