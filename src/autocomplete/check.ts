import { AutocompleteInteraction } from "discord.js";
import { getFuzzy, getRollouts } from "../index.js";
import { removeRolloutsPrefix } from "../util.js";

export default function (i: AutocompleteInteraction) {
  const typing = removeRolloutsPrefix(i.options.getString("experiment", true));

  if (typing.length === 0)
    return i.respond(
      [{ name: "ALL EXPERIMENTS", value: "all" }].concat(
        getRollouts()
          .sort((a, b) => b.exp_id.localeCompare(a.exp_id))
          .map((x) => ({
            name: (x.title ?? x.exp_id).slice(0, 100),
            value: x.exp_id,
          }))
          .slice(0, 24)
      )
    );

  let res =
    getFuzzy()
      ?.search(typing)
      .map((x: any) => ({
        name: (x.title ?? x.exp_id).slice(0, 100),
        value: x.exp_id,
      }))
      .slice(0, 24) ?? [];

  if (typing.length <= 3)
    res.unshift({ name: "ALL EXPERIMENTS", value: "all" });
  else if (typing.startsWith("all"))
    return [{ name: "All experiments returned by Discord", value: "all" }];

  return i.respond(res);
}
